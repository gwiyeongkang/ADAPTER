var request = require('request');

var check_sensors = {};

check_sensors.get_type = function(node_id, message_body){
  return new Promise(resolve => {
    var sensor_type ="";
    for(var i=0; i<message_body.list.length; i++){
      sensor_type = sensor_type + message_body.list[i].sensor_type;
      if(i!=message_body.list.length-1){
        sensor_type = sensor_type + ",";
      }
    }

    var options = {
      'method': 'GET',
      'url': 'http://35.221.124.206:8080/square/iot/sensor/check',
      'headers': {
        'Content-Type': 'application/json'
      },
      formData: {
        'node_id': node_id,
        'sensor_type': sensor_type
      }
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);

      const jsonObj = JSON.parse(response.body);
        resolve(jsonObj);

    });
  });
}


module.exports = check_sensors;

