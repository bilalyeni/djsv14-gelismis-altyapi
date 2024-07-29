const {SlashCommandBuilder, PermissionsBitField, ChannelType} = require('discord.js');
const schemaTicketConfig = require('../../../schemas/config');

module.exports = {
    data: {
		name: "ticket-config",
        aliases: [],
        usage: "ticket-config",
		cooldown: 0,
        description: "Configure the ticket system",
		slash: new SlashCommandBuilder()
        .addSubcommand(subcommand => subcommand
            .setName('category')
            .setDescription('Set the category for tickets')
            .addChannelOption(option => option.setName('category-open').setDescription('The category where the open tickets will be created').setRequired(true))
            .addChannelOption(option => option.setName('category-closed').setDescription('The category where the closed tickets will be moved').setRequired(true))
            .addChannelOption(option => option.setName('channel-transcript').setDescription('The channel where the transcript will be sent').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand
            .setName('role')
            .setDescription('Set the role for tickets')
            .addRoleOption(option => option.setName('role-support').setDescription('The role that can see and manage tickets').setRequired(true))
        ),
	},

    async executeSlash(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return interaction.reply({content: 'You need to be have manage channel permission to use this command', ephemeral: true});
        const subcommand = interaction.options.getSubcommand();
        const config = await schemaTicketConfig.findOne({guildID: interaction.guild.id});
        if (!config) schemaTicketConfig.create({guildID: interaction.guild.id, ticketOpenCatID: null, ticketClosedCatID: null, ticketOverflowCatID: null, ticketRoles: null});
        switch (subcommand) {
            case 'category':
                const categoryOpen = interaction.options.getChannel('category-open');
                const categoryClosed = interaction.options.getChannel('category-closed');
                const categoryOverflow = interaction.options.getChannel('channel-transcript');
                if (categoryOpen.type !== ChannelType.GuildCategory || categoryClosed.type !== ChannelType.GuildCategory || categoryOverflow.type !== ChannelType.GuildText) return interaction.reply({content: 'The channels must be a category', ephemeral: true});

                await schemaTicketConfig.findOneAndUpdate({guildID: interaction.guild.id}, {ticketOpenCatID: categoryOpen.id, ticketClosedCatID: categoryClosed.id, ticketTranscriptsID: categoryOverflow.id});
                interaction.reply({content: 'The categories have been set', ephemeral: true});
            break;
            case 'role':
                const roleSupport = interaction.options.getRole('role-support');
                await schemaTicketConfig.findOneAndUpdate({guildID: interaction.guild.id}, {ticketRoles: roleSupport.id});
                interaction.reply({content: 'The role has been set', ephemeral: true});
            break;
            default:
                interaction.reply({content: 'You need to specify a subcommand', ephemeral: true});
            break;
        }
    }
}