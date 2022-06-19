exports.main = function(logged,cal_list){
    return `
    <h1>test</h1>
    <p>${logged}</p>
    <p>${cal_list}</p>
    `
}

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
        'refresh_token': '1//0ej6a_pa17-DWCgYIARAAGA4SNwF-L9IretvchlZCX0lryJOqwyXHoXqaLELcVb5GHq344i5bTADMqAVNiJn1krkJB4a6JYmxblQ',
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
}





exports.getMasterCalList = async function(req,res,data){
  console.log('44444444',req.user.mastertoken.access_token)
  await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${req.user.mastertoken.access_token}`)
      .then(function (response){
        return response.json()
      })
      .then(function(data_){
        data.mastercal_list = data_
      })

}

exports.createReqUser = function (req,res){
  if(!req.user){
    req.user = {};
  }
}