//{"target":{"type":"user"},"locks":[{"path":"hasId","args":["$owner"]}]
module.exports = {
    "storage": {
        "dbName": "state/database_"
    },
    "upfront": {
        pdp: {
            ulocks: {
                entityTypes: {
                    "/any": 0,
                    "/group": 1,
                    "/user": 2,
                    "/sensor": 3,
                    "/client": 4,
                    "/api": 5,
                    "/const": 6,
                    "/attr": 6,
                    "/prop": 6,
                    "/var": 6,
                },
                //fix this two eventually...
                locks: "./node_modules/agile-idm-core/node_modules/UPFROnt/example/online/Locks/",
                actions: "./node_modules/agile-idm-core/node_modules/UPFROnt/example/online/Actions"
            }
        },
        pap: {
            // this specifies host, port and path where
            // this module should wait for requests
            // if specified, the module runs as a PAP server
            // if undefined, the module runs as a PAP client
            // accessing another PAP server
            /*server: {
              "host": "localhost",
              port: 1234,
              path: "/pap/",
              tls: false,
              cluster: 1
              },*/
            // storage specifies where the policies
            // are stored persistently:
            // 1. if policies are stored remotely
            // in another PAP, specify as type "remote"
            // and indicate host, port and path
            // 2. if policies are stored locally
            // in a database, specify the db module
            // ("mongodb", tbd) and the hostname and
            // port
            // thus, specifying type "remote" and specifying
            // api yields an invalid configuration
            storage: {
                // module_name: "agile-upfront-leveldb",
                type: "mongodb",
                host: "localhost",
                port: 27017,
                password: "",
                user: "",
                dbName: "pap-database",
                collection: "policies",
                // specifies whether the module should check
                // the cache to fetch a policy, of course,
                // this may induce additional lookups but on
                // average using the cache is recommended
                cache: {
                    enabled: false,
                    TTL: 600,
                    pubsub: {
                        type: "redis",
                        channel: "policyUpdates"
                    }
                }
            }
        }
    },
    "policies": {
        "create_entity_policy": [
            // actions of an actor are not restricted a priori
            {
                target: {
                    type: "/any"
                }
            }, {
                source: {
                    type: "/any"
                }
            }
        ],
        "top_level_policy": {
            flows: [
                // all properties can be read by everyone
                {
                    target: {
                        type: "/any"
                    }
                },
                // all properties can only be changed by the owner of the entity
                {
                    source: {
                        type: "/user"
                    },
                    locks: [{
                        lock: "isOwner"
                    }]
                },
                {
                    source: {
                        type: "/user"
                    },
                    locks: [{
                        lock: "attrEq",
                        args: ["role", "admin"]
                    }]
                }

            ],
            actions: [{
                name: "delete"
            }]
        },
        "attribute_level_policies": {
            "user": {
                "password": [
                    // the property can only be read by the user itself
                    {
                        target: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // the property can be set by the user itself and
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // by all users with role admin
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "attrEq",
                            args: ["role", "admin"]
                        }]
                    }
                ],
                "credentials": [
                    // the property can only be read by the user itself
                    {
                        target: {
                            type: "/any"
                        }
                    },
                    // the property can be set by the user itself and
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // by all users with role admin
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "attrEq",
                            args: ["role", "admin"]
                        }]
                    }
                ],
                "credentials.dropbox": [
                    // the property can only be read by the user itself
                    {
                        target: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // the property can be set by the user itself and
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // by all users with role admin
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "attrEq",
                            args: ["role", "admin"]
                        }]
                    }
                ],
                "role": [
                    // can be read by everyone
                    {
                        target: {
                            type: "/any"
                        }
                    },
                    // can only be changed by users with role admin
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "attrEq",
                            args: ["role", "admin"]
                        }]
                    }
                ]
            },
            "sensor": {
                "credentials": {
                    flows: [
                        // all properties can be read by everyone
                        {
                            target: {
                                type: "/any"
                            }
                        },
                        // all properties can only be changed by the owner of the entity
                        {
                            source: {
                                type: "/user"
                            },
                            locks: [{
                                lock: "isOwner"
                            }]
                        }
                    ]
                },
                "credentials.dropbox": [
                    // the property can only be read by the user itself
                    {
                        target: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // the property can be set by the user itself and
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "isOwner"
                        }]
                    },
                    // by all users with role admin
                    {
                        source: {
                            type: "/user"
                        },
                        locks: [{
                            lock: "attrEq",
                            args: ["role", "admin"]
                        }]
                    }
                ]
            }

        }
    },
    "schema-validation": [{
        "id": "/sensor",
        "additionalProperties": false,
        "type": "object",
        "properties": {
            "name": {
                "type": "string"
            },
            "credentials": {
                "type": "object",
                "additionalProperties": true,
                "properties": {
                    "dropbox": {
                        "type": "string"
                    }
                }
            }

        },
        "required": ["name"]
    }, {
        "id": "/user",
        "additionalProperties": false,
        "type": "object",
        "properties": {
            "user_name": {
                "type": "string"
            },
            "auth_type": {
                "type": "string"
            },
            "password": {
                "type": "string"
            },
            "role": {
                "type": "string"
            }
        },
        "required": ["user_name", "auth_type"]
    }, {
        "id": "/client",
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "name": {
                "type": "string"
            },
            "clientSecret": {
                "type": "string"
            },
            "redirectURI": {
                "type": "string"
            }
        },
        "required": ["name", "redirectURI"]
    }],
    "configure_on_boot": {
        "user": {
            "username": "bob",
            "auth_type": "agile-local",
            "role": "admin",
            "password": "secret"
        },
        "client": {
            "id": "AGILE-OSJS",
            "name": "AGILE-OSJS",
            "uri": "http://agilegw.local:8000/"
        }
    }

};
