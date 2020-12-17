// Open connection to GCS using credentials stored in env variable
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('classical-for-everyone.appspot.com');

module.exports = {
  storage,
  bucket,
};