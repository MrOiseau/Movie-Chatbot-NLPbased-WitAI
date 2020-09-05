'use strict';

const crypto = require('crypto');
const request = require('request');
const apiVersion = 'v8.0';

class FBinterface {
	constructor({ PAGE_ACCESS_TOKEN, VERIFY_TOKEN, APP_SECRET }) {
		try {
			if (PAGE_ACCESS_TOKEN && VERIFY_TOKEN && APP_SECRET) {
				this.PAGE_ACCESS_TOKEN = PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = VERIFY_TOKEN;
				this.APP_SECRET = APP_SECRET;
			} else {
				throw new Error("One or more credentials are missing!");
			}
		} catch(e) {
			console.log(e);
		}
	}

	// Establish endpoint URL for sending and recieving messages from Fb
	registerHook(req, res) {
		// Parse the query params that comes from req stream from Fb
		let mode = req.query['hub.mode'];
		let token = req.query['hub.verify_token'];
		let challenge = req.query['hub.challenge'];
      // if mode === 'subscribe' and token === verifytoken, then send back req.query.hub.challenge
      	try {
			// Checks if a token and mode is in the query string of the request
			if (mode && token) {
				// Checks the mode and token sent is correct
				if(mode === 'subscribe' && token === this.VERIFY_TOKEN) {
					console.log("Webhook is registered!");
					res.status(200).send(challenge);
				} else {
					throw "Failed validation. Could not register webhook! Make sure the validation tokens match.";
					return res.sendStatus(403);
				}
			}
      	} catch(e) {
        	console.log(e);
		}
	}

	//Verify messages are coming from Fb not from e.g. malware
	verifyRequestSignature(req, res, buf) {
		return (req, res, buf) => {
			if(req.method === 'POST') {
				try {
					// Extract x-hub-signature header that we get from Fb
					let signature = req.headers['x-hub-signature'];
					if(!signature) {
						throw "Signature is not received!";
					} else {
						// Create hash signature using sha1 crypto algorithm & appSecret as a key 
						// .update(payload-raw body json that we get from Fb in POST req)
						let hash = crypto.createHmac('sha1', this.APP_SECRET).update(buf, 'utf-8');
						if(hash.digest('hex') !== signature.split("=")[1]) {		//need hash in x format (hex)
							// Implement a logging and notification mechanism
							throw "Couldn't validate the request signature!";
						}
					}
				} catch (e) {
					console.log(e);
				}
			}
		}
	}

	subscribe() {
		request({
			uri: `https://graph.facebook.com/${apiVersion}/109548070874231/subscribed_apps`,
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST'
		}, (error, response, body) => {
			if(!error  && JSON.parse(body)) {
				console.log("Subscribed to the page!");
			} else {
				console.log(error);
			}
		});
	}

	// Parse incoming messages from Fb
	incoming(req, res, cb) {
		// Send Fb that message is received
		res.sendStatus(200);
		// Make sure this is a page subscription
		if(req.body.object === 'page' && req.body.entry) {
			// Extract the body of the POST request
			let data = req.body; 
			//console.log(JSON.stringify(data)); //console.log(data);
			// Iterate through the page entry Array
			data.entry.forEach(pageObj => {
				if(pageObj.messaging) {
					// Iterate through the messaging Array
					pageObj.messaging.forEach(messageObj => {
						//console.log(JSON.stringify(messageObj));  //console.log(messageObj);
						// Check if the event is a message or postback and
            			// pass the event to the appropriate handler function
						if(messageObj.postback) {
							// Handle postbacks
						} else {
							// Handle messages
							return cb(this.messageHandler(messageObj));  //return cb(messageObj);
						}
					});
				}
			});
		}
    }
	
	//Structure of received messages from Fb
    messageHandler(obj) {
        let sender = obj.sender.id;
        let message = obj.message;
	
		//For text messages that comes from Fb
        if(message.text) {
          let obj = {
            sender,
			type: 'text',
			message,				
            content: message.text
          }
    
          return obj;
        }
    }

	// Call Facebook's Send API endpoint - send message to Fb
	sendMessage(payload) {		
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: `https://graph.facebook.com/${apiVersion}/me/messages`,
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: payload
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve({
						mid: body.message_id
					});
				} else {
					reject(error);
				}
			});
		});
    }

	// Send a text message
	txt(id, text, messaging_type = 'RESPONSE') {
		let obj = {
			messaging_type,
			recipient: { id },
			message: {
				text
			}
		}
		return this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	// Send an image message
	img(id, url, messaging_type = 'RESPONSE') {
		let obj = {
			messaging_type,
			recipient: { id },
			message: {
				attachment: {
					type: 'image',
					payload: {
						url
					}
				}
			}
		}
		return this.sendMessage(obj)
			.catch(error => console.log(error));
	}
}

module.exports = FBinterface;
