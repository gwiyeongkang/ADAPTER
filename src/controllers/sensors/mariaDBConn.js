var mariadb = require('mariadb');
var tunnel = require('tunnel-ssh');

var square_db = {};

square_db.square_query = function(query_body){
  return new Promise(resolve => {

    let tunnelPort = 35000 + Math.floor(Math.random() * 10000);
    var config = {
        username: 'root',
        password: 'jukeworks',
        host: '35.221.124.206',
        port: 22,
        dstHost: '127.0.0.1',
        dstPort: 3306,
        localPort: tunnelPort
    };

    var server = tunnel(config, function (error, server) {
        if (error) {
            console.log('Error!! ', error);
        } else {
            if (server != null) {

              const pool = mariadb.createPool({
                host: 'localhost',
                port: tunnelPort,
                user: 'square',
                password: 'jukeworks',
                connectionLimit: 5
              });
  
              getUserList(query_body);

              async function getUserList(query_body) {
                let conn, rows;
                try {
                  conn = await pool.getConnection();
                  conn.query('USE square');
                  rows = await conn.query(query_body);
                }
                catch (err) { throw err; }
                finally {
                  if (conn) conn.end();
                  resolve(rows);
                  return rows;

                }
              }
            }
        }
    });
  });
  server.close();
}


module.exports = square_db;

