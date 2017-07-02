var http = require('http');
var express = require("express");
var RED = require("node-red");

function init(server) {
    // Create an Express app
    var app = express();

    // Add a simple route for static content served from 'public'
    console.log("-0-");
    app.use("/",express.static("public"));
    console.log("-1-");

    // Create the settings object - see default settings.js file for other options
    var settings = {
        httpAdminRoot:"/neros",
        httpNodeRoot: "/neros",
        ui: {
            path: "/neros/ui"
        },
        logging: {
            console: {
                level: "debug"
            }
        },
        // userDir:"/home/nol/.nodered/",
        functionGlobalContext: { }    // enables global context
    };

    // Initialise the runtime with a server and settings
    RED.init(server,settings);

    console.log("-2-");

    // Serve the editor UI from /red
    app.use(settings.httpAdminRoot,RED.httpAdmin);

    // Serve the http nodes UI from /api
    app.use(settings.httpNodeRoot,RED.httpNode);

    console.log("-3-");
    
    RED.start();

    console.log("-4-");

    return app;
}

module.exports = {
    init: init
}
