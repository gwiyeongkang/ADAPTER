var request = require('request');

var app_api = {};

app_api.post_Things = function(sensor_nodeId, body){
  return new Promise(resolve => {
    var device_id = "";
    console.log("flag");
    if(sensor_nodeId == 'SS001'){
      device_id= 'eb8ef65427350181db4ggd';
    }
    else if(sensor_nodeId == 'SS004'){
      device_id = 'eb249e1ca749ec436aod9s';
    }
      var options = {
        'method': 'GET',
        'url': 'https://goqual.io/openapi/device/' + device_id,
        'headers': {
          'Authorization': 'Bearer 67cc73b9-a59e-490b-8b10-f09158f8c8ca',
          'Cookie': 'JSESSIONID=7EEFDFB12BBE72CF18CDAE33D7AE3A80'
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        const jsonObj = JSON.parse(response.body);
        resolve(jsonObj);
      });
  });
}



module.exports = app_api;

