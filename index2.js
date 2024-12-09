const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const CHANNEL_ID = '1300959721171324948'; // Wstaw ID kanału, który ma być monitorowany
let messageCount = 0; // Licznik wiadomości
let repCount = 0; // Licznik reputacji

client.once('ready', () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
    updateChannelName();
});

client.on('messageCreate', async (message) => {
    // Ignoruj wiadomości od bota
    if (message.author.bot) return;

    // Aktualizacja liczby wiadomości
    if (message.channel.id === CHANNEL_ID) {
        messageCount++;
        await updateChannelName();
    }

    // Reakcja na komendę +rep
    if (message.content === '+rep') {
        repCount++;
        await updateChannelName();
    }
});

async function updateChannelName() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
        const newName = `✅〢legit-check➜${messageCount}`;
        await channel.setName(newName).catch(console.error);
    }
}

client.login('TWÓJ_TOKEN');
