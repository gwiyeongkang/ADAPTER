var mariadb = require('mariadb');

var square_db = {};

square_db.db_connect = function(){
  return new Promise(resolve => {

    const pool = mariadb.createPool({
      host: 'localhost',
      port: 9925,
      user: 'square',
      password: 'jukeworks',
      connectionLimit: 100,
      waitForConnections: true
    });

    getUserList();

    async function getUserList() {
      let conn;
      try {
        conn = await pool.getConnection();
        conn.query('USE square');
        resolve(conn);
      }
      catch (err) { throw err; }
      finally {

      }
    }
  });
}


module.exports = square_db;

