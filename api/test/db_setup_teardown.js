const teardown_db = require('../src/db/teardown_db.js');
const auth = require('../src/middleware/auth.js');

beforeEach(async done => {
  auth.__mockAuthorized(); // Mock admin by default
  done();
});

afterEach(async done => {
  await teardown_db();
  done();
});