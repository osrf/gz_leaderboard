"use strict"

var fs = require('fs')
var https = require('https')
var privateKey  = fs.readFileSync('key.pem', 'utf8')
var certificate = fs.readFileSync('key-cert.pem', 'utf8')
var passport = require('passport')
var BasicStrategy = require('passport-http').BasicStrategy;
var bodyParser = require('body-parser')
var credentials = {key: privateKey, cert: certificate};
var express = require('express')
var util = require('util')
var serveStatic = require('serve-static')
var config = require('./config.json')
var ConnectRoles = require('connect-roles')

// custom models
let UserRoutes = require('./app/user/routes')
let UserDb = require('./app/user/model')
let Events = require('./app/events/model')

// scoring plugins
var app = express();

// your express configuration here
// var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


var user = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    var accept = req.headers.accept || '';
    res.status(403);
    //if (~accept.indexOf('html')) {
    //  res.render('access-denied', {action: action});
    //} else {
      res.send('Access Denied - You don\'t have permission to ' + action);
    }
})



app.use(passport.initialize());


// roles

//returning false stops any more rules from being
user.use('access admin page', function (req, res) {
  console.log('access admin page for: ' + util.inspect(req.user))
  console.log
  if (req.user.role === 'admin') {
    return true;
  }
})


// parse application/json
app.use(bodyParser.json())

// Use the BasicStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
passport.use(new BasicStrategy({}, UserRoutes.verify ));

app.use(user.middleware());


// basic autoh configuration
let basicConfig = {session: false}

app.get('/admin', 
        passport.authenticate('basic', basicConfig),
        user.can('access admin page'),
        function (req,res) {
          res.end('<h1>Admin page</h1>');
})

// curl -v -I http://127.0.0.1:3000/
// curl -v -I --user bob:secret http://127.0.0.1:3000/
app.get('/login', 
  passport.authenticate('basic', basicConfig),
  function(req, res){
    console.log("\nGET /login: " + util.inspect(req.user))
    // avoid transmitting password over the wire 
    delete req.user.password
    console.log('done')
    res.jsonp( req.user )
  }
);


app.get('/logout', function(req, res){
  req.logout()
  res.statusCode = 401
  res.redirect('/')
});

app.post('/register', UserRoutes.register)
app.post('/unregister', UserRoutes.unregister) 


app.get('/api/raw_posts', function (req, res) {
  console.log('GET /api/raw_posts');
  Events.getAll(function(err, events) {
    if(err) {
      throw err
    }
    let db = {events : events}
    res.jsonp(db);
  })
});


app.get('/api/register', function (req, res) {
   console.log('register ' + util.inspect(req.query)  );
});

app.post('/events/new', 
  passport.authenticate('basic', basicConfig),
    function(req, res){
      console.log('req.user: ' + util.inspect(req.user))
      console.log("\nNEW EVENT:\n\n" + util.inspect(req.body))
      let eventData = req.body
      // all_events.push(req.body);
      let eventDb = {username: req.user.username,
                     Event: eventData }

      Events.add(eventDb, function(err) {
        if(err) {
          throw err;
        }
        res.jsonp(eventDb)

      })
    })


app.use(serveStatic(__dirname ));

console.log('Listening on port 3000');

//httpServer.listen(80);
//httpsServer.listen(443);
httpsServer.listen(3000);

