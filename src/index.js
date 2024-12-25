const { start, dictionary } = require("attestation-kit");

dictionary.set("discord");

const DiscordStrategy = require("./DiscordStrategy");
const webserver = require("./webserver");

start(async () => {
    new DiscordStrategy()

    await webserver();
});
