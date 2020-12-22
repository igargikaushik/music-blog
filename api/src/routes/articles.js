const articles = require('express').Router();
const pool = require('../db/pool.js');

const list_query = `SELECT
  title, slug, author, description, creation_time, category, tags, image
  FROM articles
  ORDER BY creation_time
  LIMIT $1 OFFSET $2;`;
const total_query = 'SELECT COUNT(*) FROM articles;';

articles.get('/', async (req, res) => {
  const count = Math.min(req.query.count || 12, 40);
  const page = req.query.page || 1;
  await pool
    .query(list_query, [count, count * (page - 1)])
    .then(db_res => res.status(200).send(db_res.rows))
    .catch(e => res.status(500).send(e.stack));
});

articles.get('/count', async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

module.exports = articles;