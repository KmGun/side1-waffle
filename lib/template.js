exports.main = function(logged,cal_list){
    return `
    <h1>test</h1>
    <p>${logged}</p>
    <p>${cal_list}</p>
    `
}

const mastercalRT = '1//0ej6a_pa17-DWCgYIARAAGA4SNwF-L9IretvchlZCX0lryJOqwyXHoXqaLELcVb5GHq344i5bTADMqAVNiJn1krkJB4a6JYmxblQ';
const fetch = require("node-fetch");

exports.reloadAT = async function(req,res,cred){
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
            req.user.mastertoken = data
        })
}