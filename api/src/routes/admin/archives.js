const archives = require('express').Router();
const slugify = require('../../helpers/slugify.js');
const { requiresAdmin } = require('../../middleware/auth.js');
const pool = require('../../db/pool.js');

const id_select_query = 'SELECT id FROM archives WHERE id = $1;';
const total_query = 'SELECT COUNT(*) FROM archives;';
const list_query = `SELECT
  id, title, category, author, archive_time, creation_time, update_time
  FROM archives
  ORDER BY archive_time DESC
  LIMIT $1 OFFSET $2;`;
const article_slug_query = `SELECT slug FROM articles
  WHERE slug IN (SELECT slug FROM archives WHERE id = $1);`;

const republish_query = `INSERT INTO
  articles(title, slug, author, description, creation_time, update_time, content, category, tags, image)
  SELECT title, slug, author, description, creation_time, update_time, content, category, tags, image
  FROM archives
  WHERE id = $1;`;
const delete_archive_query = 'DELETE FROM archives WHERE id = $1;';
const trash_query = `INSERT INTO
  trash(title, author, description, creation_time, update_time,
    content, category, tags, image, doc_type)
  SELECT title, author, description, creation_time, update_time,
    content, category, tags, image, 'article'
  FROM archives
  WHERE id = $1;`;

const rename_query = 'UPDATE archives SET title = $2, slug = $3 WHERE id = $1;';

archives.route('/')
  .all(requiresAdmin)
  .get(async (req, res) => {
    const count = Math.min(req.query.count || 20, 120);
    const page = req.query.page || 1;
    await pool
      .query(list_query, [count, count * (page - 1)])
      .then(db_res => res.status(200).send(db_res.rows))
      .catch(e => res.status(500).send(e.stack));
  });

archives.delete('/:id', requiresAdmin, async (req, res) => {
  // Copy an archive to the trash table, then delete the archive
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send('Bad archive ID');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const archives = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (archives.length == 0) {
      throw new Error(`Archive with ID ${id} does not exist`);
    }

    await client.query(trash_query, [id]);
    await client.query(delete_archive_query, [id]);

    await client.query('COMMIT');
    res.status(200).send();
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e.stack);
    res.status(500).send(e.stack);
  } finally {
    client.release();
  }
});

archives.get('/count', requiresAdmin, async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

archives.put('/rename/:id', requiresAdmin, async (req, res) => {
  // Rename an archive and generate its new slug
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send('Bad archive ID');
    return;
  }

  const archives = await pool
    .query(id_select_query, [id])
    .then(db_res => db_res.rows);
  if (archives.length == 0) {
    res.status(404).send(`Archive with ID ${id} does not exist`);
    return;
  }

  const new_title = req.body.title;
  if (!new_title) {
    res.status(400).send('Invalid or missing title');
    return;
  }
  const new_slug = slugify(new_title);

  await pool
    .query(rename_query, [id, new_title, new_slug])
    .then(() => res.status(200).send())
    .catch(e => res.status(500).send(e.stack));
});

archives.post('/republish/:id', requiresAdmin, async (req, res) => {
  // Copy an archive to the articles table, then delete the archive
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send('Bad archive ID');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const archives = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (archives.length == 0) {
      throw new Error(`Archive with ID ${id} does not exist`);
    }

    const conflicts = await client
      .query(article_slug_query, [id])
      .then(db_res => db_res.rows);
    if (conflicts.length != 0) {
      const err = `Article with slug ${conflicts[0].slug} already exists`;
      res.status(409).send(err);
      throw new Error(err);
    }

    await client.query(republish_query, [id]);
    await client.query(delete_archive_query, [id]);

    await client.query('COMMIT');
    res.status(200).send();
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e.stack);
    if (!res.headersSent) {
      res.status(500).send(e.stack);
    }
  } finally {
    client.release();
  }
});

module.exports = archives;