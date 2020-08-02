require('dotenv').config()

import bodyParser from 'body-parser'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import sensors from './routes/sensors'
import {mq} from './controllers/sensors/sensors.controller'
//import v1Route from './routes/v1'
//import indexRouter from './routes/index'

const app = express()
const amqplib = require('amqplib');

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))
app.use('/', sensors)
//app.use('/', indexRouter)
//app.use('/v1', v1Route)
var axios = require('axios');
/*
var config = {
  method: 'get',
  url: 'https://goqual.io/oauth/authorize/?response_type=code&client_id=0483f779468c4f89ab1c90d09e676548&scope=openapi&redirect_uri=https://square.abrain.co.kr:23000',
  headers: {
    'Authorization': 'Basic YWJyYWluQGFicmFpbi5jby5rcjpBYnJhaW4xIQ==',
    'Cookie': 'JSESSIONID=13E95E1C66574B6B8C81ADF1E850B8BA'
  }
};
*
axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error.request._options.search.split('=')[1]);
});
*/

var fs = require('fs');
/*
var opts = {

  cert: fs.readFileSync('./client/client_certificate.pem'),
  key: fs.readFileSync('./client/private_key.pem'),
  passphrase: 'jukeworks',
  ca: [fs.readFileSync('./testca/ca_certificate.pem')],
  rejectUnauthorized: false
};
*/
var amqp = require('amqp');

var implOpts = {
      reconnect: true,
      reconnectBackoffStrategy: 'exponential',
      reconnectBackoffTime: 500
};

var connection  = amqp.createConnection({ host: 'goqual.io'
                                        , port: 55001
                                        , login: '0483f779468c4f89ab1c90d09e676548'
                                        , password: '4711cbb476544b47bab40ed9e5f36b94'
                                        , connectionTimeout: 10000
                                        , authMechanism: 'AMQPLAIN'
                                        , heartbeat: 30
                                        , vhost: '/'
                                        , noDelay: true
                                        , ssl: { enabled : true }},implOpts);



connection.addListener('ready', function(){

    console.log('ready connection ');

});


connection.on('ready', function (error) {
  var q = connection.queue('0483f779468c4f89ab1c90d09e676548', { noDeclare:true}, function (queue) {
    console.log('Queue ' + queue.name + ' is open');
    q.subscribe(function(msg){
      console.log("receive");
      console.log(msg.deviceDataReport);
      if(msg.deviceDataReport == null){
        console.log(msg);
      }
      else{
          //device_Id 가 아닌 code 로 구분 필요.
        var device_Id = msg.deviceDataReport.devId;
        if(device_Id == "ebfd79723dd5afc79dyado" || device_Id == "ebb0a967620b192ea7vu6g" || device_Id == "eb0bba1ea1ffef5a68y2ou" || device_Id == "ebfd4edf393ffcbe4exqgd"){
          var time = msg.deviceDataReport.status[0].t;
          var data = msg.deviceDataReport.status[0].value;
           mq(device_Id, time, data);
        }
      }
    })
  });

});

connection.on('error', function (error) {

    console.log('Connection error' ,error);

});

connection.on('close', function () {
    console.log('Connection close ');

});


/*
var q = '0483f779468c4f89ab1c90d09e676548';

var open = amqp.connect('amqps://0483f779468c4f89ab1c90d09e676548:4711cbb476544b47bab40ed9e5f36b94@goqual.io:55001');
open.then(function(conn) {
  console.log("connected");
}).then(null, console.warn);
*/
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  let apiError = err

  if (!err.status) {
    apiError = createError(err)
  }

  // set locals, only providing error in development
  res.locals.message = apiError.message
  res.locals.error = process.env.NODE_ENV === 'development' ? apiError : {}

  // render the error page
  return res.status(apiError.status)
    .json({message: apiError.message})
})


module.exports = app

