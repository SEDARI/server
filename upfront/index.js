var express = require('express');
var bodyParser = require('body-parser');

var upfront = require('UPFROnt');
var pap = upfront.pap;

var upfrontSettings = require('./settings.js');

var errorHandler = function (err, req, res, next) {
    console.log(err.stack);
    res.status(400).json({error: "unexpected_error", message: err.toString()});
};

function init(settings, security) {
    return upfront.init(upfrontSettings).then(function() {
        return security.init()
    }).then(function() {
        var p = "/";    
        if(settings.server && settings.server.path) {
            p = settings.server.path;
            if(!p.endsWith("/"))
                p += "/";
        }

        var app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(errorHandler);      

        app.get("/:id/:property?", function(req, res, next) { console.log("--- GET ---");next(); }, security.checkAuth, get);
        app.put("/:id/:property?", function(req, res, next) { console.log("--- PUT ---");next(); }, set);
        app.delete("/:id/:property?", security.checkAuth, del);

        return app;
    });
}

function get(req, res) {
    var id = req.params.id;
    var property = req.params.property;

    console.log("id: ", id);
    console.log("prop: ", property);

    pap.get(id, property).then(function(p) {
        res.status(200).json(p).end();
    }, function(e) {
        console.log(e);
        res.status(403).json({ err: e }).end();
    });
}

function set(req, res, policy) {
    var id = req.params.id;
    var property = req.params.property;
    var policy = req.body;
    
    console.log("id: ", id);
    console.log("prop: ", property);
    console.log("POLICY: ", policy);

    pap.set(id, property, policy).then(function(p) {
        res.status(200).json(p).end();
    }, function(e) {
        console.log(e);
        res.status(403).json({ err: e }).end();
    });
}

function del(req, res) {
    var id = req.params.id;
    var property = req.params.property;

    pap.del(id, property).then(function(p) {
        res.status(200).json(p).end();
    }, function(e) {
        console.log(e);
        res.status(403).json({ err: e }).end();
    });
}

module.exports = {
    init: init
};
