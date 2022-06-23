const mastercalRT = '1//0ej6a_pa17-DWCgYIARAAGA4SNwF-L9IretvchlZCX0lryJOqwyXHoXqaLELcVb5GHq344i5bTADMqAVNiJn1krkJB4a6JYmxblQ';
const fetch = require("node-fetch");

exports.refreshMasterAT = async function(req,res,cred,next){
    await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
      'Host': 'oauth2.googleapis.com',
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'client_id': cred.web.client_id,
        'client_secret': cred.web.client_secret,
        'refresh_token': mastercalRT,
        'grant_type': 'refresh_token'
      }),
    })
      .then((response) => response.json())
      .then((data) =>{
          data.expireTime = Date.now() / 1000 + data.expires_in
          req.user.mastertoken = data
          next()
      })
}

exports.checkMasterATexpired = function(req,res){
  var now = Date.now()/1000;
  if (now > req.user.mastertoken.expireTime){
    return true;
  }
  else{return false}
}

exports.getMasterCalData = async function(req,res){
  masterCal_list = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${req.user.mastertoken.access_token}`)
      .then(function (response){
        return response.json()
      })
      .then(function(data_){
        return data_
      })
  return masterCal_list
}

var db = require('./mysql');

exports.makeMasterCalDB = function(masterCal_list){
  let i = 0;
  while (i<masterCal_list.items.length){
    let calId = masterCal_list.items[i].id
    let calName = masterCal_list.items[i].summary
    // calId가 masterCal의 DB안에 없으면 넣어주세요
    db.query('SELECT * FROM masterCal WHERE calId = ?',[calId], function(err, cal){
      if (!cal[0]){
        db.query('INSERT INTO masterCal (calId,calName) VALUES(?,?)', [ calId,calName ], function(err, result) {
        })
      }
    })
    i++
  }
}


exports.getMasterCalDB = function(req,res,data){
  db.query('SELECT * FROM masterCal', function(err, calList) {
    for (let i=0;i<calList.length;i++){
      calList[i].subscribers = JSON.parse(calList[i].subscribers)
      calList[i].hashtags = JSON.parse(calList[i].hashtags)
    }
    data.masterCal_list = calList;
    res.send(data)
  })
}



exports.createReqUser = function (req,res){
  if(!req.user){
    req.user = {};
  }
}




// Cal page
exports.getMasterCalEventLists = async function(req,res,calId,data){
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events?access_token=${req.user.mastertoken.access_token}`)
    .then(function (response){
      return response.json()
    })
    .then(function(data_){
      data.eventList = data_
    })
}

// Test 필요
exports.createMasterCal = async function(req,res){
  const postObj = {
    "summary": req.body.summary
  }

  await fetch(`https://www.googleapis.com/calendar/v3/calendars?access_token=${req.user.mastertoken.access_token}`,{
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(postObj),
  })

}
exports.addMasterCalHashtagsOnDB = function(req,res){
  const hashtags = JSON.stringify(req.body.hashtags)
  db.query('INSERT INTO masterCal (hastags) VALUES(?)', [ hashtags ], function(err, result) {
  })
}

// 코드 간단하게 해야됨
exports.checkSubscribed = async function(req,res,calId){
  const result = await new Promise(function(resolve,reject){
    db.query(`SELECT * FROM masterCal WHERE calId = ?`,[calId],function(err,cal){
      let currentUserId = req.user.profile.id 
      if (cal[0].subscribers !== null){
        let subscribers = JSON.parse(cal[0].subscribers)
        const answer = subscribers.indexOf(currentUserId)
        if (answer !== -1){
          resolve(true)
        }
        else{
          resolve(false)
        }
      }
      else{
        resolve('no subscribers')
      }
    })
  })
  return result;
}

exports.subscribeCal = async function(req,res,calId){
  await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${req.user.token.access_token}`,{
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id' : calId
    }),
  })
    .then(function (response){
      return response.json()
    })
    .then(function(data_){
    })
}

exports.addSubscriberOnDB = function(req,res,subscribers){
    let subs = subscribers
    if (subs === null){
      subs = [];
      subs.push(req.user.profile.id)
      subs = JSON.stringify(subs);
      
    }
    else {
      subs = JSON.parse(subs);
      subs.push(req.user.profile.id)
      subs = JSON.stringify(subs);
    }

    db.query(`UPDATE masterCal SET subscribers=? WHERE id=?;`,[subs,req.params.Id],function(err,result){
      res.redirect(`/cal/${req.params.Id}`)        
    })
}

exports.unsubscribeCal = async function(req,res,calId){
  await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList/${calId}?access_token=${req.user.token.access_token}`,{
    method: 'DELETE'
  })
}

exports.deleteSubscriberOnDB = function(req,res,subscribers){
  let subs = subscribers
  subs = JSON.parse(subs);

  // remove id from subs
  var filteredSubs = subs.filter(e => e !== req.user.profile.id)

  // save it to DB
  filteredSubs = JSON.stringify(filteredSubs);
  db.query(`UPDATE masterCal SET subscribers=? WHERE id=?;`,[filteredSubs,req.params.Id],function(err,result){
    res.redirect(`/cal/${req.params.Id}`)        
  })
}

//Test 해봐야함
exports.addEventOnCal = async function(req,res,calId){
  const givenData = req.body
  givenData.start.timeZone = "Asia/Seoul"
  givenData.end.timeZone = "Asia/Seoul"

  await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events?access_token=${req.user.mastertoken.access_token}`,{
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify(givenData),
  })
}