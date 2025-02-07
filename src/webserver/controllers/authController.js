const { isValidDeviceAddress } = require('ocore/validation_utils');
const { walletSessionStore, dictionary } = require('attestation-kit');

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

    const deviceAddress = request.params.device_address;
    const { sessionId } = request.query;

    if (!deviceAddress || !isValidDeviceAddress(deviceAddress)) {
        return reply.code(400).send({ error: dictionary.discord.INVALID_DEVICE });
    }

    const session = await walletSessionStore.getSession(deviceAddress);

    if (!session) return reply.code(400).send({ error: dictionary.discord.NO_SESSION });

    const id = session.id;

    if (!sessionId || sessionId !== id) return reply.code(400).send({ error: 'Invalid session' });

    const state = encodeURIComponent(deviceAddress + '_' + id);

    const redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=${scope}&state=${state}`;

    return reply.redirect(redirectUrl);
}