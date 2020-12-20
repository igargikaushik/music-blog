const { Pool, types } = require('pg');
types.setTypeParser(1114, str => str); // Return timestamps without processing

const env = process.env.NODE_ENV;
var host = null;
if (env == 'test') {
  host = 'localhost';
} else if (env == 'production' || env == 'development') {
  host = process.env.PGHOST;
} else {
  console.error('NODE_ENV not in {production, development, test}. Not setting database hostname.');
}

const pool = new Pool({ host });
module.exports = pool;