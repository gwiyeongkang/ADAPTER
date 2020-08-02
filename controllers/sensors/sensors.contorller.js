var request = require('request');
var check_sensors = require('./check_sensors.js');
var app_api = require('./app_api.js');
var req_api = require('./req_api.js');
var db_sql = require('../../db/db_sql.js');

require('date-utils');

const post = async (req, res, next) => {
  try {
    const node_id = req.params.id;

    var stringVal = node_id;
    var substring = "SS";

    if (!node_id) {
      return res.status(400).json({error: 'empty id'});
    }
    else if(node_id == "req"){

      var req_node_id=req.body.node_id.split(',');

      for(var i = 0; i < req_node_id.length; i++){
        var req_data = "";
        if(req.body.data =="common"){
          req_data = "d";
        }
        else if(req.body.data == "active"){
          req_data = "w";
        }

        if(req_node_id[i] == "SS003"){

          const env_sensor = await app_api.post_Things(req_node_id[i], req_data);

            var sensor_nodeId = "SS003";

            var dt = new Date();
            dt.add({hours: 9});
            var time = dt.toFormat('YYYYMMDDHH24MISS');

            var temp_data = env_sensor.deviceState.temperature;
            var humi_data = env_sensor.deviceState.humidity;

            var temp_Json = {"data":temp_data, "sensor_type":"temperature"};
            var humi_Json = {"data":humi_data, "sensor_type":"humidity"};

            var jsonArray = new Array();

            jsonArray.push(temp_Json);
            jsonArray.push(humi_Json);

            var sensor_Json = new Object();
            sensor_Json = {"time":time, "list":jsonArray};

            for(var i=0; i<sensor_Json.list.length; i++){
              var sensor_type = sensor_Json.list[i].sensor_type;
              var sensor_data = sensor_Json.list[i].data;
              var sensor_time = sensor_Json.time;

            const result = await insert_data(sensor_type, sensor_nodeId, sensor_data, sensor_time);
            console.log(result);
          }
        }

      }
      return res.status(200).json({result: 'test good'});
    }
    else if(stringVal.indexOf(substring) != -1){

      for(var i=0; i<req.body.list.length; i++){
        var sensor_type = req.body.list[i].sensor_type;
        var sensor_data = req.body.list[i].data;
        var sensor_time = req.body.time;
        console.log(sensor_type);
        if(sensor_type != "door"){
          const result = await insert_data(sensor_type, node_id, sensor_data, sensor_time);
          console.log(result);
        }
      }
    //  const code = await check_sensors.get_type(type, req.body);
    //  const result = await post_provider(code, type, req.body);
      await res.status(200).json({result: 'test good'});

    }
  } catch (e) {
    next(e)
  }
}

async function insert_data(sensor_type, node_id, sensor_data, sensor_time){

  var query_check_sensor = 'select count(*) AS count, system_type, alert_min_data, alert_max_data from square_sensor_list_tb where sensor_type ="' + sensor_type + '" and system_type = (select system_type from square_system_serial_tb where system_id = (select system_id from square_node_serial_tb where node_id = "'+ node_id + '"))';
  const rows = await db_sql.square_query(query_check_sensor);
  if(rows[0].count == 1 && sensor_type == "active"){

    var query_check_active = 'select emergency_flag, check_flag from square_lite_sensor_active_current_data_tb where node_id = "'+node_id+'"';
    const query_active_rows = await db_sql.square_query(query_check_active);
    if(query_active_rows[0].check_flag == 1){
      return "not_required_active";
    }
    else if(query_active_rows[0].check_flag == 0){

      if(query_active_rows[0].emergency_flag ==1){

        var query_E_current_update = 'update square_lite_sensor_active_current_data_tb set check_flag = true, response_time = "'+sensor_time+'" where node_id = "'+node_id+'";';
        const query_E_current_rows = await db_sql.square_query(query_E_current_update);
        var query_E_stat_update = 'update square_lite_sensor_active_stat_data_tb set check_flag = true, response_time = "'+sensor_time+'" where id = (select id from square_lite_sensor_active_stat_data_tb where node_id = "'+node_id+'" order by id desc limit 1);';
        const query_E_stat_rows = await db_sql.square_query(query_E_stat_update);
        return "update_emergency_active";
      }
      else if(query_active_rows[0].emergency_flag == 0){
        var query_interval_check = 'select count(request_time) AS count from square_lite_sensor_active_current_data_tb where node_id = "'+node_id+'" and "'+sensor_time+'" between date_sub(request_time, INTERVAL (select response_period from square_lite_sensor_active_setting_tb where node_id = "'+node_id+'") MINUTE) and date_add(request_time, INTERVAL (select response_period from square_lite_sensor_active_setting_tb where node_id = "'+node_id+'") MINUTE);';
        const query_interval_rows = await db_sql.square_query(query_interval_check);

        if(query_interval_rows[0].count == 0){
          return "not_requeired_interval_active";
        }
        else if(query_interval_rows[0].count == 1){
          var query_I_current_update = 'update square_lite_sensor_active_current_data_tb set check_flag = true, response_time = "'+sensor_time+'" where node_id = "'+node_id+'";';
          const query_I_current_rows = await db_sql.square_query(query_I_current_update);
          var query_I_stat_update = 'update square_lite_sensor_active_stat_data_tb set check_flag = true, response_time = "'+sensor_time+'" where id = (select id from square_lite_sensor_active_stat_data_tb where node_id = "'+node_id+'" order by id desc limit 1);';
          const query_I_stat_rows = await db_sql.square_query(query_I_stat_update);
          return "update_Interval_active";
        }
      }
    }
  }
  else if(rows[0].count == 1 && sensor_type == "water"){

    var query_replace_current = 'replace into square_'+rows[0].system_type+'_sensor_water_current_data_tb (node_id, time) select "'+node_id+'","'+sensor_time+'";';
    const query_current_rows = await db_sql.square_query(query_replace_current);
    var query_insert_stat = 'insert into square_'+rows[0].system_type+'_sensor_water_stat_data_tb (node_id, time) values ("'+node_id+'","'+sensor_time+'");';
    const query_stat_rows = await db_sql.square_query(query_insert_stat);

    return "insert water data";

  }
  else if(rows[0].count == 1 && sensor_type != "active" && sensor_type != "water"){

    var query_replace_previous = 'replace into square_'+rows[0].system_type+'_sensor_previous_data_tb (node_id, time, data, sensor_type, alert) select * from square_'+rows[0].system_type+'_sensor_current_data_tb where node_id="'+node_id+'" and sensor_type="'+sensor_type+'";';
    const query_previous_rows = await db_sql.square_query(query_replace_previous);
    var query_replace_current = 'replace into square_' + rows[0].system_type + '_sensor_current_data_tb (node_id, time, data, sensor_type, alert) select "' + node_id + '","' + sensor_time + '","' + sensor_data + '","' + sensor_type + '", (select if(' + rows[0].alert_max_data + '>' + sensor_data + ' and ' + sensor_data + '>' + rows[0].alert_min_data +',0,1));';
    const query_current_rows = await db_sql.square_query(query_replace_current);
    var query_insert_stat = 'insert into square_'+rows[0].system_type+'_sensor_stat_data_tb (node_id, time, data, sensor_type) values ("'+node_id+'","'+sensor_time+'","'+sensor_data+'","'+sensor_type+'");';
    const query_stat_rows = await db_sql.square_query(query_insert_stat);

    return "insert env data";

  }
}

async function post_Things(code, node_id, body){

  if(code.code == 1000){


      var props = ["time","list"];

      var key = Object.getOwnPropertyNames(body);

      var value = JSON.stringify(props) === JSON.stringify(key);

      if(value == true){

        var props_list = ["data","sensor_type"];
        var key_list = Object.getOwnPropertyNames(body.list[0]);

        var value_list = JSON.stringify(props_list) === JSON.stringify(key_list);

        if(value_list == true){


          const sensor_nodeId = node_id;

          const result = await app_api.post_Things(sensor_nodeId, body);

          return result;
        }

      }
      else{
        console.log('error : post_data');
      }
  }
  else{
    return code;
  }
}

export {
  post
}

