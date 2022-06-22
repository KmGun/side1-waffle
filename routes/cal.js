var express = require('express');
var router = express.Router();
var db = require('../lib/mysql');   
var template = require('../lib/template');
var bodyParser = require('body-parser')



router.post('/create',function(req,res){
    async function run(){
        await template.createMasterCal(req,res)
        template.addMasterCalHashtagsOnDB(req,res)
        res.redirect('/')
    }   
    run();
})


router.get('/:Id',function(req,res){
    let data = {};
    const id = req.params.Id;
    db.query('SELECT * FROM masterCal WHERE id = ?', [ id ], async function(err, cal) {
        const calendar = cal[0]
        let calId = calendar.calId
        // get EventLists and save to data.eventList
        await template.getMasterCalEventLists(req,res,calId,data)
        
        // data.eventList/hashtags
        data.calName = calendar.calName
        data.hashTags = calendar.hashtags;
        
        // data.profile if loggined
        if (req.user.profile){
            data.profile = req.user.profile
            // return by boolean
            data.subscribed = await template.checkSubscribed(req,res,calId)
        }
        res.send(data)
    })
})

router.get('/:Id/subscribe',function(req,res){
  db.query(`SELECT * FROM masterCal WHERE id=?`,[req.params.Id],function(err,cal){
    async function run(){
        const cal_ = cal[0];
        const calId = cal_.calId;
        const subscribers = cal_.subscribers;
        await template.subscribeCal(req,res,calId)
        // add and res.redirect
        template.addSubscriberOnDB(req,res,subscribers)
    }
    run()
  })
})

router.get('/:Id/unsubscribe',function(req,res){
    db.query(`SELECT * FROM masterCal WHERE id=?`,[req.params.Id],function(err,cal){
        async function run(){
            const cal_ = cal[0];
            const calId = cal_.calId;
            const subscribers = cal_.subscribers;
            await template.unsubscribeCal(req,res,calId)
            template.deleteSubscriberOnDB(req,res,subscribers)
        }
        run()
    })
})

router.post('/:Id/event/create',function(req,res){
    db.query(`SELECT * FROM masterCal WHERE id=?`,[req.params.Id],function(err,cal){
        async function run(){
            const calId = cal[0].calId;
            await template.addEventOnCal(req,res,calId);
            res.redirect(`/cal/${req.params.Id}`)
        }
    })
})


module.exports = router;