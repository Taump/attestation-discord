const conf = require('ocore/conf');
const { webserver: fastifyInstance, utils } = require("attestation-kit");

const authController = require('./controllers/authCallbackController');
const authCallbackController = require('./controllers/authCallbackController');

module.exports = async () => {
    fastifyInstance.get('/auth/discord/:deviceAddress', authController);
    fastifyInstance.get('/auth/discord/callback', authCallbackController);

    await fastifyInstance.listen({ port: conf.webserverPort, host: '0.0.0.0' });

    utils.logger.info('Server running on port', conf.webserverPort);
}
