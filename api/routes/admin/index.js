const admin = require('express').Router();
const { passport } = require('../../auth.js');

// Authentication Endpoints
admin.get('/login',
  passport.authenticate('google', { scope: ['profile'] }));
admin.get('/auth/callback',
  passport.authenticate('google', { failureRedirect: '/api/admin/login' }),
  function (req, res) {
    res.redirect('/');
  });
admin.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});
admin.get('/user', function (req, res) {
  res.json({ user: req.user });
});

// Authorized admin endpoints
admin.use('/articles', require('./articles.js'));
admin.use('/draft', require('./draft.js'));
admin.use('/storage', require('./storage.js'));

module.exports = admin;