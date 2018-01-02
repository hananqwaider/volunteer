const { Pool } = require('pg');
require('env2')('config.env');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL  is undefined. ');
}
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
});
 const dbconnection = require('./dbconnections.js');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '/build.sql')).toString();
dbconnection.query(sql, (err, res) => {
  if (err)console.log("san",err);
  else console.log('response');
});
 const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const exphbs = require('express-handlebars');
const controllers = require('./controllers/index');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','hbs');
app.engine('hbs',exphbs({
  extname:'hbs',
  layoutsDir:path.join(__dirname,'views','layouts'),
  partialsDir:path.join(__dirname,'views','partials'),
  defaultLayout:'main'
}));

app.use(cookieParser());
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
// app.use((req, res, next)=>{
//   console.log({url:req.url, method: req.method});
//   next();
// })
app.use(controllers);

module.exports = app;
