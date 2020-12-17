const router = require('express').Router();
const pool = require('../pool');

router.use('/admin', require('./admin'));
router.use('/storage', require('./storage.js'));

router.get("/articles", async (req, res) => {
  const query = `SELECT
    title, slug, author, description, creation_time, category, tags, image
    FROM articles
    ORDER BY creation_time
    LIMIT $1 OFFSET $2;`

  // Pages start at 1
  const count = Math.max(req.query.count || 12, 40);
  const page = req.query.page || 1;
  await pool
    .query(query, [count, count * (page - 1)])
    .then(db_res => res.status(200).send(db_res.rows))
    .catch(e => res.status(500).send(e.stack));
});

module.exports = router;