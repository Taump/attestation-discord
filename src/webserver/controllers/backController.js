const { utils, db } = require("attestation-kit");
const conf = require("ocore/conf");

module.exports = async (request, reply) => {
    const url = utils.generateParingBackUrl();
    const orderId = request.params.order_id;

    if (!orderId) return reply.code(400).send({ error: 'Order ID is required.' });

    const order = await db.getAttestationOrders({ id: Number(orderId) });

    if (!order) return reply.code(404).send({ error: 'Order not found.' });

    const walletAddress = order.user_wallet_address;

    if (!walletAddress) return reply.code(404).send({ error: 'Wallet address not found.' });

    return reply.type('text/html').send(`
        <html>
        <head>
            <title>Attestation status</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        </head>
        
        <body style="padding: 0px; margin: 0px; background: #313338; font-size: 16px;">
            <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100vh; font-family: 'Noto Sans'; ">
                <div style="border: 1px solid #111214; padding-left: 30px; padding-right: 30px; padding-bottom: 30px; border-radius: 8px; color: #b5bac1;">
                    <h1 style="color: #f2f3f5;">Attested data</h1>

                    <div><b>${order.dataKey0}</b>: ${order.dataValue0}</div>
                    <div><b>${order.dataKey1}</b>: ${order.dataValue1}</div>
                    <div><b>address</b>: <a target="_blank" style="color: #b5bac1r;" href="https://${conf.testnet ? 'testnet' : ''}explorer.obyte.org/address/${walletAddress}">${walletAddress}</a></div>

                    <div style="margin-top: 15px;">
                        <a href="${url}" style="display: inline-block; padding: 10px 20px; background: #5765f2; color: #f2f3f5; text-decoration: none; border-radius: 5px;">Back to your wallet</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
}