const drafts = require('express').Router();
const slugify = require('slugify');
const { requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

const article_query = `SELECT * FROM articles WHERE id = $1;`
const article_id_select_query = `SELECT * FROM drafts WHERE article_id = $1;`;
const id_select_query = `SELECT * FROM drafts WHERE id = $1;`;
const total_query = `SELECT COUNT(*) FROM drafts;`
const list_query = `SELECT
  drafts.id, drafts.title, drafts.category, drafts.author, drafts.creation_time,
  COALESCE(drafts.modified_time, drafts.creation_time) as modified_time,
  articles.slug as article_slug
  FROM drafts
  LEFT JOIN articles ON drafts.id = articles.id
  ORDER BY modified_time DESC
  LIMIT $1 OFFSET $2;`

const new_draft_query = `INSERT INTO
  drafts(article_id, title, author, description, content, category, tags, image)
  VALUES(NULL, '', '', '', '', '', ARRAY[]::VARCHAR[], '')
  RETURNING id;`;
const transfer_query = `INSERT INTO
  drafts(article_id, title, author, description, content, category, tags, image)
  SELECT id, title, author, description, content, category, tags, image
  FROM articles
  WHERE id = $1
  ON CONFLICT DO NOTHING;`;
const redirect_query = `INSERT INTO
  redirects(from_slug, to_slug)
  SELECT slug, $2::varchar
  FROM articles
  WHERE id = $1 AND slug != $2
  ON CONFLICT (from_slug)
  DO UPDATE
    SET to_slug = $2
  RETURNING from_slug, to_slug;`;
// If the new from_slug is an old to_slug, update to the new to_slug
const redirect_cascade_query = `UPDATE redirects SET to_slug = $1 WHERE to_slug = $2;`
const publish_archive_query = `INSERT INTO
  archives(title, slug, author, description, creation_time, update_time, content, category, tags, image)
  SELECT title, slug, author, description, creation_time, update_time, content, category, tags, image
  FROM articles
  WHERE id = $1`;

const save_query = `UPDATE drafts
  SET title = $2, author = $3, description = $4,
    modified_time = CURRENT_TIMESTAMP,
    content = $5, category = $6, tags = $7, image = $8
  WHERE id = $1
  RETURNING *;`;
const initial_publish_query = `INSERT INTO
  articles(title, slug, author, description, content, category, tags, image)
  VALUES($1, $2, $3, $4, $5, $6, $7, $8);`;
const update_publish_query = `UPDATE articles
  SET title = $2, slug = $3, author = $4,
    description = $5, update_time = CURRENT_TIMESTAMP,
    content = $6, category = $7, tags = $8, image = $9
    WHERE id = $1;`;

const delete_draft_query = `DELETE FROM drafts WHERE id = $1;`;

// Returns the draft associated with the article with the given ID
// First creating a draft if one does not exist
drafts.get('/article/:id', requiresAdmin, async (req, res) =>{
  const article_id = parseInt(req.params.id);
  if (!article_id) {
    res.status(400).send("Bad article ID");
    return;
  }
  const article_exists = await pool
    .query(article_query, [article_id])
    .then(db_res => db_res.rows.length != 0)
    .catch(e => res.status(500).send(e.stack));
  if (!article_exists) {
    res.status(404).send(`Article with ID ${article_id} does not exist`);
    return;
  }

  await pool
    .query(transfer_query, [article_id])
    .catch(e => res.status(500).send(e.stack));
  await pool
    .query(article_id_select_query, [article_id])
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

drafts.route('/')
  .all(requiresAdmin)
  .get(async (req, res) => {
    const count = Math.max(req.query.count || 40, 120);
    const page = req.query.page || 1;
    await pool
      .query(list_query, [count, count * (page - 1)])
      .then(db_res => res.status(200).send(db_res.rows))
      .catch(e => res.status(500).send(e.stack));
  })
  .post(async (req, res) => {
    // Creates a new draft, returning its unique ID
    await pool
      .query(new_draft_query)
      .then(db_res => res.status(201).send(db_res.rows[0]))
      .catch(e => res.status(500).send(e.stack));
  });

drafts.get("/count", requiresAdmin, async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

drafts.route('/:id')
  .all(requiresAdmin)
  .put(async (req, res) => {
    // Corresponds to saving the draft
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(400).send("Bad draft ID");
      return;
    }

    const {title, author, description, content, category, tags, image} = req.body;
    await pool
      .query(save_query, [id, title, author, description, content, category, tags, image])
      .then(_ => res.status(200).send())
      .catch(e => res.status(500).send(e.stack));
  })
  .get(async (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(400).send("Bad draft ID");
      return;
    }

    const db_rows = await pool
      .query(id_select_query, [id])
      .then(db_res => db_res.rows)
      .catch(e => res.status(500).send(e.stack));

    if (db_rows.length == 0) {
      res.status(404).send(`Draft with ID ${id} does not exist`);
    } else {
      res.status(200).send(db_rows[0]);
    }
  });

drafts.post('/publish/:id', requiresAdmin, async (req, res) => {
  // Publish the draft with a given ID,
  // either updating an existing article or making a new one
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send("Bad draft ID");
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const drafts = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (drafts.length == 0) {
      throw new Error(`Draft with ID ${id} does not exist`);
    }
    const draft = drafts[0];
    const {title, author, description, content, category, tags, image} = ('title' in req.body) ? req.body : draft;
    const slug = slugify(title, { lower: true, strict: true });

    if (!!draft.article_id) {
      // If a corresponding article exists, update it
      // First, add redirect to redirects table (if slug changed)
      const redirect = await client
        .query(redirect_query, [draft.article_id, slug])
        .then(db_res => db_res.rows[0]);
      if (redirect) {
        await client.query(redirect_cascade_query, [redirect.to_slug, redirect.from_slug]);
      }

      // Then, make an archive
      await client.query(publish_archive_query, [draft.article_id]);

      await client.query(update_publish_query,
        [draft.article_id, title, slug, author, description, content, category, tags, image]);
    } else {
      // Otherwise, make a new one
      await client.query(initial_publish_query,
        [title, slug, author, description, content, category, tags, image]);
    }

    // Finally, delete the draft
    await client.query(delete_draft_query, [id]);

    await client.query('COMMIT');
    res.status(201).send(slug);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e.stack);
    res.status(500).send(e.stack);
  } finally {
    client.release();
  }
});

module.exports = drafts;