const router = require('express').Router();
const { requiresAdmin } = require('../../auth.js');
const { bucket } = require('../../cloud_storage.js');

const Multer = require('multer');
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  },
});

router.get("/", requiresAdmin, async (req, res) => {
  bucket.getFiles({ autoPaginate: false, maxResults: 9, pageToken: req.query.page_token})
    .then(data => res.status(200).send({
      files: data[0].map(file => { return { url: file.name, alt: (file.metadata.metadata) ? file.metadata.metadata.alt : undefined } }),
      next_page_query: data[1],
    }))
    .catch(e => res.status(500).send(e.stack));
})
router.post("/", [requiresAdmin, multer.single('file')], async (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }

  const filename = `static/${req.file.originalname}`;
  const blob = bucket.file(filename);
  const blob_stream = blob.createWriteStream({
    gzip: true,
    metadata: {
      cacheControl: 'public, max-age=31536000',
      metadata: {
        alt: req.body.alt,
      }
    },
  });

  blob_stream.on('error', err => {
    console.log(err);
    res.status(500).send(err);
  });

  blob_stream.on('finish', () => {
    res.status(200).send({ url: filename, alt: req.body.alt });
  });

  blob_stream.end(req.file.buffer);
});

module.exports = router;