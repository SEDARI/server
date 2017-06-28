var express = require('express');
var w = require('winston');
w.level = process.env.LOG_LEVEL;

var ulocks = require('ULocks');

var idmCore = require('./idm');
var dashboard = require('./dashboard');
var ac = require('./security');
var serios = require('./serios');

var Promise = require('bluebird');

var settings = require('./settings');
var ulocksSettings = require('./ulocks/settings');

function init() {
    var mainApp = express();
    
    return new Promise(function(resolve, reject) {
        w.info("Initializing SEDARI components");

        // TODO: - get Ulocks initialized and running
        //       - check code from Juan whether he tests a successful init of ulocks
        ulocks.init(ulocksSettings).then(function() {
            idmCore.init().then(function(idmApp) {
                serios.init(settings.serios, ac).then(function(seriosApp) {
                    var s = settings.serios;
                    var prefix = (!valid(s) || !valid(s.rest) || !valid(s.rest.prefix)) ? "serios" : s.rest.prefix;
                    if(prefix[0] === '/')
                        prefix = s.rest.prefix.substring(1);
                    if(prefix.length === 0)
                        prefix = "serios";
                    mainApp.use("/"+prefix, seriosApp);

                    // TODO: UNIFY SETTINGS OF DIFFERENT COMPONENTS
                    // THIS IS CONFUSING!!!
                    
                    var dashBoardApp = express();
                    dashboard.init().then(function(app) {
                        w.info("SEDARI Dashboard is ready");
                        app.use(mainApp);
                        
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
            w.error("Failed to init ULock system");
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
