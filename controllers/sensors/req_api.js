var MQTT = require("mqtt");
var randomstring = require("randomstring");

var req_api = {};

req_api.post_data = function(sensor_nodeId, req_form){


  const BROKER_URL = "mqtt://172.17.0.2:1883";
  const TOPIC_NAME = "/req/"+sensor_nodeId+"/"+ req_form;
  const CLIENT_ID = randomstring.generate(7);


  var client  = MQTT.connect(BROKER_URL, {clientId: CLIENT_ID});

  client.on("connect", onConnected);

  function onConnected()
  {
    client.publish(TOPIC_NAME, req_form);
    client.end();
  }
}

module.exports = req_api;

