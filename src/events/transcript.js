const discordTranscripts = require('discord-html-transcripts');
const {Events} = require('discord.js');
const fs = require('fs');
const path = require('path');




module.exports = {
    name: "Interaction Trancript",
    eventName: "interactionCreate",
    once: false,
    async execute(interaction) {
        if (interaction.isButton() && interaction.customId.startsWith('closeTicket')) {
            (`Closing ticket ${interaction.customId.split('-')}`);

            await makeTransFile(interaction.customId.split('-')[2], interaction);
           
        }
    }
}

async function makeTransFile(channelId, i) {
    const channel = i.guild.channels.cache.get(channelId);
    (`Creating transcript for channel ${channelId}`);
    const trans = await discordTranscripts.createTranscript(channel);

    if (!fs.existsSync(path.join(__dirname, 'transcripts'))) {
        fs.mkdirSync(path.join(__dirname, 'transcripts'));
    }

    const transcriptFilePath = path.join(__dirname, 'transcripts', `transcript_${channelId}.html`);
    fs.writeFileSync(transcriptFilePath, trans.attachment.toString());
    (`Transcript for channel ${channelId} created.`);
}
