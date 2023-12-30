const { Client, Collection, Intents, MessageEmbed } = require("discord.js");
const db = require('quick.db');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const colors = require("colors");
const wait = require('node:timers/promises').setTimeout;
const config = require("./config.json");
const fs = require('fs');
const ms = require('ms');
const Fs = require('fs');
const fetch = require('node-fetch');
const express = require('express');
const port = 3000;
const app = express();

const client = new Client({
	intents: 32767
});

// Creating a new host with express:
// NO QUITES LOS CREDITOS CABRON.
// NO QUITES LOS CREDITOS CABRON.
app.get('/', (request, response) => {
	return response.sendFile('./web/index.html', { root: '.' });
});
app.listen(port, () => {
  console.log("made by karzyy".brightGreen);
});

// Cool console messages:
// NO QUITES LOS CREDITOS CABRON.
// NO QUITES LOS CREDITOS CABRON.
console.log("made by karzyy".brightGreen);


// Collections and handler:
client.commands = new Collection();
client.slash_commands = new Collection();
client.aliases = new Collection();
client.events = new Collection();
client.systems = new Collection();
client.snipes = new Map();
client.categories = fs.readdirSync("./commands");

// Economy:
client.shop = {
	mobile: {
		cost: 1000
	},
	fishing_rod: {
		cost: 1500
	},
	laptop: {
		cost: 2000
	},
	computer: {
		cost: 3000
	},
	op_fishing_rod: {
		cost: 4500
	},
	car: {
		cost: 5000
	},
	castle: {
		cost: 8000
	},
	mansion: {
		cost: 10000
	}
};

// Music:
const { Player } = require('discord-player');
client.player = new Player(client, config.music.options.discord_player);
const player = client.player;

// Exporting the modules:
module.exports = client;

// Handler:
["command", "slash", "event", "systems", "mongo"].forEach(handler => {
	require(`./handlers/${handler}`)(client);
});

// Anti swear:
client.on("guildMemberAdd", async (member) => {
	let UserJSON = JSON.parse(Fs.readFileSync("./storage/antiswear/users.json"));
	UserJSON[member.id] = {
		warns: 0
	}
	Fs.writeFileSync("./storage/antiswear/users.json", JSON.stringify(UserJSON));
})

let badWords = require("./storage/antiswear/badwords.json")

client.on("messageCreate", async (message) => {
	
	let UserJSON = JSON.parse(Fs.readFileSync("./storage/antiswear/users.json"));

	if (!UserJSON[message.author.id]) {
		if (message.author.bot) return;
		UserJSON[message.author.id] = {
			warns: 0
		}
		Fs.writeFileSync("./storage/antiswear/users.json", JSON.stringify(UserJSON));
	}
	for (i = 0; i < badWords.length; i++) {

		try {
			const fetch = await db.fetch(`antiswear_${message.guild.id}`);
		} catch (e) {
			
		}

		if (fetch == true) {

			if (message.member.permissions.has("ADMINISTRATOR")) return;

			if (message.content.toLowerCase().includes(badWords[i])) {

				message.channel.send(`${message.author}, **You are not allowed to swear here!** Continuing with 3 total infractions will ends in a mute.`).then(async (msg) => {
					await wait(5000);
					msg.delete();
				})

				message.delete().catch(() => { });

				UserJSON[message.author.id].warns += 1;
				Fs.writeFileSync("./storage/antiswear/users.json", JSON.stringify(UserJSON));

				try {

					if (UserJSON[message.author.id].warns === 3) {

						(Fs.readFileSync("./storage/antiswear/users.json"));

						UserJSON[message.author.id].warns = 0;

						Fs.writeFileSync("./storage/antiswear/users.json", JSON.stringify(UserJSON));

						const user = message.member

						const time = "3m";

						if (!time) return;

						const milliseconds = ms(time);

						const iosTime = new Date(Date.now() + milliseconds).toISOString();

						try {

							await fetch(`https://discord.com/api/guilds/${message.guild.id}/members/${user.id}`, {
								method: 'PATCH',
								body: JSON.stringify({ communication_disabled_until: iosTime }),
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bot ${client.token}`,
								},
							});

						} catch (err) {
							console.log("[ERR] ", err)
						}

						const embedMuted = new MessageEmbed()
							.setTitle("Auto-moderation system:")
							.setDescription(`Muted user: ${user} (\`${user.id}\`)` + "\n" + `Duration: \`${time}\`` + "\n" + `Reason: **continuous infractions.**`)
							.setTimestamp()
							.setColor("RED");

						message.channel.send({ embeds: [embedMuted] }).catch(() => { });

					}
				} catch (err) {
					console.log(err)
				}
			}

		} else {
			return;
		}
	}
});

// Anticrash handler:
process.on('unhandledRejection', err => {
	console.log(`[ERROR] Unhandled promise rejection: ${err.message}.`.red);
	console.log(err);
});

// Login to the bot:
client.login(process.env.TOKEN || config.secrets.TOKEN).catch((e) => console.log(e));