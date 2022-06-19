var express = require('express');
var router = express.Router();
var db = require('../lib/mysql');   


router.get('/:Id',function(req,res){
    const id = req.params.Id;
    db.query('SELECT * FROM masterCal WHERE id = ?', [ id ], function(err, cal) {
        console.log(cal)
    })
    db.query('SELECT * FROM users WHERE id = ?', [ id ], function(err, user) {
        console.log(user)
    })
})

module.exports = router;