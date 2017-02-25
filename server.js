// Based on: https://expressjs.com/en/starter/hello-world.html

require('dotenv').config()

var express = require('express');
var app = express();
var path = require('path');
var wrapper = require('./wrapper.js');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, XMLHttpRequest, Content-Type, Accept");
  next();
});

app.get('/', function(req, res) {
  res.render('index');
})
app.post('/', function(req, res) {
  console.log('body command is: ', req.body.command)
  wrapper.send(req.body.command, function(error, data) {
    // var textChunk = data.toString('utf8');
    // console.log('error, data: ', error, textChunk);
    if (!error) {
      res.send({data:data, commandId: req.body.commandId});
    } else {
      console.log("Error: ", error);
    }
  });

})

app.listen(process.env.SERVER_PORT, function() {
  console.log('UEW-H Server started, listening on port '+ process.env.SERVER_PORT)
})