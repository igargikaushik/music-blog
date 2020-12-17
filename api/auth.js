const passport = require('passport');
const session = require('express-session');
const pool = require('./pool');

// Allows pure-backend authentication and authorization
// Login redirects to and from Google auth service
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID: '1081413117266-1egpnvljjqu6lnsiafjhfv0fovqak1p5.apps.googleusercontent.com',
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: '/api/admin/auth/callback',
    scope: ['profile'],
  },
  async function (accessToken, refreshToken, profile, done) {
    const is_admin = await pool
      .query("SELECT id FROM admins WHERE user_id = $1 LIMIT 1;", [profile.id])
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

const session_connection = require('connect-pg-simple')(session);
const pg_session = session({
  store: new session_connection({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.CLIENTSECRET, resave: true, saveUninitialized: true
});

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