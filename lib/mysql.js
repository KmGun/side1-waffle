var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '159rjs497',
  database : 'myapp'
});
db.connect();
 

module.exports = db;