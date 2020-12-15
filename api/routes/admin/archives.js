const archives = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

const total_query = `SELECT COUNT(*) FROM archives;`
const list_query = `SELECT
  id, title, category, author, archive_time, creation_time, update_time
  FROM archives
  ORDER BY archive_time DESC
  LIMIT $1 OFFSET $2;`

archives.route('/')
  .all(requiresAdmin)
  .get(async (req, res) => {
    const count = Math.max(req.query.count || 40, 120);
    const page = req.query.page || 1;
    await pool
      .query(list_query, [count, count * (page - 1)])
      .then(db_res => res.status(200).send(db_res.rows))
      .catch(e => res.status(500).send(e.stack));
  });

archives.get("/count", requiresAdmin, async (req, res) => {
  await pool
    .query(total_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

module.exports = archives;