'use strict'
/*jshint asi: true*/

var util = require('util')
var User = require('./model')

var exports = module.exports = {};


//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.
exports.verify = function(username, password, done)
{
    console.log('verify ' + username + ' ' + password);
    process.nextTick(function () {
      
        // Find the user by username.  If there is no user with the given
        // username, or the password is not correct, set the user to `false` to
        // indicate failure.  Otherwise, return the authenticated `user`.
        User.getByName(username, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false)
            }
            if (user.password != password)
            {
              return done(null, false)
            }
            return done(null, user)
        })
    })
}

exports.register = function(req, res)
{
    var data = util.inspect(req.body);
    console.log("Register " + data);
    var username = req.body.user
    User.getByName(username, function(err, user){

        if (err)
        {
            res.jsonp({"success": false, "error": err});
            return
        }
        if(user)
        {
            var e = "User \"" + username  + "\" already exists";
            console.log(e);
            res.jsonp({ "success": false, "error": e});
            return;
        }
        else // the user does not exist
        {
            let role = 'user'
            User.add( username, req.body.password, role, function(err, user){
                if(err)
                {
                    console.error('User add error: ' + err)
                    res.jsonp({"success": false, "error": err});
                    return
                }
                res.jsonp({"success": true, "user": user.username });
                return
            });
        }
   });
}

exports.unregister = function(req, res) {
    let data = util.inspect(req.body)
    console.log("unregister " + data)
    let username = req.body.user
    let password = req.body.password
    User.getByName(username, function(err, user) {
        if (err)
        {
            res.jsonp({"success": false, "error": err});
        }
        if(!user)
        {
            var e = "User \"" + username  + "\" does not exist";
            console.log(e);
            res.jsonp({ "success": false, "error": e});
        }
        else // the user exists
        {
            // check password
            if (user.password !== password)
            {
              res.jsonp({success: false, error: 'Incorrect password for user ' + username})
              return
            }
            User.remove( username, user.id, function(err, user){
                if(err) {
                  res.jsonp({success: false, error: err})
                  return
                }
                res.jsonp({'success': true, 'username': user.username,  'id': user.id})
            });
        }
    });
}

