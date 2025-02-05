const { walletSessionStore, utils, db, dictionary } = require('attestation-kit');
const { isValidDeviceAddress, isValidAddress } = require('ocore/validation_utils');
const device = require('ocore/device');
const conf = require('ocore/conf');

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI
} = process.env;

module.exports = async (request, reply) => {
    const { code, state = '' } = request.query;

    if (!code || !state || typeof state !== 'string') {
        return reply.code(400).send({ error: dictionary.discord.NO_CODE_OR_STATE });
    }

    const [deviceAddress, sessionIdFromUrl] = state.split('_');

    if (!deviceAddress || !isValidDeviceAddress(deviceAddress)) {
        return reply.code(400).send({ error: dictionary.discord.INVALID_DEVICE });
    }

    const session = await walletSessionStore.getSession(deviceAddress);

    if (!session) return reply.code(400).send({ error: dictionary.discord.NO_SESSION });

    const sessionId = session.id;
    const walletAddress = await walletSessionStore.getSessionWalletAddress(deviceAddress);

    if (!walletAddress || !isValidAddress(walletAddress)) {
        return reply.code(400).send({ error: dictionary.discord.INVALID_WALLET_ADDRESS });
    }

    if (!session || sessionId !== sessionIdFromUrl || !walletAddress) {
        return reply.code(400).send({ error: 'Invalid session' });
    }

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            // Something went wrong; Let's redirect the user back to auth page

            return reply.redirect(`/auth/discord/${deviceAddress}`);
        }

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        const { id, username } = userData ?? {};

        if (!id || !username || !deviceAddress) {
            return reply.code(400).send({ error: 'Failed to get user data' });
        }

        const data = { username, userId: id };

        const order = await db.getAttestationOrders({ data, address: walletAddress });

        if (order) {
            device.sendMessageToDevice(deviceAddress, 'text', dictionary.discord.ALREADY_ATTESTED + '\nUnit: ' + `https://${conf.testnet ? 'testnet' : ''}explorer.obyte.org/${order.unit}`);
            device.sendMessageToDevice(deviceAddress, 'text', `If you want to attest another wallet address or discord account, please use [attest](command:attest) command.`);

            return reply.redirect(`/auth/back/${order.id}`);
        }

        const orderId = await db.createAttestationOrder(data, walletAddress);

        device.sendMessageToDevice(deviceAddress, 'text', `Your data for attestation:
            ID: ${id}
            Username: ${username}
            Wallet address: ${walletAddress}
        `);

        const unit = await utils.postAttestationProfile(walletAddress, data);

        await db.updateUnitAndChangeStatus(data, walletAddress, unit);

        await walletSessionStore.deleteSession(deviceAddress);

        device.sendMessageToDevice(deviceAddress, 'text', `Your discord account is now attested, attestation unit: https://${conf.testnet ? 'testnet' : ''}explorer.obyte.org/${unit}`);
        device.sendMessageToDevice(deviceAddress, 'text', `If you want to attest another wallet address or discord account, please use [attest](command:attest) command.`);

        return reply.redirect(`/auth/back/${orderId}`);
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Something went wrong' });
    }
};
