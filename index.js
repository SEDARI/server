var express = require('express');
var login = require('connect-ensure-login');

var w = require('winston');
w.level = process.env.LOG_LEVEL;

var idmCore = require('./idm');
var dashboard = require('./dashboard');
var security = require('./security');
var serios = require('./serios');
var neros = require('./neros');
var upfront = require('./upfront');

var Promise = require('bluebird');

var settings = require('./settings');

function init(server) {
    var mainApp = express();
    
    return new Promise(function(resolve, reject) {
        w.info("Initializing SEDARI components");

        // TODO: - get Ulocks initialized and running
        //       - check code from Juan whether he tests a successful init of ulocks

        idmCore.init().then(function(idmApp) {
            serios.init(settings.serios, security).then(function(seriosApp) {
                upfront.init(settings, security).then(function(upfrontApp) {
                    var s = settings.serios;
                    var prefix = (!valid(s) || !valid(s.rest) || !valid(s.rest.prefix)) ? "serios" : s.rest.prefix;
                    if(prefix[0] === '/')
                        prefix = s.rest.prefix.substring(1);
                    if(prefix.length === 0)
                        prefix = "serios";
                    mainApp.use("/"+prefix, seriosApp);

                    mainApp.use("/pap", upfrontApp);

                    // TODO: UNIFY SETTINGS OF DIFFERENT COMPONENTS
                    // THIS IS CONFUSING!!!
                    
                    var dashBoardApp = express();
                    dashboard.init().then(function(app) {
                        w.info("SEDARI Dashboard is ready");
                        app.use(mainApp);
                        
                        app.use("/", login.ensureLoggedIn('/auth/example/'));
                        // route mounting of neros must be handled by its settings
                        // otherwise the websocket will listen on wrong path
                        app.use("/", neros.init(server));
                        
                        resolve(app);
                    }, function(e) {
                        w.error("Failed to init dashboard");
                        reject(e);
                        });
                }, function(e) {
                    w.error("Failed to init SERIOS: ", e);
                    reject(e);
                });
            }, function(e) {
                w.error("Failed to init IDM Core");
                reject(e);
            });
        }, function(e) {
            w.error("Failed to init UPFROnt system");
            reject(e);
        });
    });
}

function valid(o) {
    return o !== undefined && o !== null;
}

module.exports = {
    init: init
}
