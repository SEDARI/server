module.exports = {
    server : {
        tls : false,
        host : "127.0.0.1",
        port : 3002,
        cluster : 0
    },
    serios: {
        rest: {
            prefix: "serios"
        },
        storage: {
            type: "mongodb",
            host: "localhost",
            port: "27017",
            dbname: "serios-database",
            user: "serios",
            password: "serios",
            max_number_of_sensor_data_saved : 10000,
            max_duration_of_sensor_data_saved: {
                value: 30,
                // one of 'seconds', 'minutes', 'hours', 'days'.
                timeunit: "days"
            },
            testdbname: "serios-test",
            testuser: "seriosTest",
            testpassword: "seriosTest"
        }
    },
    security: {
        pdp : {
            ulocks: {
                entityTypes : {
                    "/any"    :  0,
                    "/group"  :  1,
                    "/user"   :  2,
                    "/sensor" :  3,
                    "/client" :  4,
                    "/api"    :  5,
                    "/const"  :  6,
                    "/attr"   :  6,
                    "/prop"   :  6,
                    "/var"    :  6,
                },
                locks: "./ulocks/Locks/",
                actions: "./ulocks/Actions"
            }
        },
        pap: {
            server: {
                "host": "localhost",
                port: 1234,
                path: "/pap/",
                tls: false,
                cluster: 1
            },
            storage: {
                type: "mongodb",
                host: "localhost",
                port: 27017,
                password: "",
                user: "",
                dbName: "pap-database",
                collection: "policies",
                
                cache: {
                    enabled: false,
                    TTL: 600,
                    sync: {
                        type: "redis",
                        channel: "policyUpdates"
                    }
                }
            }
        }
    }
};
