const { Pool, types } = require('pg');
types.setTypeParser(1114, str => str);
const pool = new Pool();
module.exports = pool;