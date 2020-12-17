const trash = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const slugify = require('../../slugify.js');
const pool = require('../../pool');

const id_select_query = `SELECT id, title, doc_type FROM trash WHERE id = $1;`;
const total_query = `SELECT COUNT(*) FROM trash;`
const list_query = `SELECT
  trash.id, trash.title, trash.author,
  trash_time, trash.creation_time, trash.update_time,
  trash.category, trash.doc_type, articles.slug as draft_article_slug
  FROM trash
  LEFT JOIN articles ON trash.draft_article_id = articles.id
  ORDER BY trash_time DESC
  LIMIT $1 OFFSET $2;`
const article_slug_query = `SELECT slug FROM articles WHERE slug = $1;`;
const draft_article_id_query = `SELECT drafts.id, articles.title
  FROM drafts
  INNER JOIN articles ON drafts.article_id = articles.id
  WHERE article_id
  IN (SELECT draft_article_id FROM trash WHERE id = $1 AND draft_article_id IS NOT NULL);`

const restore_article_query = `INSERT INTO
  articles(title, slug, author, description, creation_time,
    update_time, content, category, tags, image)
  SELECT title, $2, author, description, creation_time,
    update_time, content, category, tags, image
  FROM trash
  WHERE id = $1;`;
const restore_draft_query = `INSERT INTO
  drafts(title, author, description, creation_time,
    modified_time, content, category, tags, image, article_id)
  SELECT title, author, description, creation_time,
    update_time, content, category, tags, image,
    CASE
      WHEN EXISTS (SELECT id FROM articles WHERE id = draft_article_id)
        THEN draft_article_id
      ELSE NULL
    END AS article_id
  FROM trash
  WHERE id = $1;`;
const rename_query = `UPDATE trash SET title = $2 WHERE id = $1;`

const delete_item_query = `DELETE FROM trash WHERE id = $1;`;

trash.route('/')
  .all(requiresAdmin)
  .get(async (req, res) => {
    const count = Math.max(req.query.count || 20, 120);
    const page = req.query.page || 1;
    await pool
      .query(list_query, [count, count * (page - 1)])
      .then(db_res => res.status(200).send(db_res.rows))
      .catch(e => res.status(500).send(e.stack));
  });

trash.get("/count", requiresAdmin, async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

trash.post("/restore/:id", requiresAdmin, async (req, res) => {
  // Restore an item to either the articles or drafts table
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send("Bad trash item ID");
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const items = await client
      .query(id_select_query, [id])
      .then(db_res => db_res.rows);
    if (items.length == 0) {
      throw new Error(`Trash item with ID ${id} does not exist`);
    }
    const {title, doc_type} = items[0];

    if (doc_type.toLowerCase() == "article") {
      const slug = slugify(title);
      const conflicts = await client
        .query(article_slug_query, [slug])
        .then(db_res => db_res.rows);
      if (conflicts.length != 0) {
        const err = `Article with slug ${conflicts[0].slug} already exists`;
        res.status(409).send(err);
        throw new Error(err);
      }

      await client.query(restore_article_query, [id, slug]);
    } else if (doc_type.toLowerCase() == "draft") {
      const conflicts = await client
        .query(draft_article_id_query, [id])
        .then(db_res => db_res.rows);
      if (conflicts.length != 0) {
        const err = `Draft associated with the article ${conflicts[0].title} already exists`;
        res.status(409).send(err);
        throw new Error(err);
      }

      await client.query(restore_draft_query, [id]);
    }

    await client.query(delete_item_query, [id]);

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

trash.put("/rename/:id", requiresAdmin, async (req, res) => {
  // Rename the given item
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send("Bad item ID");
    return;
  }
  const new_title = req.body.title;
  if (!new_title) {
    res.status(400).send("Invalid or missing title");
    return;
  }

  const items = await pool
    .query(id_select_query, [id])
    .then(db_res => db_res.rows);
  if (items.length == 0) {
    res.status(404).send(`Trash item with ID ${id} does not exist`);
  } else {
    await pool
      .query(rename_query, [id, new_title])
      .then(() => res.status(200).send())
      .catch(e => res.status(500).send(e.stack));
  }
});

trash.delete('/:id', requiresAdmin, async (req, res) => {
  // Permanently delete the given item
  const id = parseInt(req.params.id);
  if (!id) {
    res.status(400).send("Bad item ID");
    return;
  }

  const items = await pool
    .query(id_select_query, [id])
    .then(db_res => db_res.rows);
  if (items.length == 0) {
    res.status(404).send(`Trash item with ID ${id} does not exist`);
  } else {
    await pool
      .query(delete_item_query, [id])
      .then(() => res.status(200).send())
      .catch(e => res.status(500).send(e.stack));
  }
});

module.exports = trash;