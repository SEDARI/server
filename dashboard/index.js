var w = require('winston');
w.level = process.env.LOG_LEVEL;

var idmMgmt = require('./idm');

function init(app, prefix) {
    return new Promise(function(resolve, reject) {
        idmMgmt.init().then(function(app) {
            resolve(app);
        }, function(e) {
            reject(e);
        });
    });
}

module.exports = {
    init: init
}
