var w = require('winston');
w.level = process.env.LOG_LEVEL;

// dependencies
var express = require('express');
var path = require('path');
var passport = require('passport');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var methodOverride = require('method-override');
var https = require('https');
var login = require('connect-ensure-login');
var tokens = require('./db/tokens');

//configuration for oauth2
var conf = require('./conf/oauth-client-conf');

function init() {
    return new Promise(function(resolve, reject) {
        var app = express();
    
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        // app.use(logger('dev'));
        app.use(cookieParser());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(methodOverride());
        //Be careful with this keyboard cat... it is there just to make the example fast.
        //but you should UPDATE THIS!! you have been warned :)
        app.use(session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false
        }));
        app.use(passport.initialize());
        app.use(passport.session());

        require('./passport/serializer');
        require('./passport/strategy')(conf.oauth2);
        app.use("/",require('./routes/')(conf.oauth2,conf.idm));

        //static content such as css, images, etcw
        app.use("/static", express.static(path.join(__dirname, './static')));

        // TODO: Enable HTTPS
        // TODO: Replace by new and local settings file
        /* var options = {
           key: fs.readFileSync(conf.site.tls.key),
           cert: fs.readFileSync(conf.site.tls.cert)
           };
           https.createServer(options, app).listen(conf.site.https_port);*/
        /* app.listen(conf.site.http_port);
        app.listen(conf.site.https_port); */

        // w.info("Dashboard listening on port "+conf.site.http_port+ " for http ");
        // w.info("Dashboard listening on port "+conf.site.https_port+ " for https ");
        
        resolve(app);
    });
}

function valid(o) {
    return (o !== undefined) && (o !== null);
}

module.exports = {
    init: init
}
