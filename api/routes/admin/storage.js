const router = require('express').Router();
const { requiresAdmin } = require('../../auth.js');

// Open connection to GCS using credentials stored in env variable
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('classical-for-everyone.appspot.com');

router.get("/", requiresAdmin, async (req, res) => {
  bucket.getFiles({ autoPaginate: false, maxResults: 9, pageToken: req.query.page_token})
    .then(data => res.status(200).send({
      files: data[0].map(file => file.name),
      next_page_query: data[1],
    }))
    .catch(e => res.status(500).send(e.stack));
});

module.exports = router;