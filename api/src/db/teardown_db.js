const pool = require('./pool.js');

async function teardown_db(drop=false) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Attempted database teardown while not testing. Aborting.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (drop) {
      await client.query('DROP VIEW IF EXISTS articles_drafts CASCADE;');
      await client.query('DROP TYPE IF EXISTS DOCUMENT_TYPE CASCADE;');
      for (const table of ['session', 'admins', 'redirects', 'articles', 'drafts', 'archives', 'trash']) {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
      }
    } else {
      for (const table of ['session', 'admins', 'redirects', 'articles', 'drafts', 'archives', 'trash']) {
        await client.query(`DELETE FROM ${table};`);
      }
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = teardown_db;