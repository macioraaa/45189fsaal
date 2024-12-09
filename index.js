const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const express = require('express');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Stałe
const CHANNEL_ID = '1300959721171324948'; // ID kanału do monitorowania
let messageCount = 0; // Licznik wiadomości
let repCount = 0; // Licznik reputacji
const statusMessages = ["Ogląda VØLT STORE"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

// Serwer HTTP
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// Logowanie
async function login() {
    try {
        await client.login(process.env.TOKEN);
        console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
        console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
        console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
    } catch (error) {
        console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
        process.exit(1);
    }
}

// Aktualizacja statusu
function updateStatus() {
    const currentStatus = statusMessages[currentStatusIndex];
    const currentType = statusTypes[currentTypeIndex];
    client.user.setPresence({
        activities: [{ name: currentStatus, type: ActivityType.Custom }],
        status: currentType,
    });
    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
    currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
    currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

// Aktualizacja nazwy kanału
async function updateChannelName() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
        const newName = `✅〢legit-check➜${repCount}`;
        await channel.setName(newName).catch(console.error);
    }
}

// Obsługa zdarzeń
client.once('ready', () => {
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
    updateStatus();
    setInterval(updateStatus, 10000); // Aktualizuj status co 10 sekund
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

// Heartbeat
function heartbeat() {
    setInterval(() => {
        console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
    }, 30000);
}

heartbeat();
login();
