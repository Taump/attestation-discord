const { isValidDeviceAddress } = require('ocore/validation_utils');

const scope = encodeURIComponent('identify');

const {
    DISCORD_CLIENT_ID,
    DISCORD_REDIRECT_URI
} = process.env;

module.exports = async (request, reply) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
        reply.code(500).send({ error: 'Missing Discord client ID or redirect URI' });
        return;
    }

    const deviceAddress = request.params.deviceAddress;

    if (!deviceAddress || !isValidDeviceAddress(deviceAddress)) {
        reply.code(400).send({ error: 'Invalid device address' });
        return;
    }

    const state = encodeURIComponent(deviceAddress);

    const redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}&state=${state}`;

    reply.redirect(redirectUrl);
}