const { Pool, types } = require('pg');
types.setTypeParser(1114, str => str); // Return timestamps without processing
const pool = new Pool();
module.exports = pool;