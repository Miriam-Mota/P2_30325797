const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data.db',(err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  
    db.run("CREATE TABLE IF NOT EXISTS contactos (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT NOT NULL, correo TEXT NOT NULL, mensaje TEXT NOT NULL, date TEXT NOT NULL, ip TEXT NOT NULL, country TEXT NOT NULL)");
  });
  
  module.exports = {

    insert: function (usuario, correo, mensaje, Datetime, myIP, country) {
        db.run("INSERT INTO contactos (usuario, correo, mensaje, date, ip, country) VALUES (?, ?, ?, ?, ?, ?)", [usuario, correo, mensaje, Datetime, myIP, country], function (err) {
            if (err) {
                return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
    },
    select: function (callback) {
        db.all("SELECT * FROM contactos", (err, rows) => {
            if (err) {
                throw err;
            }
            console.log(rows);
            callback(rows);
        });
    }
  }