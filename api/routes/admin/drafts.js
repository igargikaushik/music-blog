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
// $2 and $3 should be the same, both equalling the old slug
// They are different since they deduce to different data types
// TODO: What if it changes multiple times? Old mappings should update, too.
const redirect_query = `INSERT INTO
  redirects(from_slug, to_slug)
  SELECT slug, $3
  FROM articles
  WHERE id = $1 AND slug != $2
  ON CONFLICT (from_slug)
  DO UPDATE
    SET to_slug = $2;`;
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

  const drafts = await pool
    .query(id_select_query, [id])
    .then(db_res => db_res.rows)
    .catch(e => res.status(500).send(e.stack));
  if (drafts.length == 0) {
    res.status(500).send(`Draft with ID ${id} does not exist`);
    return;
  }
  const draft = drafts[0];
  const {title, author, description, content, category, tags, image} = ('title' in req.body) ? req.body : draft;
  const slug = slugify(title, { lower: true });

  var err = null;
  if (!!draft.article_id) {
    // TODO: This should all probably be a transaction, if only for error safety

    // If a corresponding article exists, update it
    // First, add redirect to redirects table (if slug changed)
    await pool
      .query(redirect_query, [draft.article_id, slug, slug])
      .catch(e => console.error(e.stack));

    // Then, make an archive
    await pool
      .query(publish_archive_query, [draft.article_id])
      .catch(e => console.error(e.stack));

    await pool
      .query(update_publish_query, [draft.article_id, title, slug, author, description, content, category, tags, image])
      .catch(e => err = e);
  } else {
    // Otherwise, make a new one
    await pool
      .query(initial_publish_query, [title, slug, author, description, content, category, tags, image])
      .catch(e => err = e);
  }

  if (!err) {
    await pool
      .query(delete_draft_query, [id])
      .then(_ => res.status(200).send(slug))
      .catch(e => res.status(500).send(e.stack));
  } else {
    res.status(500).send("There was an error deleting the draft");
  }
});

module.exports = drafts;