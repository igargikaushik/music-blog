const slugify_f = require('slugify');

const options = { lower: true, strict: true };
const slugify = (title) => {
  return slugify_f(title, options);
};

module.exports = slugify;