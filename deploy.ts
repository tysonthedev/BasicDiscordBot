const dotenv = require('dotenv');
dotenv.config();
const {
	NODE_ENV,
	BETA_GUILD_ID,
	BETA_DISCORD_TOKEN,
	BETA_CLIENT_ID,
	PRODUCTION_DISCORD_TOKEN,
	PRODUCTION_CLIENT_ID,
} = process.env;

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

//Guild Id is only used for beta
const GUILD_ID: string | undefined = NODE_ENV === 'beta' ? BETA_GUILD_ID : undefined;
const DISCORD_TOKEN: string | undefined = NODE_ENV === 'beta' ? BETA_DISCORD_TOKEN : PRODUCTION_DISCORD_TOKEN;
const CLIENT_ID: string | undefined = NODE_ENV === 'beta' ? BETA_CLIENT_ID : PRODUCTION_CLIENT_ID;

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

//usually you would pull each command from separate files but for simplicity this is here
const commands = [
	//this is a very simple example of a slash command with no arguments
	new SlashCommandBuilder().setName('hi').setDescription('Says hi to you'),
	//this is a more advanced example that includes a parameter that also has a description for the end user
	new SlashCommandBuilder()
		.setName('reverse')
		.setDescription('reverses whatever you type in')
		.addStringOption((option: any) =>
			option.setName('message').setDescription('What you would like to reverse').setRequired(true)
		),
].map((command) => command.toJSON());

//register all commands to whatever environment you run from the npm scripts
(async () => {
	try {
		console.log(`Deploying ${NODE_ENV}!`);
		switch (NODE_ENV) {
			case 'beta':
				//when you specify a guild in this particular endpoint it will only register the commands to that guild
				//this is MUCH MUCH quicker but of course you can only go to one server which is why it's only used on beta
				await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
					body: commands,
				});
				break;
			case 'production':
				//When you don't specify a guild id it will slowly populate all of the servers your bot is a part of
				console.warn('It can take up to an hour to fully update commands across all guilds!');
				await rest.put(Routes.applicationCommands(CLIENT_ID), {
					body: commands,
				});
				break;
		}
		console.log(`Successfully deployed ${NODE_ENV}!`);
	} catch (error) {
		console.error(`Failed to deploy ${NODE_ENV}!`);
		console.error(error);
	}
})();
