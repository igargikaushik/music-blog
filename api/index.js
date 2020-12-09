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
    callbackURL: '/api/admin/auth/callback'
  },
  async function(accessToken, refreshToken, profile, done) {
    const is_admin = await pool
      .query("SELECT id FROM admins WHERE user_id = $1;", [profile.id])
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
    ensureLoggedIn('/api/admin/login'),
    async function(req, res, next) {
      if (req.user && req.user.admin)
        next();
      else
        res.status(403).send('Unauthorized');
    }
  ]
};


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