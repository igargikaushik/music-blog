const teardown_db = require('../src/db/teardown_db.js');

module.exports = async () => {
  await teardown_db(true);
};