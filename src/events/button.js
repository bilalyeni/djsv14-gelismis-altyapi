const {Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits, ButtonBuilder} = require('discord.js')
const ticketSchema = require('../../schemas/ticket');
const configSchema = require('../../schemas/config');
const config2 = require('../../config');

const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs');

const path = require('path');


app.get('/ticket/:channelId', async (req, res) => {
    const channelId = req.params.channelId;
    const transcriptFilePath = path.join(__dirname, 'transcripts', `transcript_${channelId}.html`);

    console.log(`Sending transcript for channel ${channelId}`);
  
    try {
      if (!fs.existsSync(transcriptFilePath)) {
        res.status(404).send('Transcript not found.');
        return;
      }
      
      res.sendFile(transcriptFilePath);
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).send('Internal server error.');
    }
  });
  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = {
    name: "Interaction Ticket",
    eventName: "interactionCreate",
    once: false,
    async execute(interaction) {
        try {

            if (interaction.isButton() && interaction.customId === 'ticket') {
                const config = await configSchema.findOne({ guildID: interaction.guild.id });
                if (!config) return interaction.reply({ content: 'Konfigürasyon bulunamadı!', ephemeral: true });

               /* const existingTicket = await ticketSchema.findOne({ guildId: interaction.guild.id, userId: interaction.user.id, claimed: false });
                if (existingTicket) return interaction.reply({ content: 'Zaten açık bir biletiniz var!', ephemeral: true });*/

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('ticketType')
                    .setPlaceholder('Seçmek için tıklayın!')
                    .addOptions([
                        { label: 'Management Team', value: 'Management' },
                        { label: 'Event Team', value: 'Event' },
                        { label: 'Human Resources Team', value: 'HumanResources' },
                        { label: 'Community Team', value: 'Community' },
                        { label: 'Other', value: 'other' }
                    ]);

                const row = new ActionRowBuilder().addComponents(selectMenu);
                return interaction.reply({ embeds: [new EmbedBuilder().setDescription(`${config2.yükleniyoremoji} **Lütfen iletişime geçmek istediğiniz departmanı seçin!**`).setColor(config2.normal)], components: [row], ephemeral: true });
            }
            else if (interaction.isButton() && interaction.customId.startsWith('claimTicket')) {
                await handleClaim(interaction);
            } else if (interaction.isButton() && interaction.customId.startsWith('closeTicket')) {
                await handleClose(interaction);
            }


            if (interaction.isStringSelectMenu() && interaction.customId === 'ticketType') {
                if (interaction.values[0] === 'other') {
                    const modal = modalBuilder('Other Ticket', 'otherTicketModal', [
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('otherTicketInput')
                                .setLabel('Describe your issue or request')
                                .setStyle(TextInputStyle.Paragraph)
                        )
                    ]);
                    return interaction.showModal(modal);
                } else {
                    await createTicket(interaction, interaction.values[0]);
                }
            }

            if (interaction.isModalSubmit() && interaction.customId === 'otherTicketModal') {
                const userInput = interaction.fields.getTextInputValue('otherTicketInput');
                await createTicket(interaction, 'other', userInput);
            }
        } catch (err) {
            console.log("Error")

        }

    }
};

async function createTicket(interaction, type, details = '') {
    const config = await configSchema.findOne({ guildID: interaction.guild.id });
    const ticketId = Math.floor(Math.random() * 1000000);

    const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${ticketId}`,
        type: ChannelType.GuildText,
        parent: config.ticketOpenCatID,
        permissionOverwrites: [
            {
                id: interaction.guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
            },
        ],
    });

    const ticket = new ticketSchema({
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        channelId: ticketChannel.id,
        ticketId: ticketId,
        createdAt: new Date(),
        claimed: false,
        claimedBy: null,
    });

    await ticket.save();

    const embed = new EmbedBuilder()
        .setTitle('Ticket Created')
        .setDescription(`Please wait for a staff member to claim your ticket. \n\n**Ticket ID:** ${ticketId} \n**Type:** ${type}`)
        .setColor('Green')
        .setTimestamp();
    
    const buttonRows = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`claimTicket-${ticketId}`)
            .setLabel('Claim Ticket')
            .setStyle('3'),
        new ButtonBuilder()
            .setCustomId(`closeTicket-${ticketId}-${ticket.channelId}`)
            .setLabel('Close Ticket')
            .setStyle('4')
    )    

    ticketChannel.send({ embeds: [embed], components: [buttonRows] });

    //interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
    await interaction.reply({ content: ``, embeds: [new EmbedBuilder().setDescription(`${config2.yükleniyoremoji} **Creating your ticket...**`).setColor(config2.normal)], ephemeral: true });
    await interaction.editReply({ content: ``, embeds: [new EmbedBuilder().setDescription(`${config2.onayemoji} **Successfuly Created your ticket in ${ticketChannel}**`).setColor(config2.normal)],  ephemeral: true });
}

function modalBuilder(title, id, components) {
    return new ModalBuilder()
        .setTitle(title)
        .setCustomId(id)
        .setComponents(components)
}

async function handleClaim(interaction) {
    const ticketId = interaction.customId.split('-')[1];
    const ticket = await ticketSchema.findOne({ guildId: interaction.guild.id, ticketId: ticketId, claimed: false });
    const config = await configSchema.findOne({ guildID: interaction.guild.id });

    if (!ticket) return interaction.reply({ content: 'Ticket already claimed!', ephemeral: true });
    if (ticket.claimedBy) return interaction.reply({ content: 'Ticket already claimed!', ephemeral: true });

    if (!interaction.member.roles.cache.some(role => config.ticketRoles.includes(role.id))) {
        return interaction.reply({ content: 'You do not have permission to claim tickets!', ephemeral: true });
    }

    ticket.claimedBy = interaction.user.id;
    ticket.claimed = true;
    await ticket.save();

    const claimEmbed = new EmbedBuilder()
        .setTitle('Ticket Claimed')
        .setDescription(`Ticket has been claimed by ${interaction.user}`)
        .setColor('Green');

    await interaction.channel.send({ embeds: [claimEmbed] });
    interaction.reply({ content: 'Ticket claimed successfully!', ephemeral: true });
}


async function handleClose(interaction) {
    const ticketId = interaction.customId.split('-')[1];
    const ticket = await ticketSchema.findOne({ guildId: interaction.guild.id, ticketId: ticketId });
    const config = await configSchema.findOne({ guildID: interaction.guild.id });

    if (!ticket) return interaction.reply({ content: 'Ticket not found!', ephemeral: true });
    if (!interaction.member.roles.cache.some(role => config.ticketRoles.includes(role.id))) {
        return interaction.reply({ content: 'You do not have permission to close tickets!', ephemeral: true });
    }

    const ticketChannel = interaction.guild.channels.cache.get(ticket.channelId);
    if (!ticketChannel) return interaction.reply({ content: 'Ticket channel not found!', ephemeral: true });

    const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`confirmCloseTicket-${ticketId}`)
            .setLabel('Confirm')
            .setStyle('4')
    );

    await interaction.reply({ content: 'Are you sure you want to close this ticket?', components: [confirmRow], ephemeral: true });

    const filter = i => i.customId === `confirmCloseTicket-${ticketId}` && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
        if (i.customId === `confirmCloseTicket-${ticketId}`) {
            const closeEmbed = new EmbedBuilder()
                .setTitle('Ticket Closed')
                .setDescription(`Ticket has been closed by ${interaction.user}, and will be deleted in 5 seconds. If you need further assistance, please open a new ticket.`)
                .setColor('Red');
            
            await ticketChannel.send({ embeds: [closeEmbed] });

            await new Promise(resolve => setTimeout(resolve, 5000));

            await ticketChannel.permissionOverwrites.create(interaction.guild.roles.everyone, { deny: [PermissionFlagsBits.ViewChannel] });

            await ticketChannel.edit({ name: `closed-${ticketId}`, parent: config.ticketClosedCatID });
            const transEmbed = new EmbedBuilder()
                .setTitle('Ticket Transcript')
                .setDescription(`This is the transcript for ticket #${ticketId}`)
                .setColor('Green')
                .setTimestamp();
            const viewTransRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('View Transcript')
                    .setStyle('5')
                    .setURL(`http://localhost:3000/ticket/${ticket.channelId}`)
            )
            const channel = interaction.guild.channels.cache.get(config.ticketTranscriptsID);
            await channel.send({ embeds: [transEmbed], components: [viewTransRow] });
            await ticketSchema.deleteOne({ guildId: interaction.guild.id, ticketId: ticketId });


        }
    });
}
