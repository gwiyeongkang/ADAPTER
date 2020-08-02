var request = require('request');
var post_data= require('./post_data.js');

const post = async (req, res, next) => {
  try {
    const type = req.params.id;

    if (!type) {
      return res.status(400).json({error: 'empty id'});
    }
    else{
      var options = {
        'method': 'POST',
        'url': 'http://35.221.124.206:8080/square/type/checkType.square',
        'headers': {
          'Content-Type': 'application/json'
        },
        formData: {
          'node_id': req.body.nodeid,
          'type': type
        }
      };

      request(options, function (error, response) {
        if (error) throw new Error(error);
        if(response.body == 1){
          res.status(200).json({"result":"request was accepted successfully."});
          post_data(type, req.body);
          }
        else if(response.body == 0){
          res.status(400).json({"result":"sensor does not exist"});
        }
        else{
          res.status(400).json({"result":"error"});
        }
      });
    }
  } catch (e) {
    next(e)
  }
}

export {
  post
}
