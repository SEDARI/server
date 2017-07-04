var http = require('http');
var express = require("express");
var RED = require("node-red");

var clientCredentials = null;

function init(server, ccs) {
    // Create an Express app
    var app = express();

    clientCredentials = ccs;

    // Add a simple route for static content served from 'public'
    app.use("/",express.static("public"));

    // Create the settings object - see default settings.js file for other options
    var settings = {
        httpAdminRoot:"/neros",
        httpNodeRoot: "/neros",
        ui: {
            path: "/ui"
        },
        nodesDir: __dirname + "/neros/nodes",
        logging: {
            console: {
                level: "info"
            }
        },
        // userDir:"/home/nol/.nodered/",
        functionGlobalContext: { // make client credentials available globally
            clientCredentials: clientCredentials
        },

        /* httpNodeMiddleware: function(req,res,next) {
        // Handle/reject the request, or pass it on to the http in node by calling next();
        // Optionally skip our rawBodyParser by setting this to true;
        //req.skipRawBodyParser = true;
        console.log("node middleware processed");
        next();
        }  */
    };

    // Initialise the runtime with a server and settings
    RED.init(server,settings);

    // Serve the editor UI from /red
    app.use(settings.httpAdminRoot,RED.httpAdmin);

    // Serve the http nodes UI from /api
    app.use(settings.httpNodeRoot,RED.httpNode);

    RED.start();

    return app;
}

module.exports = {
    init: init
}
