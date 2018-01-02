const dbconnection = require('./dbconnections.js');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, '/build.sql')).toString();
dbconnection.query(sql, (err, res) => {
  if (err)console.log("san",err);
  else console.log('response');
});
