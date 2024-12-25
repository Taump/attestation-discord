const { utils, dictionary } = require("attestation-kit");

module.exports = (_, reply) => {
    const url = utils.generateParingBackUrl();

    return reply.type('text/html').send(`
        <html>
        <head>
            <script>
                setTimeout(() => {
                    window.location.href = "${url}";
                }, 1000);
            </script>
        </head>
        
        <body>
            <div>${dictionary.discord.CAN_CLOSE_WINDOW}</div>
        </body>
        </html>
        `);
}