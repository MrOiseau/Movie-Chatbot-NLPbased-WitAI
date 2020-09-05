const express = require('express');
const homepageController = require('../controllers/homepageController');
const chatBotController = require('../controllers/chatbotController');

let router = express.Router();

let initWebRoutes = (app)=> {

    router.get('/', homepageController.getHomepage);
                  /*(req, res) => {
        return res.send('Zdraaavo svete! :)'); */

    // Route handler for registering the webhook (app endpoint)	
    router.get('/webhook', chatBotController.getWebhook);
    // Receive all incoming messages from Fb
    router.post('/webhook', chatBotController.postWebhookVerify);
    router.post('/webhook', chatBotController.postWebhook);

    
    return app.use('/', router);
};

module.exports = initWebRoutes;