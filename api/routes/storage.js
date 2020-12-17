const router = require('express').Router();
const { bucket } = require('../cloud_storage.js');

router.get("/alt", async (req, res) => {
  if (!req.query.file) {
    res.status(400).send("No file specified");
    return;
  }

  const file_obj = bucket.file(req.query.file.replace(/^\/static_files\//gi, "static/"));

  file_obj.get(function(err, file, apiResponse) {
    if (err) {
      if (err.code == 404) {
        res.status(200).send({})
      } else {
        res.status(err.code).send(err.stack);
      }
    } else {
      res.status(200).send({
        alt: (file.metadata && file.metadata.metadata)
          ? file.metadata.metadata.alt
          : null
      })
    }
  });
})

module.exports = router;