const logger = require("winston");
var settings = require("../settings.js").storage;

if(settings.type === "mongodb") {
    var client = require("mongodb").MongoClient;

    logger.log("info", "Initialize MongoDB Database");

    var admin = "";
    var pwd = "";

    var url = "mongodb://"+settings.host+":"+settings.port;

    var adminDB = null;
    var newDB = null;
    var db = null;
    
    client.connect(url)
        .then(function(_db) {
            db = _db;
            adminDB = db.admin();
            if(admin === "" || pwd === "") {
                logger.log("warn", "No admin password or user specified. Try to continue without.");
                return Promise.resolve();
            } else 
                return adminDB.authenticate(admin, pwd);
        })
        .then(function() {
            return db.db(settings.dbname);
        }, function(err) {
            logger.log('error', "Unable to authenticate as admin.");
            return Promise.reject(err);
        })
        .then(function(_db) {
            newDB = _db;
            return newDB.addUser(settings.user, settings.password, { roles : [ { role : "readWrite", db : settings.dbname }, { role : "dbOwner", db : settings.dbname } ] } ).then(
                function() {
                    return Promise.resolve();
                },
                function(err) {
                    logger.log('warn', "Database user was not created. It may already exist.");
                    return Promise.resolve();
                }
            );
        }, function(err) {
            logger.log('error', "Unable to change or create datasensor collection.");
            return Promise.reject(err);
        })
        .then(function() {
            return newDB.authenticate(settings.user, settings.password);
        })
        .then(function() {
            logger.log('info', "User '"+settings.user+"' is authenticated now.");
            return newDB.createCollection("sensordata").then(
                function() {
                    logger.log("info", "Sensor data collection successfully created.");
                    return Promise.resolve();
                },
                function(err) {
                    logger.log("warn", "Collection 'sensordata' may already exist. Collection not created.", err);
                    return Promise.resolve();
                });
        })
        .then(function() {
            return newDB.createIndex("sensordata", { lastUpdate : -1 }).then(
                function() {
                    logger.log("info", "Index for sensordata created successfully.");
                    return Promise.resolve();
                },
                function(err) {
                    logger.log("warn", "Unable to create index for sensordata. Index may already exist.");
                    return Promise.resolve();
                });
            }
        )
        .then(function() {
            logger.log("info", "SERIOS database successfully initialized.");
            db.close();
        })
        .catch(function(err) {
            console.log(err);
            db.close();
        });
}
