// ===============================|  yourfriend  |===============================
// Kurulum hakkında bilgi için:
// https://github.com/yourfriendF/djsv14-gelismis-altyapi#-kurulum--%C3%A7al%C4%B1%C5%9Ft%C4%B1rma--notlar
// =========================================================================

/* Definitions */
const { Client, Collection, EmbedBuilder, Events, PermissionsBitField } = require("discord.js");
const client = new Client({
    intents: 53608447 // https://github.com/yourfriendF/djsv14-gelismis-altyapi#1--intent-ayarlama
});
client.setMaxListeners(50)
/* Configuration */
const settings = {
    token: "-", 
    prefixCommands: ["!", "PREFIX2"], // kullanılmayacaksa undefined yapın
    slashCommands: "1266545403994837125", // global veya sunucuIDsi yazın - slash olmayacaksa undefined yapın
    mongoDB: "mongodb+srv://bilal:bilal@bilal.1kliomi.mongodb.net/?retryWrites=true&w=majority&appName=bilal", //MongoDB URL'niz
}




/* Handlers */
import("./handler.js");
global.client = client;

/* LOG */
const Audit_Log = require('./schemas/auditlog');
const config = require("./config.js");

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
  
    if (interaction.customId === 'selectLoggingLevel') {
      const selectedLevels = interaction.values;
      const guildId = interaction.guildId;
  
      await Audit_Log.findOneAndUpdate(
        { Guild: guildId },
        { LogLevel: selectedLevels },
        { new: true, upsert: true }
      );
  
      // Fetch the updated settings to display in the embed
      const updatedSettings = await Audit_Log.findOne({ Guild: guildId });
      const updatedSettingsList = updatedSettings.LogLevel.length > 0
        ? updatedSettings.LogLevel.map(level => `• ${level}`).join('\n')
        : 'None selected.';
  
      // Update the embed to reflect the current selections
      const updatedEmbed = new EmbedBuilder()
        .setColor(config.normal)
        .setTitle("🔧 Audit Log Settings Updated")
        .setDescription(`Your audit log settings have been updated.\n\n**Current Logging Levels:**\n${updatedSettingsList}`)
        .setThumbnail("https://i.imgur.com/PcMoVgq.png")
        .setFooter({ text: "Audit log configuration." })
        .setTimestamp();
  
        await interaction.update({ embeds: [updatedEmbed] });
    }
  });

/////////////////////////////// GIRIS-CIKIS LOG ///////////////////////////////////////
  client.on(Events.GuildMemberAdd, async (member) => {
    if (!member.guild || member.user.bot) return;
  
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: member.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("guildMemberAdd")) return;
  
    const logChannel = member.guild.channels.cache.get(auditLogConfig.Channel);*/
    const logChannel = client.kanalbul("🔮・giriş-çıkış-log");
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle("LOGS | Yeni Kullanıcı Katıldı")
        .setColor(config.normal)
        .addFields([
          { name: "👤 Kullanıcı", value: `${member.user.tag} (${member.id})`, inline: true },
          { name: "👥 Toplam Kullanıcı", value: `${member.guild.memberCount}`, inline: true },
          { name: '\u200B', value: '\u200B', inline: true }, // Empty field for alignment
          { name: "📅 Sunucuya Katılma Tarihi", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
          { name: "📅 Discord'a Katılma Tarihi", value: `<t:${Math.floor(member.user.createdAt.getTime() / 1000)}:R>`, inline: true },
        ])
        .setDescription(`${member.user} Joined`)
        .setTimestamp()
        .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
  
      await logChannel.send({ embeds: [embed] });
    }
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: member.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || auditLogConfig.LogLevel.length === 0) return;
  
    if (auditLogConfig.LogLevel.includes("guildMemberRemove")) {
        const logChannel = client.channels.cache.get(auditLogConfig.Channel);*/
        const logChannel = client.kanalbul("🔮・giriş-çıkış-log");
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle("LOGS | Kullanıcı Ayrıldı")
                .setColor(config.normal)
                .addFields([
                    { name: "👤 Kullanıcı", value: `${member.user.tag} (${member.id})`, inline: false },
                    { name: "İsmi", value: member.user.username, inline: true },
                    { name: "Etiketi", value: `#${member.user.discriminator}`, inline: true },
                ])
                .setDescription(`Bir kullanıcı sunucudan ayrıldı veya atıldı.`)
                .setTimestamp()
                .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
            
  
            if (member.user.displayAvatarURL()) {
                embed.setThumbnail(member.user.displayAvatarURL());
            }
  
            await logChannel.send({ embeds: [embed] });
        }
    });

/////////////////////////////// MOD LOG ///////////////////////////////////////
  client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
    if (!newChannel.guild) return;
  
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: newChannel.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("channelUpdate")) return;
  
    const logChannel = newChannel.guild.channels.cache.get(auditLogConfig.Channel);*/
    const logChannel = client.kanalbul("🔏・mod-log");
    if (!logChannel) return;
  
    let changes = [];
    
    if (oldChannel.name !== newChannel.name) {
      changes.push(`Eski isim: **${oldChannel.name}** Yeni İsim: **${newChannel.name}**`);
    }
    
    if (oldChannel.topic !== newChannel.topic) {
      changes.push(`Konu güncellendi`);
    }
    
    if (oldChannel.nsfw !== newChannel.nsfw) {
      changes.push(`NSFW durumu şu şekilde değiştirildi: **${newChannel.nsfw ? 'Açık' : 'Kapalı'}**`);
    }
    
    if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
      changes.push(`Yavaş mod şu şekilde ayarlandı: **${newChannel.rateLimitPerUser}** saniye`);
    }
    
    if (oldChannel.rawPosition !== newChannel.rawPosition) {
      changes.push(`Pozisyon değişti`);
    }
    
    if (JSON.stringify(oldChannel.permissionOverwrites.cache) !== JSON.stringify(newChannel.permissionOverwrites.cache)) {
      changes.push(`İzinler Değişti`);
    }
  
    if (changes.length === 0) return;
  
    const embed = new EmbedBuilder()
      .setTitle("LOGS | Kanal Güncellendi")
      .setColor(config.normal)
      .setDescription(`**${newChannel.name}** güncellendi:\n- ${changes.join('\n- ')}`)
      .setTimestamp()
      .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
  
    await logChannel.send({ embeds: [embed] });
  });

  client.on(Events.ChannelCreate, async (channel) => {
    if (!channel.guild) return;
  
   /* const auditLogConfig = await Audit_Log.findOne({ Guild: channel.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || auditLogConfig.LogLevel.length === 0) return;
  
    if (auditLogConfig.LogLevel.includes("channelCreate")) {
        const logChannel = client.channels.cache.get(auditLogConfig.Channel);*/
        const logChannel = client.kanalbul("🔏・mod-log");
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle("LOGS | Kanal Oluşturuldu")
                .setColor(config.normal)
                .addFields([
                    { name: "📚 Kanal", value: `<#${channel.id}>`, inline: true },
                    { name: "Kanal Tipi", value: channel.type, inline: true },
                    { name: "Kanal ID", value: channel.id, inline: false },
                ])
                .setDescription(`Sunucuda yeni bir kanal oluşturuldu.`)
                .setTimestamp()
                .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
  
            await logChannel.send({ embeds: [embed] });
        }
    }
  );

  client.on(Events.ChannelDelete, async (channel) => {
    if (!channel.guild) return;
  
   /* const auditLogConfig = await Audit_Log.findOne({ Guild: channel.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || auditLogConfig.LogLevel.length === 0) return;
  
    if (auditLogConfig.LogLevel.includes("channelDelete")) {
        const logChannel = client.channels.cache.get(auditLogConfig.Channel);*/
        const logChannel = client.kanalbul("🔏・mod-log");
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle("LOGS | Kanal Silindi")
                .setColor(config.normal)
                .addFields([
                    { name: "📚 Kanal İsmi", value: channel.name, inline: true },
                    { name: "Kanal Tipi", value: channel.type, inline: true },
                    { name: "Kanal ID", value: channel.id, inline: false },
                ])
                .setDescription(`Sunucudan bir kanal silindi.`)
                .setTimestamp()
                .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
  
            await logChannel.send({ embeds: [embed] });
        }
    }
  );

  client.on('roleCreate', async (role) => {
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: role.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || auditLogConfig.LogLevel.length === 0 || !auditLogConfig.LogLevel.includes("roleCreate")) return;
  
    const logChannel = role.guild.channels.cache.get(auditLogConfig.Channel);*/
    const logChannel = client.kanalbul("🔏・mod-log");
    if (!logChannel) return;
  
    const auditLogs = await role.guild.fetchAuditLogs({ type: Events.RoleCreate, limit: 1 });
    const roleCreateLog = auditLogs.entries.first();
    let executor = "Unknown";
    if (roleCreateLog) {
        const target = roleCreateLog.target;
        if (target && target.id === role.id) {
            executor = roleCreateLog.executor.tag;
        }
    }
  
    const embed = new EmbedBuilder()
        .setTitle("LOGS | Rol Oluşturuldu")
        .setColor(config.normal)
        .addFields([
            { name: "Rol İsmi", value: role.name, inline: true },
            { name: "Rol ID", value: role.id, inline: true },
            { name: "Oluşturan", value: executor, inline: false },
            { name: "İzinler", value: role.permissions.toString() ? "No Permissions Added" : role.permissions.toString(), inline: false },
            { name: "Bahsedilebilir", value: role.mentionable ? "Evet" : "Hayır", inline: true },
            { name: "Kaldırılmış", value: role.hoist ? "Evet" : "Hayır", inline: true },
        ])
        .setTimestamp()     
        .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
  
    await logChannel.send({ embeds: [embed] });
  });


  client.on('roleUpdate', async (oldRole, newRole) => {
      /*const auditLogConfig = await Audit_Log.findOne({ Guild: newRole.guild.id });
      if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || auditLogConfig.LogLevel.length === 0 || !auditLogConfig.LogLevel.includes("roleUpdate")) return;
  
      const logChannel = await newRole.guild.channels.fetch(auditLogConfig.Channel).catch(console.error);*/
      const logChannel = client.kanalbul("🔏・mod-log");
      if (!logChannel) return;
  
      let changes = [];
  
      if (oldRole.name !== newRole.name) {
        changes.push({ name: "Rol İsmi", value: `Eski ismi: "${oldRole.name}" Yeni ismi: "${newRole.name}"` });
      }
  
      const oldPermissions = new PermissionsBitField(oldRole.permissions.bitfield);
      const newPermissions = new PermissionsBitField(newRole.permissions.bitfield);
      const addedPermissions = newPermissions.remove(oldPermissions).toArray();
      const removedPermissions = oldPermissions.remove(newPermissions).toArray();
  
      if (addedPermissions.length > 0) {
        changes.push({ name: "Eklenen İzinler", value: addedPermissions.join(", ") });
      }
  
      if (removedPermissions.length > 0) {
        changes.push({ name: "Kaldırılan İzinler", value: removedPermissions.join(", ") });
      }
  
      if (oldRole.mentionable !== newRole.mentionable) {
        changes.push({ name: "Bahsedilebilirlik", value: `Changed to "${newRole.mentionable ? 'Evet' : 'Hayır'}"` });
      }
      
      if (oldRole.hoist !== newRole.hoist) {
        changes.push({ name: "Kaldırılmış", value: `Changed to "${newRole.hoist ? 'Evet' : 'Hayır'}"` });
      }
  
      if (changes.length === 0) return;
  
      const embed = new EmbedBuilder()
        .setTitle("LOGS | Role Güncellendi")
        .setColor(config.normal) 
        .addFields(changes)
        .setTimestamp()
        .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
  
      await logChannel.send({ embeds: [embed] });
  });

/////////////////////////////////////// MESAJ LOG /////////////////////////////////////////////
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (oldMessage.author.bot || oldMessage.content === newMessage.content) return;
      
          const logChannel = client.kanalbul("💬・mesaj-log");
          if (!logChannel) return;
      
          const embed = new EmbedBuilder()
            .setTitle("LOGS | Mesaj Düzenlendi")
            .setColor(config.normal)
            .addFields([
              { name: "Mesaj Sâhibi", value: `${newMessage.author.tag}`, inline: true },
              { name: "Kanal", value: `${newMessage.channel}`, inline: true },
              { name: "Öncesi", value: oldMessage.content ? oldMessage.content.substring(0, 1024) : "No Content / Embed", inline: true },
              { name: "Sonrası", value: newMessage.content.substring(0, 1024), inline: true },
              { name: "Mesaj Konumu", value: `[Mesaja Git](${newMessage.url})`, inline: true },
            ])
            .setTimestamp()
            .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
            .setThumbnail(newMessage.author.displayAvatarURL({ dynamic: true, size: 2048 }))
      
          await logChannel.send({ embeds: [embed] });
      });

  client.on(Events.MessageDelete, async (message) => {
    if (!message.guild || message.system) return;
    if (message.author.bot) {
      return
    }
  
        const logChannel = client.kanalbul("💬・mesaj-log");
        if (logChannel) {
            let contentPreview = message.content.slice(0, 1024);
            if (!contentPreview) contentPreview = "Metin içeriği yok (gömme veya görsel olabilir)";
  
            const embed = new EmbedBuilder()
                .setTitle("LOGS | Mesaj Silindi")
                .setColor(config.normal)
                .addFields([
                    { name: "👤 Mesaj Sahibi", value: message.author.tag, inline: true },
                    { name: "📚 Mesajın Konumu", value: `<#${message.channel.id}>`, inline: true },
                    { name: "📄 Mesajın İçeriği", value: contentPreview, inline: false },
                ])
                .setDescription(`Bir mesaj silindi.`)
                .setTimestamp()
                .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true, size: 2048 }))
  
            await logChannel.send({ embeds: [embed] });
        }
  });

  client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.system) return;
    if (message.author.bot) {
      return
    }
  
        const logChannel = client.kanalbul("💠・message-log00");
        if (logChannel) {
            let contentPreview = message.content.slice(0, 1024);
            if (!contentPreview) contentPreview = "No text content (could be an embed or attachment)";
  
            const embed = new EmbedBuilder()
                .setTitle("LOGS | Message Created")
                .setColor(config.normal)
                .addFields([
                    { name: "👤 Author", value: message.author.tag, inline: true },
                    { name: "📚 Channel", value: `<#${message.channel.id}>`, inline: true },
                    { name: "📄 Content", value: contentPreview, inline: false },
                ])
                .setDescription(`A message was created.`)
                .setTimestamp()
                .setFooter({ text: "Message Creation" })
                .setThumbnail("https://i.imgur.com/PcMoVgq.png")
  
            await logChannel.send({ embeds: [embed] });
        }
  });
  
//////////////////////////////////////////// KULLANICI LOG ////////////////////////////////////////////////////////////////////////
  

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const guild = newMember.guild;
  
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("userUpdates")) return;
  
    const logChannelId = auditLogConfig.Channel;
    const logChannel = guild.channels.cache.get(logChannelId);*/
    const logChannel = client.kanalbul("✨・isim-log");
    if (!logChannel) return;
  
    let description = "**Kullanıcı Güncellemesi Algılandı**\n";
    let fieldsChanged = false;
  
    if (oldMember.nickname !== newMember.nickname) {
      description += `\n**Takma Ad Değişti**\nEski: \`${oldMember.nickname || 'Yok'}\` Yeni: \`${newMember.nickname || 'Yok'}\``;
      fieldsChanged = true;
    }
  
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
  
    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
  
    if (addedRoles.size > 0) {
      description += `\n**Rol Eklendi:** ${addedRoles.map(role => role.toString()).join(", ")}`;
      fieldsChanged = true;
    }
    if (removedRoles.size > 0) {
      description += `\n**Rol Kaldırıldı:** ${removedRoles.map(role => role.toString()).join(", ")}`;
      fieldsChanged = true;
    }
  
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
      const timeoutStatus = newMember.communicationDisabledUntilTimestamp ? `until <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:f>` : 'removed';
      description += `\n**Timeout**\nTimeout ${timeoutStatus}`;
      fieldsChanged = true;
    }
  
    if (!fieldsChanged) return;
  
    const embed = new EmbedBuilder()
      .setTitle(`Kullanıcı Güncellemesi - ${newMember.user.tag}`)
      .setColor(config.normal)
      .setDescription(description)
      .setTimestamp()
      .setThumbnail(newMember.author.displayAvatarURL({ dynamic: true, size: 2048 }))
      .setFooter({ text: `ID: ${newMember.id}` });
  
    await logChannel.send({ embeds: [embed] });
  });
  
  



/////////////////////////////// SES LOG ///////////////////////////////////////
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {

    const logChannel = client.kanalbul("🔉・ses-log");
    if (!logChannel) return;
  
    let description = "";
    let memberCount = newState.channel ? newState.channel.members.size : 0;
  
    if (!oldState.channel && newState.channel) {
        description = `${newState.member.user.tag}, **${newState.channel.name}** ses kanalına katıldı. \nKanalda **${memberCount}** üye bulunuyor.`;
    }
    else if (oldState.channel && !newState.channel) {
        memberCount = oldState.channel.members.size;
        description = `${oldState.member.user.tag}, **${oldState.channel.name}** ses kanalından ayrıldı.`;
    }
    else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        description = `${newState.member.user.tag}, **${oldState.channel.name}** -> **${newState.channel.name}** ses kanalları arasında geçiş yaptı! .\nYeni kanalda **${memberCount}** üye bulunuyor.`;
    }
  
    if (description) {
        const embed = new EmbedBuilder()
            .setTitle("Ses Kanalı Aktivitesi")
            .setColor(config.normal)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
            .setThumbnail(newState.member.displayAvatarURL({ dynamic: true, size: 2048 }))
  
        await logChannel.send({ embeds: [embed] });
    }
  });

  /////////////////////////////// DAVET LOG ///////////////////////////////////////
  client.on(Events.InviteCreate, async (invite) => {
    if (!invite.guild) return;
  
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: invite.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("inviteCreate")) return;
  
    const logChannelId = auditLogConfig.Channel;*/
    const logChannel = client.kanalbul("🔗・davet-log");
    if (!logChannel) return;
  
    const expire = invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:F>` : 'Never';
  
    const embed = new EmbedBuilder()
      .setTitle("LOGS | 🔗 Davet Oluşturuldu")
      .setColor(config.normal)
      .setDescription(`**${invite.inviter.tag}** Tarafından bir davet oluşturuldu.`)
      .setThumbnail("https://i.imgur.com/PcMoVgq.png")
      .addFields(
        { name: "Kanal", value: `${invite.channel.name}`, inline: true },
        { name: "Kod", value: invite.code, inline: true },
        { name: "Sona Erme", value: expire, inline: true },
        { name: "Maks Kullanım", value: `${invite.maxUses === 0 ? 'Sınırsız' : invite.maxUses}`, inline: true },
        { name: "Geçici Olarak", value: `${invite.temporary ? 'Hayır' : 'Evet'}`, inline: true },
        { name: "Süre Sınırı", value: `${invite.maxAge === 0 ? 'Sınırsız' : `${invite.maxAge} saniye`}`, inline: true }
      )
      .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
      .setThumbnail(invite.inviter.displayAvatarURL({ dynamic: true, size: 2048 }))
      .setTimestamp();
  
    await logChannel.send({ embeds: [embed] });
  });

  /////////////////////////////// EMOJI LOG ///////////////////////////////////////
  client.on(Events.EmojiCreate, async (emoji) => {
   /* const auditLogConfig = await Audit_Log.findOne({ Guild: emoji.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("emojiCreate")) return;*/
  
    const logChannel = client.kanalbul("🙂・emoji-log");
    if (!logChannel) return;
  
    const embed = new EmbedBuilder()
      .setTitle("🆕 Emoji Oluşturuldu")
      .setColor(config.normal)
      .setDescription(`Sunucuya yeni bir emoji eklendi.`)
      .addFields(
        { name: "İsim", value: emoji.name, inline: true },
        { name: "ID", value: emoji.id, inline: true },
        { name: "Hareketli", value: emoji.animated ? 'Evet' : 'Hayır', inline: true }
      )
      .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
      .setTimestamp();
  
    await logChannel.send({ embeds: [embed] });
  });

  client.on(Events.EmojiUpdate, async (oldEmoji, newEmoji) => {
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: newEmoji.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("emojiUpdate")) return;
  
    const logChannel = newEmoji.guild.channels.cache.get(auditLogConfig.Channel);*/
    const logChannel = client.kanalbul("🙂・emoji-log");
    if (!logChannel) return;

    const changes = [];
    if (oldEmoji.name !== newEmoji.name) {
      changes.push(`İsim: ${oldEmoji.name} ➔ ${newEmoji.name}`);
    }
    
    const embed = new EmbedBuilder()
      .setTitle("🔧 Emoji Güncellendi")
      .setColor(config.normal)
      .setDescription(`Bir emoji güncellendi.`)
      .addFields(
        { name: "Değişiklikler", value: changes.join('\n'), inline: false }
      )
      .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
      .setTimestamp();
  
    await logChannel.send({ embeds: [embed] });
  });

  client.on(Events.EmojiDelete, async (emoji) => {
    /*const auditLogConfig = await Audit_Log.findOne({ Guild: emoji.guild.id });
    if (!auditLogConfig || !Array.isArray(auditLogConfig.LogLevel) || !auditLogConfig.LogLevel.includes("emojiDelete")) return;*/
  
    const logChannel = client.kanalbul("🙂・emoji-log");
    if (!logChannel) return;
  
    const embed = new EmbedBuilder()
      .setTitle("❌ Emoji Silindi")
      .setColor(config.normal)
      .setDescription(`Sunucudan bir emoji kaldırıldı.`)
      .addFields(
        { name: "İsim", value: emoji.name, inline: true },
        { name: "ID", value: emoji.id, inline: true }
      )
      .setFooter({ text: config.footer ? config.footer : `bilalyenioffiical` })
      .setTimestamp();
  
    await logChannel.send({ embeds: [embed] });
  });

  /////////////////////////////// TICKET ///////////////////////////////////

  
 
/////////////////////////////// LOG ///////////////////////////////////////
client.kanalbul = function (kanalisim) {
    let kanal = client.guilds.cache.get(settings.slashCommands).channels.cache.find(bilo => bilo.name === kanalisim)
    if (!kanal) return false;
    return kanal;
  }
   
Promise.prototype.sil = function (time) {
    if (this) this.then(s => {
      if (s.deletable) {
        setTimeout(async () => {
          s.delete().catch(e => { });
        }, time * 1000)
      }
    });
  };
/* Login */
client.login(settings.token)
    .then(() => console.log("[BOT] Bota giriş yapıldı!"))
    .catch(e => console.log("[BOT] Bota giriş yapılırken bir hata oluştu:\n" + e));

/* Export */
module.exports = settings;