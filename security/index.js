var passport = require('passport');
var w = require('winston');
w.level = process.env.LOG_LEVEL;

var upfront = require('UPFROnt');
var pap = upfront.pap;
var pdp = upfront.pdp;
var pep = upfront.pep;

var IdmCore = require('agile-idm-core');

var settings = require('./../upfront/settings');
var idmSettings = require('./../idm/conf/agile-idm-core-conf');

var idmCore = null;

var userDefaultPolicy = {
    flows: [
        {
            to: true,
        },
        {
            to: false,
        }
    ]
};

var soDefaultEntityPolicy = {
    flows: [
        // all properties can only be read by the owner of the entity
        {
            to: true,
            locks: [
                { lock: "isOwner" }
            ]
        },
        // all properties can only be changed by the owner of the entity or the admin
        {
            to: false,
            locks: [
                { lock: "isOwner" }
            ]
        },
        {
            to: false,
            locks: [
                { lock: "hasType", args: [ "/user" ] },
                { lock: "attrEq", args: ["role", "admin"] }
            ]
        }
    ]
};

var soDefaultDataPolicy = {
    flows: [
        // all properties can only be read by the owner of the entity
        {
            to: true,
            locks: [
                { lock: "isOwner" }
            ]
        },
        {
            to: true,
            locks: [
                { lock: "hasType", args: [ "/user" ] },
                { lock: "attrEq", args: ["role", "user"] }
            ]
        },
        // all properties can only be changed by the owner of the entity or the admin
        {
            to: false,
            locks: [
                { lock: "isOwner" }
            ]
        },
        {
            to: false,
            locks: [
                { lock: "hasType", args: [ "/user" ] },
                { lock: "attrEq", args: ["role", "admin"] }
            ]
        }
    ]
};

var initialized = false;

function init() {
    if(!initialized)
        return upfront.init(settings).then(function() {
            idmCore = new IdmCore(idmSettings);
            initialized = true;
        });
    else
        return Promise.resolve();
}

var checkAuth = function(req, res, next) {
    // TODO: check whether ensured-login would be a better choice
    if(req.user) {
        next();
    } else {
        console.log("CHECK AUTH");
        passport.authenticate('agile-bearer', {session: false})(req, res, next);
    }
};

var checkAuthOrToken = function(req, res, next) {
    // TODO: as above - check correctness
    if(req.user) {
        next();
    } else {
        serviceObject.checkToken(req, res).then(function(hasToken) {
            if(hasToken)
                next();
            else
                passport.authenticate('agile-bearer', {session: false})(req, res, next);
        }, function(err) {
            res.status(403).end();
        });
    }
}

var checkPermission = function(req, res, next) {
    next();
}

var checkCreateEntity = function(userInfo, type) {
    w.debug("SERIOS.security.checkCreateEntity('"+userInfo+"')");
    
    return Promise.resolve({ grant: true });
}

// TODO: Set policies for api_token (should not be visible to other users than owner)
var createEntity = function(userInfo, object, type) {
    w.debug("SERIOS.security.createEntity('"+userInfo+"', '"+object+"')");

    // TODO: Use promise chaining 
    
    return new Promise(function(resolve, reject) {
        if(valid(object.id)) {
            w.debug("object id is valid");
            pap.set(object.id, soDefaultEntityPolicy).then(function() {
                pap.set(object.id, "", soDefaultEntityPolicy).then(function() {
                    w.debug("Entity policy set");
                    pap.set(object.id+"_data", soDefaultDataPolicy).then(function() {
                        pap.set(object.id+"_data", "", soDefaultDataPolicy).then(function() {
                            try {
                                // TODO: discuss with Juan
                                var entity = {
                                    "name": object.name,
                                    "credentials": { "dropbox": "none"}
                                }
                                idmCore.createEntity(userInfo, object.id, type, entity).then(function() {
                                    w.debug("Success creating entity in IDMx");
                                }, function(e) {
                                    w.error("Entity in IDM not created: "+e);
                                });
                            } catch(e) {
                                console.log("ERROR: ", e);
                            }
                            w.debug("Policy for generated data set");
                            resolve();
                        }, function(err) {
                            w.error("Unable to set policy for data: ", err);
                            reject(err);
                        });
                    }, function(err) {
                        w.error("Unable to create data policy entity: ", err);
                    });
                }, function(err) {
                    w.error("Unable to set policy for entity structure: ", err);
                    reject(err);
                });
            }, function(err) {
                w.error("Unable to set entity policy: ", err);
                reject(err);
            });
        } else {
            w.debug("object id is invalid");
            reject(new Error("Objet does not provde ID for policy specification"));
        }
    });
}

var checkCreateData = function(userInfo) {
    // Don't do anything here, the soID is contained
    // in the data set, thus, it can be linked to the
    // SO and its policy (this is not the way to go
    // but a first step to a proper realization)
    
    w.debug("SERIOS.security.checkCreateData('"+userInfo+"')");
    
    return Promise.resolve({ grant: true });
}

var createData = function(userInfo, object) {
    w.debug("SERIOS.security.createData('"+userInfo+"', '"+object+"')");

    
    
    return Promise.resolve();
}

var checkDelete = function(userID, objectID, type) {
    w.debug("SERIOS.security.checkDelete('"+userID+"', '"+objectID+"')");
    
    return Promise.resolve({ grant: true });
}

var postDelete = function(userID, objectID, type) {
    w.debug("SERIOS.security.postDelete('"+userID+"', '"+objectID+"')");
    
    return Promise.resolve();
}

// TODO: checkRead must be called with all data stored for a SO/SU

var checkRead = function(userInfo, object, type) {
    if(type === "/sensor") {
        w.debug("SERIOS.security.checkRead('"+userInfo.id+"', '"+object.id+"')");
        return new Promise(function(resolve, reject) {
            if(valid(object.id) && valid(userInfo.id)) {
                pap.get(object.id, "").then(function(objectPolicy) {
                    w.debug("objectPolicy: ", objectPolicy);
                    object.type = type;
                    var p = pdp.checkRead(userInfo, userDefaultPolicy, object, objectPolicy);
                    p.then(function(d) {
                        w.debug("PDP decision: ", d);
                        resolve(d);
                    }, function(err) {
                        w.debug("PDP unable to decide: ", err);
                        reject(err);
                    });
                }, function(err) {
                    w.debug("Unable to retrieve policy for object.");
                });
            } else {
                w.debug("object or user id is invalid");
                reject(new Error("Object or user does not provde ID for policy retrieval and checking!"));
            }
        });
    }

    if(type === "/data") {
        w.debug("SERIOS.security.checkRead('"+userInfo+"', '"+object+"')");
        return new Promise(function(resolve, reject) {
            if(valid(object.soID) && valid(userInfo.id)) {
                w.debug("object and user ids are valid");
                pap.get(object.soID+"_data", "").then(function(objectPolicy) {
                    w.debug("objectPolicy: ", objectPolicy);
                    object.type = type;
                    object.id = 1;
                    var p = pdp.checkRead(userInfo, userDefaultPolicy, object, objectPolicy);
                    p.then(function(d) {
                        w.debug("SEDARI.security.checkRead: PDP decision: ", d);
                        resolve(d);
                    }, function(err) {
                        w.debug("SEDARI.security.checkRead: PDP unable to decide: ", err);
                        reject(err);
                    });
                }, function(err) {
                    w.debug("Unable to retrieve policy for object.");
                });
            } else {
                w.debug("object or user id is invalid");
                reject(new Error("Object or user does not provde ID for policy retrieval and checking!"));
            }
        });
    }
}

var checkWrite = function(userInfo, objectID, type) {
    w.debug("SERIOS.security.checkWrite('"+userInfo.id+"', '"+objectID+"')");
    
    return Promise.resolve({ grant: true });
}

var declassify = function(userInfo, object, type) {
    if(type === "/data") {
        w.debug("SERIOS.security.declassify('"+userInfo+"', '"+object+"')");
        var tmpObject = object;
        tmpObject.streams = {};
        tmpObject.streams[object.stream] = { channels: object.channels };
        delete tmpObject.channels;
        delete tmpObject.stream;

        return new Promise(function(resolve, reject) {
            if(valid(object.soID) && valid(userInfo.id)) {
                pap.getFullRecord(object.soID+"_data").then(function(objectFullRecord) {
                    w.debug("objectRecord: " + JSON.stringify(objectFullRecord,null,2));
                    tmpObject.type = type;
                    tmpObject.id = 1;
                    var p = pep.declassify(tmpObject, objectFullRecord, userInfo, userDefaultPolicy);
                    p.then(function(r) {
                        w.debug("SEDARI.security.declassify: result: ", r);
                        r.stream = Object.keys(r.streams)[0];
                        r.channels = r.streams[r.stream].channels;
                        resolve(r);
                    }, function(err) {
                        w.debug("SEDARI.security.checkRead: PEP error during declassification: ", err);
                        reject(err);
                    });
                }, function(err) {
                    w.debug("Unable to retrieve policy for object.");
                });
            } else {
                w.debug("object or user id is invalid");
                reject(new Error("Object or user does not provde ID for policy retrieval and checking!"));
            }
        });
    }

    // for now, only retrieve the current policy
    // specified for the service object and check
    // the policy

    return Promise.resolve(object);
}

var valid = function(o) {
    return (o !== undefined) && (o !== null);
}

module.exports = {
    init: init,
    checkCreateEntity: checkCreateEntity,
    createEntity: createEntity,
    checkCreateData: checkCreateData,
    createData: createData,
    checkDelete: checkDelete,
    postDelete: postDelete,
    checkRead: checkRead,
    checkWrite: checkWrite,
    declassify: declassify,
    checkAuth: checkAuth,
    checkAuthOrToken: checkAuthOrToken,
    checkPermission: checkPermission
}
