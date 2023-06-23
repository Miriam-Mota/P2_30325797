var express = require('express');
var router = express.Router();
const sqlite = require('sqlite3').verbose();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', nombre: "Alex" });
});


let crear_tabla = "CREATE TABLE contacto (id INTEGER  PRIMARY KEY AUTOINCREMENT, nombre VARCHAR(50) NOT NULL, correo EMAIL NOT NULL, mensaje TEXT, fecha TEXT, hora TEXT, ip TEXT);"
let ingresar_datos = "INSERT INTO contacto (nombre, correo, mensaje, fecha, hora, ip) VALUES(?, ?, ?, ?, ?, ?);"

const db = new sqlite.Database(':memory:', (err)=>{
  if(err) return console.error(err.message);

  db.run(crear_tabla);
  console.log("Query SQL success!");
});



router.post('/', (req, res)=>{

   let ip = req.headers['x-forwrded-for'] || req.socket.remoteAddress;
   let dt = new Date();
   let time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds()

   let fecha = dt.toLocaleDateString('en-us', {weekday:"long", year:"numeric", month:"short", day:"numeric"});

   if (dt.getHours() >= 12) {
    time += " PM"
   } else {
    time += " AM"
   }


   if (ip) {
      let ip_ls = ip.split(',');
      ip = ip_ls[ip_ls.length - 1];
   } else {
      console.log("Direccion IP no encontrada");
   }

  let datos = [req.body.usuario, req.body.correo, req.body.mensaje, fecha, time, ip]; //ARRAY

  console.log(datos);

  db.run(ingresar_datos, datos, (err)=>{
    if(err) return console.error(err.message);

    console.log('Datos guardados');
  });

  res.redirect('/');

});

module.exports = router;