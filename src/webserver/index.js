const conf = require('ocore/conf');
const { webserver: fastifyInstance, utils } = require("attestation-kit");

const authController = require('./controllers/authController');
const authCallbackController = require('./controllers/authCallbackController');
const backController = require('./controllers/backController');

module.exports = async () => {
    fastifyInstance.get('/auth/discord/:device_address(^(?!callback$).+)', authController);
    fastifyInstance.get('/auth/discord/callback', authCallbackController);
    fastifyInstance.get('/auth/back/:order_id', backController);

    await fastifyInstance.listen({ port: conf.webserverPort, host: '0.0.0.0' });

    utils.logger.info('Server running on port', conf.webserverPort);
}
