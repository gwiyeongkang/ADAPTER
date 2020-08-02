var square_db = require('./db_connect.js');

var db_sql = {};

db_sql.square_query = function(query){
  return new Promise(resolve => {
    connect(query);
    async function connect(){
      let connect = await square_db.db_connect();

      let rows = await connect.query(query);
      connect.release();
      connect.end();
      resolve(rows);
      return rows;
    }
  });
}


module.exports = db_sql;

