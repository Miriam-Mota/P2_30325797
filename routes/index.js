var express = require('express');
var router = express.Router();
require('dotenv').config();
const { Database } = require('sqlite3');
const nodemailer = require ('nodemailer');
const IP = require ('ip');
const request = require ('request');
const { default: axios } = require("axios");
//const db = require('../database');
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./data.db',(err) => {
  if (err) {
      return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');

});


db.run("CREATE TABLE IF NOT EXISTS contactos (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT NOT NULL, correo TEXT NOT NULL, mensaje TEXT NOT NULL, date TEXT NOT NULL, ip TEXT NOT NULL, country TEXT NOT NULL)", (err)=>{
  if(err) return err;
  console.log('TABLA CREADA')
});

let logged = false;
let mensaje = "";


/* GET home page. */
router.get('/', function(req, res, next) {
  logged = false;
  res.render('index', {title: 'Programacion 2',nombre:"Miriam Mota",   ANALITYCS_KEY:process.env.ANALITYCS_KEY,});
});

router.post('/', function(req, res, next) {

    const captcha = req.body['g-recaptcha-response'];
    const SECRET_KEY = process.env.SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captcha}`;
    let usuario = req.body.usuario;
    let correo = req.body.correo;
    let mensaje = req.body.mensaje;
    let Datetime = new Date().toLocaleDateString('en-us', {weekday:"long", year:"numeric", month:"short", day:"numeric"})
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    let myIP = ip.split(",")[0];
    let country = "";
    //Localizar pais de origen de la IP
    request(`http://ip-api.com/json/${myIP}`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      country = data.country;
      //Mostrar datos ingresados pos consola
      console.log({usuario, correo, mensaje, Datetime, myIP, country});
      //Enviar email con los datos ingresados       
      }});

      const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com', 
        port: 465,
        secure: true,
        auth: {
            user: 'test009@arodu.dev',
            pass: 'eMail.test009'
        }
      });
      const mailOptions = {
        from: 'test009@arodu.dev',
        //Lista de correos 
        to: [ 'programacion2ais@dispostable.com','alexxandiazg15@gmail.com'],
        subject: 'Task 4: Third Party Connection ',
        text: 'Un nuevo ususuario se ha registrado en el formulario:\n' + 'Nombre: ' + usuario + '\nCorreo: ' + correo + '\nMensaje: ' + mensaje + '\nFecha y hora: ' + Datetime + '\nIP: ' + myIP + '\nUbicacion: ' + country
      };
      transporter.sendMail(mailOptions, function(error, info){ 
        if (error) {
            console.log(error);
        } else {
            console.log('Correo electrónico enviado: ' + info.response);
        }});
    
        //Validacion de reCAPTCHA 
       /*  request(url, (err, response, body) => {
          if (body.success && body.score) {
            console.log('exitoso')
          } else {
            console.log('Error')
        }
        }); */
        db.run("INSERT INTO contactos (usuario, correo, mensaje, date, ip, country) VALUES (?, ?, ?, ?, ?, ?)", [usuario, correo, mensaje, Datetime, myIP, "VENEZUELA"], function (err) {
          if (err) {
              return console.log(err.message);
          } 
          // get the last insert id
          console.log(`A row has been inserted with rowid ${usuario}`);
      });
        res.redirect('/');
    });
      	
    router.get('/contactos', (req, res) =>{
      if(logged){
        db.all("SELECT * FROM contactos", (err, rows) => {
          if (err) return err;
          console.log(rows);
          res.render('contactos', {contactos:rows});
        });
      }else{
        res.redirect('/login')
      }
      
    });

router.get('/login', (req, res)=>{
  res.render('login', {mej: mensaje});
})

router.post('/login', (req, res)=>{
  const correo = req.body.correo_admin;
  const clave = req.body.clave_admin;

  if(correo == "alex@gmail.com" && clave == "alex123"){
    logged = true;
    res.redirect('/contactos')
  }else{
    logged = false;
    mensaje = "Datos invalidos";
    res.redirect('/login')
  }
})

router.get("/auth", (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`);
})

router.get("/callback", (req, res) => {
  axios.post("https://github.com/login/oauth/access_token", {
      client_id:process.env.CLIENT_ID ,
      client_secret: process.env.SECRET_ID,
      code: req.query.code
  }, {
      headers: {
          Accept: "application/json"
      }
  }).then((result) => {
      console.log(result.data.access_token)
      logged = true;
      res.redirect('/contactos');
  }).catch((err) => {
      console.log(err);
  })
})

    module.exports = router;
    