const { isValidDeviceAddress } = require('ocore/validation_utils');

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI
} = process.env;

module.exports = async (request, reply) => {
    const { code, state: deviceAddress } = request.query;

    if (!code || !deviceAddress || !isValidDeviceAddress(deviceAddress)) {
        reply.code(400).send({ error: 'No code or state provided' });
        return;
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

            reply.redirect(`/auth/discord/${deviceAddress}`);
            return;
        }

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        const { id, username } = userData ?? {};

        if (!id || !username || !deviceAddress) {
            reply.code(400).send({ error: 'Failed to get user data' });
            return;
        }


        // TODO: Save the user data to the database
        reply.send({ id, username, deviceAddress });
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Something went wrong' });
    }
};
