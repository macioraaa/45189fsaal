const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

// Konfiguracja bota
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Konfiguracja serwera HTTP
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// Konfiguracja statusu
const statusMessages = ["Ogląda VØLT STORE"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

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

// Funkcja do aktualizacji nazwy kanału
async function updateChannelName(channel) {
  try {
    let count = 0;
    let lastId = null;

    // Pobieraj wiadomości bez limitu
    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages = await channel.messages.fetch(options);
      if (messages.size === 0) break; // Jeśli nie ma więcej wiadomości, zakończ pętlę

      messages.forEach((msg) => {
        if (msg.content.includes('+rep')) count++;
      });

      lastId = messages.last().id; // Zaktualizuj ostatni ID dla następnej iteracji
    }

    // Aktualizuj nazwę kanału
    const newName = `✅〢legit-check➜${count}`;
    if (channel.name !== newName) {
      await channel.setName(newName);
      console.log(`Zaktualizowano nazwę kanału na: ${newName}`);
    }
  } catch (error) {
    console.error('Wystąpił błąd podczas aktualizacji nazwy kanału:', error);
  }
}

// Funkcja logowania
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

// Funkcja heartbeat
function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

// Obsługa eventu po zalogowaniu
client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

// Obsługa eventu wiadomości
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  // Sprawdź, czy wiadomość zawiera "+rep"
  if (message.content.includes('+rep')) {
    const channel = message.channel;
    await updateChannelName(channel);
  }
});

login();

