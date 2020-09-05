const request = require ('request');
const bodyParser = require('body-parser');

const config = require('../config');
const FBinterface = require('../services/fbinterface');
const tmdb = require('../services/tmdb');

const f = new FBinterface(config.FB);

let getWebhook = (req, res) => {
    //res.send('Zdraaavo svete! :)');
	f.registerHook(req, res);
}

let postWebhookVerify = () => {
	bodyParser.json({
		verify: f.verifyRequestSignature.call(f)
	});
}

let postWebhook = (req, res) => {
// Messages will be received here if the signature goes through
    // we will pass the messages to FBinterface for parsing
	return f.incoming(req, res, async data => {
		//console.log(data);
		try {
			//Process messages
			if(data.message && data.message.nlp)
				await tmdb(data.message.nlp)
					.then(response => {
						//console.log(response);
						f.txt(data.sender, response.txt);
						if (response.img) {
							f.img(data.sender, response.img);
						}
					})
					.catch(error => {
						console.log(error);
						f.txt(data.sender, 'Moji serveri proveravaju. Vratite se kasnije...');
					});			

				// If a text message is received, use f.txt or f.img to send text/image back.
			//if(data.content) {
				//await f.txt(data.sender, `Rekli ste ${data.content}`);
				//console.log(data.message)
				// If enabled NLP Built-in on developers.facebook.com
				// console.log(data.message.nlp.intents[0].name);
				// console.log(data.message.nlp.entities["movie:movie"][0].value);
				// console.log(data.message.nlp.detected_locales[0]);
			//}
			// if(data.content === 'zdravo bote'){
			// 	await f.txt(data.sender, 'zdravo od mene :)');
			// }
			
		} catch (error) {
			console.log(error);
		}
    });
    
    // Subscribe
    f.subscribe();
}

module.exports = {
	postWebhookVerify: postWebhookVerify,
    postWebhook: postWebhook,
    getWebhook: getWebhook
  };