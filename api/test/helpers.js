const pool = require('../src/db/pool.js');

async function count(table) {
  const tables = ['articles', 'drafts', 'archives', 'trash', 'session', 'articles_drafts', 'redirects'];
  if (tables.indexOf(table) >= 0) {
    return parseInt((await pool.query(`SELECT COUNT(*) FROM ${table};`)).rows[0].count);
  } else {
    throw new Error(`Invalid table name ${table}`);
  }
}

module.exports = { count };