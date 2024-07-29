const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');

module.exports = {
    data: {
		name: "ticket-post",
        aliases: [],
        usage: "ticket-post",
		cooldown: 0,
        description: "Ticket.",
		slash: new SlashCommandBuilder()
        .addStringOption(option => option.setName('title').setDescription('Title of the ticket').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Channel to post the ticket in').setRequired(true)),
	},
    
    async executeSlash(interaction) {
        const title = interaction.options.getString('title') || 'Ticket';
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const embed = new EmbedBuilder().setTitle(title).setDescription('Click the button below to create a ticket').setColor('Blue');
        const button = new ButtonBuilder().setCustomId(`ticket`).setLabel('Create Ticket').setStyle('1');
        const actionRow = new ActionRowBuilder().addComponents(button);
        await channel.send({embeds: [embed], components: [actionRow]});
        await interaction.reply({content: 'Ticket posted', ephemeral: true});
    }
}