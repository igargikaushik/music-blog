const articles = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

const id_select_query = 'SELECT id FROM articles WHERE id = $1;';
const total_query = 'SELECT COUNT(*) FROM articles_drafts;';
const articles_drafts_query = `SELECT
  id, title, category, author, creation_time, modified_time, is_draft
  FROM articles_drafts
  ORDER BY modified_time DESC
  LIMIT $1 OFFSET $2;`;

const trash_query = `INSERT INTO
  trash(title, author, description, creation_time, update_time, content, category, tags, image, doc_type)
  SELECT title, author, description, creation_time, update_time, content, category, tags, image, 'article'
  FROM articles
  WHERE id = $1;`;
const archive_query = `INSERT INTO
  archives(title, slug, author, description, creation_time, update_time, content, category, tags, image)
  SELECT title, slug, author, description, creation_time, update_time, content, category, tags, image
  FROM articles
  WHERE id = $1;`;
const unpublish_query = `INSERT INTO
  drafts(title, author, description, content, category, tags, image)
  SELECT title, author, description, content, category, tags, image
  FROM articles
  WHERE id = $1;`;
const delete_article_query = 'DELETE FROM articles WHERE id = $1;';

const linked_draft_query = 'SELECT id FROM drafts WHERE article_id = $1;';
// Ensure archive/deletion doesn't create dangling pointer
const unlink_draft_query = 'UPDATE drafts SET article_id = NULL WHERE article_id = $1;';

articles.get('/count', requiresAdmin, async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

articles.get('/', requiresAdmin, async (req, res) => {
  const count = Math.max(req.query.count || 20, 120);
  const page = req.query.page || 1;
  await pool
    .query(articles_drafts_query, [count, count * (page - 1)])
    .then(db_res => res.status(200).send(db_res.rows))
    .catch(e => res.status(500).send(e.stack));
});

articles.delete('/:id', requiresAdmin, async (req, res) => {
  // Copy an article to the trash table, then delete the article
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send('Bad article ID');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const articles = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (articles.length == 0) {
      throw new Error(`Article with ID ${id} does not exist`);
    }

    await client.query(unlink_draft_query, [id]);
    await client.query(trash_query, [id]);
    await client.query(delete_article_query, [id]);

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

articles.post('/archive/:id', requiresAdmin, async (req, res) => {
  // Copy an article to the archives table, then delete the article
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send('Bad article ID');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const articles = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (articles.length == 0) {
      throw new Error(`Article with ID ${id} does not exist`);
    }

    await client.query(unlink_draft_query, [id]);
    await client.query(archive_query, [id]);
    await client.query(delete_article_query, [id]);

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

articles.post('/unpublish/:id', requiresAdmin, async (req, res) => {
  // Move an article to the drafts table, then delete the article
  // If there already exists a draft, send 409 so the client can delete it
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send('Bad article ID');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const articles = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (articles.length == 0) {
      throw new Error(`Article with ID ${id} does not exist`);
    }

    const linked = await client
      .query(linked_draft_query, [id])
      .then(db_res => db_res.rows);
    if (linked.length != 0) {
      const err = `Article with ID ${id} already has a draft`;
      res.status(409).send(err);
      throw new Error(err);
    }

    await client.query(unpublish_query, [id]);
    await client.query(delete_article_query, [id]);

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

module.exports = articles;