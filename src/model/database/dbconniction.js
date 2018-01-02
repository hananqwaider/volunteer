const { Pool } = require('pg');
require('env2')('config.env');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL  is undefined. ');
}
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
});
