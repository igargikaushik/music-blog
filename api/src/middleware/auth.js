const passport = require('passport');
const session = require('express-session');
const pool = require('../db/pool.js');

// Allows pure-backend authentication and authorization
// Login redirects to and from Google auth service
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENTID || '123',
  clientSecret: process.env.CLIENTSECRET,
  callbackURL: '/api/admin/auth/callback',
  scope: ['profile'],
},
async function (accessToken, refreshToken, profile, done) {
  const is_admin = await pool
    .query('SELECT id FROM admins WHERE user_id = $1 LIMIT 1;', [profile.id])
    .then(db_res => db_res.rows.length > 0)
    .catch(() => false);
  profile.admin = is_admin;
  return done(undefined, profile);
}
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

const pg_session_opts = {
  secret: process.env.CLIENTSECRET || 'secret', resave: false, saveUninitialized: false,
  cookie: {},
};

if (process.env.NODE_ENV === 'production') {
  pg_session_opts.cookie.secure = true;
}

if (process.env.NODE_ENV !== 'test') {
  const session_connection = require('connect-pg-simple')(session);
  pg_session_opts.store = new session_connection({
    pool: pool,
    tableName: 'session'
  });
}

const pg_session = session(pg_session_opts);

async function requiresAdmin(req, res, next) {
  if (req.user && req.user.admin)
    next();
  else
    res.status(403).send('Unauthorized');
}

module.exports = {
  passport,
  pg_session,
  requiresAdmin,
};