/* Definitions */
const { ChannelSelectMenu, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("../../../config.js");

/* Command */
module.exports =  {
	data: {
		name: "log",
        aliases: ["log-kur", "logkur", "log-ayarla", "logayarla", "log-ayar", "logayar"],
        usage: "setup-log",
		cooldown: 0,
        description: "Gelişmiş log sistemini kurarsınız.",
		slash: new SlashCommandBuilder()
	},

    async executePrefix(client, message, args) {
		if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply({ embeds: [new EmbedBuilder().setDescription(`${config.carpiemoji} **Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!**`),setColor(config.kırmızı)] }).sil(5);
		let mesajx;
        mesajx = await message.reply({ embeds: [new EmbedBuilder().setDescription("**Panel yükleniyor, bekleyiniz...**").setColor(config.normal)] })
		const embed = new EmbedBuilder()
			.setTitle("Log Sistemi")
			.setDescription("Merhaba, log sistemini kurmak veya kaldırmak için aşağıdaki butonları kullanabilirsiniz.")
			.setColor(config.normal)
			.setFooter({ text: `${message.author.tag} tarafından istendi` })
	
		const kur = new ButtonBuilder()
			.setCustomId('kur')
			.setLabel('Log Kanalları Kur')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(client.kanalbul("🔮・giriş-çıkış-log") ? true : false);

		const kaldır = new ButtonBuilder()
			.setCustomId('kaldır')
			.setLabel('Logları Kaldır')
			.setStyle(ButtonStyle.Danger)
			.setDisabled(client.kanalbul("🔮・giriş-çıkış-log") ? false : true);
			
		const row = new ActionRowBuilder().addComponents(kur, kaldır);
	
        let mesaj = await mesajx.edit({ content: ``, components: [row], embeds: [embed] })

		const collector = mesaj.createMessageComponentCollector({ filter: i => i.user.id === message.member.id, time: 30000 });
            collector.on('end', async (bilal) => {
                if (bilal.size == 0) mesaj.delete();
            })
            collector.on('collect', async (bilal) => {
                if (!bilal.isButton()) return;
                if (bilal.customId == "kur") {
                    bilal.update({ content: ``, embeds: [new EmbedBuilder().setDescription(`${config.yükleniyoremoji} **Loglar Kuruluyor, lütfen bekleyiniz...**`).setColor(config.normal)], files: [], components: [] })
                    const parent = await bilal.guild.channels.create({ name: '📜・loglar', type: ChannelType.GuildCategory });
                    const loglar = config.logs;
                    for (let index = 0; index < loglar.length; index++) {
                        let element = loglar[index];
                        await bilal.guild.channels.create({
                            name: element.name,
                            type: ChannelType.GuildText,
                            parent: parent.id, permissionOverwrites: [
                                { id: bilal.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                            ]
                        })
                    }
                    bilal.channel.send({ content: ``, embeds: [new EmbedBuilder().setDescription(`${config.onayemoji} **Loglar başarıyla kuruldu!**`).setColor(config.yeşil)] })
                    collector.stop();

                } else if (bilal.customId == "kaldır") {
                    bilal.update({ content: ``, embeds: [new EmbedBuilder().setDescription(`${config.yükleniyoremoji} **Loglar kaldırılıyor, lütfen bekleyiniz...**`).setColor(config.normal)], files: [], components: [] })

                    let category = message.guild.channels.cache.find(category => category.name === '📜・loglar');
                    category.delete();

                    let giris = message.guild.channels.cache.find(giris => giris.name === '🔮・giriş-çıkış-log');
                    giris.delete();

                    let mesaj = message.guild.channels.cache.find(mesaj => mesaj.name === '💬・mesaj-log');
                    mesaj.delete();

                    let isim = message.guild.channels.cache.find(isim => isim.name === '✨・isim-log');
                    isim.delete();

                    /*let seviye = message.guild.channels.cache.find(seviye => seviye.name === '💠・seviye-log');
                    seviye.delete();*/

                    let ban = message.guild.channels.cache.find(ban => ban.name === '⛔・ban-log');
                    ban.delete();

                    let ceza = message.guild.channels.cache.find(ceza => ceza.name === '🚫・ceza-log');
                    ceza.delete();

                    let mod = message.guild.channels.cache.find(mod => mod.name === '🔏・mod-log');
                    mod.delete();

                    let davet = message.guild.channels.cache.find(davet => davet.name === '🔗・davet-log');
                    davet.delete();

                    let ses = message.guild.channels.cache.find(ses => ses.name === '🔉・ses-log');
                    ses.delete();

                    let emoji = message.guild.channels.cache.find(emoji => emoji.name === '🙂・emoji-log');
                    emoji.delete();

                    bilal.channel.send({ content: ``, embeds: [new EmbedBuilder().setDescription(`${config.onayemoji} **Loglar başarıyla kaldırıldı!**`).setColor(config.yeşil)] })
                    collector.stop();
				}
            })
            
		/*await message.reply({
			embeds: [embed],
			components: [row],
		});*/

		
	
    }
};