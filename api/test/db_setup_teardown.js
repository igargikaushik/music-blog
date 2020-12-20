const init_db = require('../src/db/init_db.js');
const teardown_db = require('../src/db/teardown_db.js');
const auth = require('../src/middleware/auth.js');

beforeAll(async done => {
  await teardown_db();
  done();
});

beforeEach(async done => {
  await init_db();
  auth.__mockAuthorized(); // Mock admin by default
  done();
});

afterEach(async done => {
  await teardown_db();
  done();
});