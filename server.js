#!/usr/bin/env node
var express = require('express');
var w = require('winston');
w.level = process.env.LOG_LEVEL;

var logger = require('morgan');

var sedari = require("./index");

var settingsFile = "./settings";
try {
    var settings = require(settingsFile);
    settings.settingsFile = settingsFile;
} catch(err) {
    if (err.code == 'MODULE_NOT_FOUND') {
        w.error("Unable to load settings file: "+settingsFile);
    } else {
        w.error(err);
    }
    process.exit();
}

var useCluster = false;
var cluster = null;
if(settings.server && settings.server.cluster && settings.server.cluster > 0) {
    cluster = require('cluster');
    useCluster = true;
}

if (useCluster && cluster.isMaster) {
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;
    if(settings.server.cluster < cpuCount)
        cpuCount = settings.server.cluster;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
} else {
    var app = express();

    app.use(logger('dev'));

    // ensure connections are closed after request
    // has been served
    app.use(function(req, res, next) {
        res.setHeader('Connection', 'close');
        next();
    });

    var server = app.listen(settings.server.port,
                            settings.server.host,
                            function () {
                                process.tite = "SEDARI Server";
                                w.info('SEDARI Server now running at '+getListenPath());
                            });

    sedari.init(server).then(function(core) {
        app.use(core);
        w.info("SEDARI core is now running");
    }, function(e) {
        w.error("Failed to init and start enabled SEDARI components");
        w.error(e);
    });

    server.on('error', function(e) {
        w.error("Unable to start SEDARI Server!");
        w.error(e);
        process.exit();
    });
}

function getListenPath() {
    var listenPath = 'http' + (settings.server.tls ? 's' : '') + '://'+
        (settings.server.host == '0.0.0.0' ? '127.0.0.1' : settings.server.host)+':'+settings.server.port + "/";
    return listenPath;
}
