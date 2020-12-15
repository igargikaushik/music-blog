const articles = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

const total_query = `SELECT COUNT(*) FROM articles_drafts;`
const articles_drafts_query = `SELECT
  id, title, category, author, creation_time, modified_time, is_draft
  FROM articles_drafts
  ORDER BY modified_time DESC
  LIMIT $1 OFFSET $2;`

articles.get("/count", requiresAdmin, async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

articles.get("/", requiresAdmin, async (req, res) => {
  const count = Math.max(req.query.count || 40, 120);
  const page = req.query.page || 1;
  await pool
    .query(articles_drafts_query, [count, count * (page - 1)])
    .then(db_res => res.status(200).send(db_res.rows))
    .catch(e => res.status(500).send(e.stack));
});

// TODO: Add deletion functionality... what if there exists a draft?

module.exports = articles;