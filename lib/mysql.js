var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "cocoapam6567",
  database: "side1_waffle",
});
db.connect();

module.exports = db;
