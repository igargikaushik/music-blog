const redirect = require('express').Router();
const pool = require('../db/pool.js');

const redirect_query = `SELECT
  to_slug FROM redirects
  WHERE from_slug = $1;`;

redirect.get('/:slug', async (req, res) => {
  const from_slug = req.params.slug;

  await pool
    .query(redirect_query, [from_slug])
    .then(db_res => res.status(200).send(db_res.rows.length > 0
      ? db_res.rows[0]
      : {}))
    .catch(e => res.status(500).send(e.stack));
});

module.exports = redirect;