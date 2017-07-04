module.exports = function(RED) {
    "use strict";
    var http = require("follow-redirects").http;
    var https = require("follow-redirects").https;
    var urllib = require("url");
    var mustache = require("mustache");
    var querystring = require("querystring");
    var cookie = require("cookie");
    var hashSum = require("hash-sum");
    var request = require("request");

    function SORequest(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var nodeSeriosUrl = n.seriosurl;
        var nodeSOID = n.soid;
        var nodeStream = n.stream;

        if (RED.settings.httpRequestTimeout) {
            this.reqTimeout = parseInt(RED.settings.httpRequestTimeout) || 120000;
        } else {
            this.reqTimeout = 120000;
        }

        this.on("input",function(msg) {
            var preRequestTimestamp = process.hrtime();
            node.status({fill:"blue",shape:"dot",text:"httpin.status.requesting"});
            
            var url = nodeSeriosUrl || msg.seriosurl;
            if (msg.seriosurl && nodeSeropsUrl && (nodeSeriosUrl !== msg.seriosurl)) {  // revert change below when warning is finally removed
                node.warn(RED._("common.errors.nooverride"));
            }

            if (!url) {
                node.error(RED._("httpin.errors.no-url"),msg);
                return;
            }
            // url must start http:// or https:// so assume http:// if not set
            if (url.indexOf("://") !== -1 && url.indexOf("http") !== 0) {
                node.warn(RED._("httpin.errors.invalid-transport"));
                node.status({fill:"red",shape:"ring",text:"httpin.errors.invalid-transport"});
                return;
            }
            if (!((url.indexOf("http://") === 0) || (url.indexOf("https://") === 0))) {
                if (tlsNode) {
                    url = "https://"+url;
                } else {
                    url = "http://"+url;
                }
            }

            var opts = {};
            opts.url = "http://localhost:3000/oauth2/token";
            opts.method = "POST";
            opts.form = {grant_type: 'client_credentials'},
            opts.headers = {'Authorization': 'Basic '+new Buffer(this.credentials.client+":"+this.credentials.password).toString('base64')}
            console.log("opts: ", opts);
            
            var userToken = null;
            var tokenReq = request(opts, function(terror, tresponse, tbody) {
                console.log(tbody);
                try {
                    var parsed = JSON.parse(tbody);
                    console.log("parsed: ", parsed['access_token']);
                    userToken = parsed["access_token"];
                } catch(e) {
                    console.log(e);
                }
                console.log("userToken: ", userToken);

                url = url + "/"+nodeSOID+"/streams/"+nodeStream+"/lastUpdate";
                console.log("url: ", url);
                opts.url = url;
                opts.method = "GET";
                opts.headers = {
                    'Authorization': 'bearer ' + userToken,
                    'Content-Type': 'application/json'
                };
                
                request(opts, function(err, res, body) {
                    if(err === null) {
                        var jsonBody = null;
                        console.log(body);
                        try { jsonBody = JSON.parse(body) }
                        catch(e) { node.warn(RED._("httpin.errors.json-error")); }
                        
                        msg.payload = jsonBody;
                        
                        node.send(msg);
                        node.status({});
                    } else {
                        node.error(err,msg);
                        msg.payload = err.toString() + " : " + url;
                        msg.statusCode = err.code;
                        node.send(msg);
                        node.status({fill:"red",shape:"ring",text:err.code});
                    }
                });
            });
        });

        this.on("close",function() {
            node.status({});
        });
    }

    RED.nodes.registerType("so request", SORequest,{
        credentials: {
            client: {type:"text"},
            password: {type: "password"}
        }
    });
}
