const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { passport, pg_session } = require('./auth.js')
const pool = require('./pool');

const app = express();

// Sessions middleware
app.use(pg_session);
app.use(passport.initialize());
app.use(passport.session());

// Parsing middleware
app.use(require('cookie-parser')());
app.use(bodyParser.json());

// Endpoints
app.use('/api/admin', require('./routes/admin'));

app.get("/api/articles", async (req, res) => {
  const query = `SELECT
    title, slug, author, description, creation_time, category, tags, image
    FROM articles
    ORDER BY creation_time
    LIMIT $1 OFFSET $2;`

  // Pages start at 1
  const count = Math.max(req.query.page || 10, 40);
  const page = req.query.page || 1;
  await pool
    .query(query, [count, count * (page - 1)])
    .then(db_res => res.status(200).send(db_res.rows))
    .catch(e => res.status(500).send(e.stack));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});