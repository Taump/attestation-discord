const { start, dictionary } = require("attestation-kit");

dictionary.set("discord");

const DiscordStrategy = require("./DiscordStrategy");
const webserver = require("./webserver");

start(async () => {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET || !process.env.DISCORD_REDIRECT_URI) {
        throw new Error("Missing Discord configuration");
    }

    new DiscordStrategy()

    await webserver();
});
