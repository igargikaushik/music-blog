const init_db = require('../src/db/init_db.js');

module.exports = async () => {
  await init_db();
};