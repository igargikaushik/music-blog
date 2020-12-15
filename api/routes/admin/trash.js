const trash = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

const total_query = `SELECT COUNT(*) FROM trash;`
// TODO: Make sure restoring a draft restores
// the article_id IF AND ONLY IF the article exists
const list_query = `SELECT
  trash.id, trash.title, trash.author,
  trash_time, trash.creation_time, trash.update_time,
  trash.category, trash.doc_type, articles.slug as draft_article_slug
  FROM trash
  LEFT JOIN articles ON trash.draft_article_id = articles.id
  ORDER BY trash_time DESC
  LIMIT $1 OFFSET $2;`

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

module.exports = trash;