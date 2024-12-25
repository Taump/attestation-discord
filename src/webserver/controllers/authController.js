const { isValidDeviceAddress } = require('ocore/validation_utils');
const { walletSessionStore } = require('attestation-kit');

const scope = encodeURIComponent('identify');

const {
    DISCORD_CLIENT_ID,
    DISCORD_REDIRECT_URI
} = process.env;

module.exports = async (request, reply) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
        reply.code(500).send({ error: 'Could not find a Discord client ID or redirect URI. Make sure they are set, then restart the process.' });
        return;
    }

    const deviceAddress = request.params.deviceAddress;

    if (!deviceAddress || !isValidDeviceAddress(deviceAddress)) {
        return reply.code(400).send({ error: 'Invalid device address' });
    }

    if (!walletSessionStore.getSession(deviceAddress)) {
        return reply.code(400).send({ error: 'We couldn\'t find your session. Please go back to the wallet app and start the authentication process again.' });
    }

    const session = walletSessionStore.getSession(deviceAddress);
    const id = session.get('id');

    const state = encodeURIComponent(deviceAddress + '_' + id);

    const redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}&state=${state}`;

    return reply.redirect(redirectUrl);
}