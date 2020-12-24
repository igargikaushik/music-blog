process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = require('./server.js');

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});