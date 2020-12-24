const pool = require('./pool.js');

async function init_sessions_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);`;
  const clear_query = 'ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";';
  const pkey_query = 'ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;';
  const index_query = 'CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");';

  await client.query(create_query);
  await client.query(clear_query);
  await client.query(pkey_query);
  await client.query(index_query);
}

async function init_admins_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR UNIQUE NOT NULL
    );`;

  await client.query(create_query);
}

async function init_redirects_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS redirects (
      from_slug VARCHAR PRIMARY KEY,
      to_slug VARCHAR NOT NULL
    );`;

  await client.query(create_query);
}

async function init_articles_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR NOT NULL,
      slug VARCHAR UNIQUE NOT NULL,
      author VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      creation_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_time TIMESTAMPTZ,
      content VARCHAR NOT NULL,
      category VARCHAR NOT NULL,
      tags VARCHAR[],
      image VARCHAR
    );`;

  await client.query(create_query);
}

async function init_drafts_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS drafts (
      id SERIAL PRIMARY KEY,
      article_id INTEGER UNIQUE,
      title VARCHAR NOT NULL,
      author VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      creation_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modified_time TIMESTAMPTZ,
      content VARCHAR NOT NULL,
      category VARCHAR NOT NULL,
      tags VARCHAR[],
      image VARCHAR,
      CONSTRAINT fk_article
        FOREIGN KEY (article_id) 
        REFERENCES articles (id)
        ON DELETE SET NULL
    );`;

  await client.query(create_query);
}

async function init_articles_drafts_view(client) {
  const create_query = `
    CREATE OR REPLACE VIEW articles_drafts AS
      SELECT id, title, category, author, creation_time,
        COALESCE(update_time, creation_time) as modified_time,
        FALSE AS is_draft
      FROM articles
      UNION
      SELECT id, title, category, author, creation_time,
        COALESCE(modified_time, creation_time) as modified_time,
        TRUE AS is_draft
      FROM drafts
      WHERE article_id IS NULL;`;

  await client.query(create_query);
}

async function init_archives_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS archives (
      id SERIAL PRIMARY KEY,
      title VARCHAR NOT NULL,
      slug VARCHAR NOT NULL,
      author VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      archive_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      creation_time TIMESTAMPTZ NOT NULL,
      update_time TIMESTAMPTZ,
      content VARCHAR NOT NULL,
      category VARCHAR NOT NULL,
      tags VARCHAR[],
      image VARCHAR
    );`;

  await client.query(create_query);
}

async function init_document_type(client) {
  const create_query = 'CREATE TYPE DOCUMENT_TYPE AS ENUM (\'article\', \'draft\');';

  await client.query(create_query);
}

async function init_trash_table(client) {
  const create_query = `
    CREATE TABLE IF NOT EXISTS trash (
      id SERIAL PRIMARY KEY,
      title VARCHAR NOT NULL,
      author VARCHAR NOT NULL,
      description VARCHAR NOT NULL,
      trash_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      creation_time TIMESTAMPTZ NOT NULL,
      update_time TIMESTAMPTZ,
      content VARCHAR NOT NULL,
      category VARCHAR NOT NULL,
      tags VARCHAR[],
      image VARCHAR,
      doc_type DOCUMENT_TYPE NOT NULL,
      draft_article_id INTEGER
    );`;

  await client.query(create_query);
}

async function init_db() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Attempted database initialization while not testing. Aborting.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await init_sessions_table(client);
    await init_admins_table(client);
    await init_redirects_table(client);
    await init_articles_table(client);
    await init_drafts_table(client);
    await init_articles_drafts_view(client);
    await init_archives_table(client);
    await init_document_type(client);
    await init_trash_table(client);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = init_db;