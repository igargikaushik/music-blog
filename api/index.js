const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");

const { Pool } = require('pg');
const pool = new Pool();

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID: '1081413117266-1egpnvljjqu6lnsiafjhfv0fovqak1p5.apps.googleusercontent.com',
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: '/api/admin/auth/callback',
    scope: ['profile'],
  },
  async function(accessToken, refreshToken, profile, done) {
    const is_admin = await pool
      .query("SELECT id FROM admins WHERE user_id = $1 LIMIT 1;", [profile.id])
      .then(db_res => db_res.rows.length > 0)
      .catch(_ => false);
    profile.admin = is_admin;
    return done(undefined, profile);
  }
));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const app = express();

app.use(require('cookie-parser')());
const pgSession = require('connect-pg-simple')(session)
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.CLIENTSECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
function requiresAdmin() {
  return [
    // ensureLoggedIn('/api/admin/login'),
    // passport.authenticate('google'),
    /* passport.authenticate('google', { scope: ['profile' ], failWithError: true }, function(err, user, info) {
      if (err || !user || _.isEmpty(user)) {
        return next(err);
      } else {
        return next();
      }
    }), */
    async function(req, res, next) {
      if (req.user && req.user.admin)
        next();
      else
        res.status(403).send('Unauthorized');
    }
  ]
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", requiresAdmin(), (req, res) => {
  res.json({ message: "Root path.", user: req.user });
});

app.get("/api/test", requiresAdmin(), (req, res) => {
  res.json({ message: "This is a test!", user: req.user });
});

app.get('/api/admin/login',
  passport.authenticate('google', { scope: ['profile'] }));
app.get('/api/admin/auth/callback', 
  passport.authenticate('google', { failureRedirect: '/api/admin/login' }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/api/admin/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
app.get('/api/admin/user', function(req, res){
  res.json({user: req.user});
});

app.get("/api", async (req, res) => {
  const db_res = await pool
    .query('SELECT NOW()')
    .then(db_res => db_res.rows[0])
    .catch(e => console.error(e.stack));
  res.json({ message: "This is the API GET.", db_res: db_res });
});

app.get("/api/admin/articles", requiresAdmin(), async (req, res) => {
  res.status(200).send([
    {
      id: 3,
      title: "Beethoven's Moonlight Sonata",
      slug: "beethoven-moonlight-sonata",
      author: 'Henry Sloan',
      description: "This work is one of classical music's most famous masterpieces. In fact, it's two of them!",
      imgSrc: "https://snappygoat.com/b/6b9de9d8a0092d952602a6faa452e3c32e2a87c0",
      tags: ["Sonata", "Classical"],
      creation_time: '2020-12-09T15:56:48.754Z',
      category: "Listening Guide",
      is_draft: true,
    },
    {
      id: 6,
      title: 'What is a Sonata?',
      slug: 'what-is-a-sonata',
      author: 'Henry Sloan',
      description: `Many of the most popular classical works are "Sonatas". Let's look at what that means, and how we can navigate this vast genre.`,
      creation_time: '2020-12-07T19:56:48.754Z',
      category: 'Article',
      tags: [
        'Sonata',
        'Classical',
        'Romantic',
        'Baroque'
      ],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg',
      is_draft: false,
    },
  ]);
});

app.post("/api/admin/draft", requiresAdmin(), async (req, res) => {
  const new_query = `INSERT INTO
    drafts(article_id, title, author, description, creation_time, content, category, tags, image)
    VALUES(NULL, '', '', '', CURRENT_TIMESTAMP, '', '', ARRAY[]::VARCHAR[], '')
    RETURNING id;`;
  await pool
    .query(new_query)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

app.get("/api/admin/draft", requiresAdmin(), async (req, res) => {
  const article_query = `SELECT *
    FROM articles
    WHERE id = $1;`
  const transfer_query = `INSERT INTO
    drafts(article_id, title, author, description, creation_time, content, category, tags, image)
    SELECT id, title, author, description, CURRENT_TIMESTAMP, content, category, tags, image
    FROM articles
    WHERE id = $1
    ON CONFLICT DO NOTHING;`;
  const article_id_select_query = `SELECT *
    FROM drafts
    WHERE article_id = $1;`;
  const id_select_query = `SELECT *
    FROM drafts
    WHERE id = $1;`;

  if (req.query.id) {
    const id = parseInt(req.query.id);
    if (!id) {
      res.status(400).send("Bad draft ID");
      return;
    }

    const draft = await pool
      .query(id_select_query, [id])
      .then(db_res => {
        if (db_res.rows.length == 0) {
          res.status(404).send(`Draft with ID ${id} does not exist`);
        } else {
          res.status(200).send(db_res.rows[0]);
        }
      })
      .catch(e => res.status(500).send(e.stack));
  } else if (req.query.article_id) {
    const article_id = parseInt(req.query.article_id);
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
  } else {
    res.status(400).send("Requires parameter for 'id' or 'article_id");
  }
});

app.get("/api/articles", async (req, res) => {
  res.status(200).send([
    {
      title: 'What is a Sonata?',
      slug: 'what-is-a-sonata',
      author: 'Henry Sloan',
      description: `Many of the most popular classical works are "Sonatas". Let's look at what that means, and how we can navigate this vast genre.`,
      creation_time: '2020-12-07T19:56:48.754Z',
      category: 'Article',
      tags: [
        'Sonata',
        'Classical',
        'Romantic',
        'Baroque'
      ],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg',
    }
  ]);
  return;
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

app.get("/api/create_post", async (req, res) => {
  const insert_query = `INSERT INTO
    articles(title, slug, author, description, creation_time, content, category, tags, image)
    VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7, $8)
    RETURNING *;`;
  const values = [
    "What is a Sonata?",
    "what-is-a-sonata",
    "Henry Sloan",
    'Many of the most popular classical works are "Sonatas". Let\'s look at what that means, and how we can navigate this vast genre.',
    `[[toc]]

# Introduction
What do Mozart and Beethoven have in common? Well, among other things, they both have "sonatas" among their most famous works. I'll bet you've heard this piece by Mozart:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Wolfgang_Amadeus_Mozart_-_sonata_no._16_in_c_major%2C_k.545_%27sonata_facile%27_-_i._allegro.ogg"></audio>

And this wild work of Beethoven:

<audio controls="controls" src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Moonlight_Sonata_Presto.ogg"></audio>

These two pieces are about as different as you can get within the classical-era piano repertoire, but they have **two things** in common.
1. They're movements in "piano sonatas"
2. They're in sonata form

That's right, "sonata" means two different, but closely related, things. This might seem confusing, but learning the meanings of these two ideas will do wonders to open your ears to classical music. Let's look at the definitions of "sonata" and see how this abstract idea leads us through the past 400 years of musical evolution.

# Sonata vs. Sonata Form
What is the difference? There is a difference. What is it. It is.

# History of the Sonata
There is history. What is it? It is.

# Suggestions
Listen! To what? Well, listen, and I'll tell you! It is.`,
    'Article',
    ["Sonata", "Classical", "Romantic", "Baroque"],
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/256px-Wolfgang-amadeus-mozart_1.jpg',
  ];

  const db_res = await pool
    .query(insert_query, values)
    .then(db_res => res.status(200).send(db_res.rows[0]))
    .catch(e => res.status(500).send(e.stack));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});