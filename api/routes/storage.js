const router = require('express').Router();
const { bucket } = require('../cloud_storage.js');

router.get("/alt", async (req, res) => {
  bucket.file(req.query.file.replace(/^\/static_files\//gi, "static/")).getMetadata()
    .then(metadata => res.status(200).send({ alt: (metadata[0].metadata) ? metadata[0].metadata.alt : undefined }))
    .catch(e => res.status(500).send(e.stack));
})

module.exports = router;