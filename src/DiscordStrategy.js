const device = require('ocore/device');
const { BaseStrategy, dictionary } = require('attestation-kit');

/**
 * DiscordStrategy class extends BaseStrategy for Discord-based attestation.
 * @class
 * @extends BaseStrategy
 */
class DiscordStrategy extends BaseStrategy {
    /**
    * Constructs a new TelegramStrategy instance.
    * @param {object} options - Configuration options for the strategy.
    * @param {string} options.token - The Telegram bot token(TELEGRAM_BOT_TOKEN).
    * @throws {ErrorWithMessage} Throws an error if the token(TELEGRAM_BOT_TOKEN) is missing.
    */
    constructor(options) {
        super(options);

        // Nothing to do here
    }

    walletAddressVerified(deviceAddress, walletAddress) {
        if (this.validate.isWalletAddress(walletAddress)) {
            this.sessionStore.createSession(deviceAddress, true);
            this.sessionStore.setSessionWalletAddress(deviceAddress, walletAddress);

            const url = process.env.domain + `/auth/discord/${deviceAddress}`;

            device.sendMessageToDevice(deviceAddress, 'text', dictionary.discord.VERIFIED);
            device.sendMessageToDevice(deviceAddress, 'text', dictionary.discord.URL_LINK + '\n' + url);
        } else {
            return device.sendMessageToDevice(deviceAddress, 'text', dictionary.common.INVALID_WALLET_ADDRESS);
        }
    }

    onWalletPaired(deviceAddress) {
        device.sendMessageToDevice(deviceAddress, 'text', dictionary.common.WELCOME);
        device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.ASK_ADDRESS);
    }

    onAddressAdded(deviceAddress, walletAddress) {
        device.sendMessageToDevice(deviceAddress, 'text', dictionary.wallet.ASK_VERIFY_FN(walletAddress));
    }

    /**
     * Initializes the Discord
     * @returns {void}
     */
    init() { }
}


module.exports = DiscordStrategy;