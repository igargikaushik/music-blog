const draft = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

const article_query = `SELECT * FROM articles WHERE id = $1;`
const article_id_select_query = `SELECT * FROM drafts WHERE article_id = $1;`;
const id_select_query = `SELECT * FROM drafts WHERE id = $1;`;

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

const save_query = `UPDATE drafts
  SET title = $2, author = $3, description = $4,
    modified_time = CURRENT_TIMESTAMP,
    content = $5, category = $6, tags = $7, image = $8
  WHERE id = $1;`;

// Returns the draft associated with the article with the given ID
// First creating a draft if one does not exist
draft.get('/article/:id', requiresAdmin, async (req, res) =>{
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

// Creates a new draft, returning its unique ID
draft.post('/', requiresAdmin, async (req, res) => {
  await pool
    .query(new_draft_query)
    .then(db_res => res.status(201).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

draft.route('/:id')
  .all(requiresAdmin)
  .put(async (req, res) => {
    // Corresponds to saving the draft
    const {id, title, author, description, content, category, tags, image} = req.body;
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

module.exports = draft;