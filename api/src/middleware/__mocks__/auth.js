const auth = jest.requireActual('../auth.js');
auth.requiresAdmin = jest.fn();

auth.__mockUnauthorized = function() {
  auth.requiresAdmin.mockImplementation((_req, res) => res.status(403).send('Unauthorized'));
};

auth.__mockAuthorized = function() {
  auth.requiresAdmin.mockImplementation((_req, _res, next) => next());
};

module.exports = auth;