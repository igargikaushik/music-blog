const articles = require('express').Router();
const pool = require('../db/pool.js');

const list_query = `SELECT
  title, slug, author, description, creation_time, category, tags, image
  FROM articles
  ORDER BY creation_time
  LIMIT $1 OFFSET $2;`;
const total_query = 'SELECT COUNT(*) FROM articles;';

const slug_select_all_query = 'SELECT * FROM articles WHERE slug = $1;';

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

articles.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  if (!slug) {
    res.status(400).send('Missing article slug');
    return;
  }

  const db_rows = await pool
    .query(slug_select_all_query, [slug])
    .then(db_res => db_res.rows)
    .catch(e => res.status(500).send(e.stack));

  if (db_rows.length == 0) {
    res.status(404).send(`Article with slug ${slug} does not exist`);
  } else {
    res.status(200).send(db_rows[0]);
  }
});

module.exports = articles;