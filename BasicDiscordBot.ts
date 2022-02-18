const dotenv = require('dotenv');
dotenv.config();
const { NODE_ENV, BETA_DISCORD_TOKEN, PRODUCTION_DISCORD_TOKEN } = process.env;

import { Client, ClientOptions, Intents, Interaction, Message } from 'discord.js';

/*

This is another really great resource: https://discordjs.guide/creating-your-bot

the following packages are used and here are their purposes:

dependencies:
@discordjs/rest - used to register our interaction commands
discord-api-types - used for getting the types for the rest api used when registering our interaction commands
discord.js - a library used to make it 10x easier to work with the discord api
dotenv - used to hold api tokens, and general environment information

devDependencies:
typescript
ts-node
@types/node - to get basic node types
cross-env - makes it so you can use env variables in your npm scripts for developing on multiple os's
ts-node-dev - used for hot reloading typescript
nodemon - used for hot reloading which is a dependency for ts-node-dev
*/

//These are specific permissions that this bot actually needs to work, you may have to add more depending on what
//you are actually doing for example another permission is GUILD_VOICE_STATES
//you can find documented list of these permissions here: https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
const options: ClientOptions = {
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
};

//start an instance of the client
const client: Client = new Client(options);

//once the client is ready lets say the bot is now running in the console.
client.once('ready', () => {
	console.log('bot is now running...');
});

//login to Discord
client.login(NODE_ENV === 'beta' ? BETA_DISCORD_TOKEN : PRODUCTION_DISCORD_TOKEN);

//Here are a couple examples of some events
//there are a lot of other events you can hook into you can find them here: https://discord.js.org/#/docs/discord.js/stable/class/Client
client.on('messageCreate', (message: Message) => {
	//one thing you need to make sure of on this particular event is that the user isn't the bot itself
	if (message.author.bot) return;
	if (message.content.includes('test')) message.reply('you typed test in your message!');
});

client.on('interactionCreate', (interaction: Interaction) => {
	if (!interaction.isCommand()) return;
	try {
		switch (interaction.commandName) {
			case 'reverse':
				//we use the interaction.option object to get any named parameters we used when
				//registering the commands in the deploy script
				const reversibleMessage = interaction.options.getString('message');
				interaction.reply(Array.from(reversibleMessage).reverse().join(''));
				break;
			case 'hi':
				interaction.reply(`Hi ${interaction.user.username}!`);
				break;
			default:
				interaction.reply('command not found');
				break;
		}
	} catch (error) {
		console.error('error running command:', error);
		interaction.reply(`An Error occurred while executing a command:${error}`);
	}
});
