const admin = require('express').Router();
const { passport, requiresAdmin } = require('../../auth.js');
const pool = require('../../pool');

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
admin.get("/articles", requiresAdmin, async (req, res) => {
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

admin.use('/draft', require('./draft.js'))

module.exports = admin;