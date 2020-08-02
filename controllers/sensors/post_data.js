var app_api= require('./app_api.js');

function post_data(type, body){

  //  var props = '{"systemId": "","transaction": [{"time": "","data" : []}]}';
    var props = ["nodeid","time","data"];
    //var jsonObject1 = JSON.parse(jsonformat);

    var hasAll = props.every(prop => body.hasOwnProperty(prop));
    //  var x = Object.keys(req.body.transaction[0]);
    //  console.log(x);

    if(hasAll == true){
        const sensor_nodeId = body.nodeid;
        //const sensor_rowId = req.body.rowId;
        const sensor_time = body.time;
        const sensor_data = body.data;
        const sensor_type = type;
        //const sensor_time = sensor_transaction[0].time;
        //app_api(sensor_systemId, id, id, '_doc', sensor_transaction, rowId);

        app_api(sensor_nodeId, sensor_type, sensor_time, sensor_data);

    }
    else{
      console.log('error : post_data');
    }

}

module.exports = post_data;
