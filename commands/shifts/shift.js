const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require("quick.db")
const sertlb = new QuickDB({ filePath: 'sert-lb.sqlite' });
const sert = new QuickDB({ filePath: 'sert.sqlite ' });
const patrollb = new QuickDB({ filePath: 'patrol-lb.sqlite' });
const patrol = new QuickDB({ filePath: 'patrol.sqlite' });
const mclb = new QuickDB({ filePath: 'mc-lb.sqlite' });
const mc = new QuickDB({ filePath: 'mc.sqlite' });

function Log(type, interaction, param, param2) {
	channel = interaction.guild.channels.cache.get("1175872038238433310");
	if (type === "start") {
		const embed = new EmbedBuilder()
			.setTitle('Shift Started')
			.setDescription(`<@${interaction.user.id}> started a shift with the type of ${param}`)
		channel.send({embeds: [embed]})
	} else if (type === "end") {
		const embed = new EmbedBuilder()
            .setTitle('Shift Ended')
            .setDescription(
                `<@${interaction.user.id}> ended a shift with the type of ${param}`,
		);
		channel.send({embeds: [embed]})
	} else if (type === "reset") {
		const embed = new EmbedBuilder()
            .setTitle('Shift Reset')
            .setDescription(
                `<@${param}> data was reset by <@${interaction.user.id}>`,
            );
        channel.send({ embeds: [embed] });
	} else if (type === "forceend") {
		const embed = new EmbedBuilder()
            .setTitle('Shift Ended')
            .setDescription(
                `<@${param2}> ended a shift with the type of ${param}, was forced by <@${interaction.user.id}>`,
            );
        channel.send({ embeds: [embed] });
	}
}

async function getLeaderboard(page, per_page, type, type2) {
	let resp
	if (type2) {
		if (type === 'sert') {
            resp = await sert.all();
        } else if (type === 'patrol') {
            resp = await patrol.all();
		} else {
			resp = await mc.all();
		}
	} else {
		if (type === "sert") {
			resp = await sertlb.all()
		} else if (type === "patrol") {
			resp = await patrollb.all()
		} else {
			resp = await mclb.all()
		}
	}
    resp.sort((a, b) => (a.data < b.data ? 1 : -1));

	page = page || 1,
	per_page = per_page || 10,
	offset = (page - 1) * per_page,

    paginatedItems = resp.slice(offset).slice(0, per_page),
	total_pages = Math.ceil(resp.length / per_page);
	let end = {
    	page: page,
    	per_page: per_page,
    	pre_page: page - 1 ? page - 1 : null,
    	next_page: (total_pages > page) ? page + 1 : null,
    	total: resp.length,
    	total_pages: total_pages,
    	data: paginatedItems
	};

    return end;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shift')
        .setDescription('Manage your shift')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('start')
                .setDescription('Start your shift')
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Type of shift to start')
                        .addChoices(
                            { name: 'Patrol', value: 'patrol' },
                            { name: 'S.E.R.T.', value: 'sert' },
                            { name: 'M.C.', value: 'mc' },
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('end').setDescription('End your shift'),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('view')
                .setDescription('View shift timings of a member')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setDescription('Member to view shift timings of')
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('manage')
                .setDescription('Manage a member')
                .addUserOption((option) =>
                    option
                        .setName('member')
                        .setDescription('Member to manage')
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Type of action to use')
                        .addChoices(
                            { name: 'End Shift', value: 'end' },
                            { name: 'Reset Shift Data', value: 'reset' },
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('report')
                .setDescription('Create the weekly report')
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Type of shift to start')
                        .addChoices(
                            { name: 'Patrol', value: 'patrol' },
                            { name: 'S.E.R.T.', value: 'sert' },
                            { name: 'M.C.', value: 'mc' },
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('onduty')
                .setDescription('View members on duty')
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Type of shift to start')
                        .addChoices(
                            { name: 'Patrol', value: 'patrol' },
                            { name: 'S.E.R.T.', value: 'sert' },
                            { name: 'M.C.', value: 'mc' },
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('leaderboard')
                .setDescription('View top members with most hours on shift')
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Type of shift to start')
                        .addChoices(
                            { name: 'Patrol', value: 'patrol' },
                            { name: 'S.E.R.T.', value: 'sert' },
                            { name: 'M.C.', value: 'mc' },
                        )
                        .setRequired(true),
                ),
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'start') {
            const type = interaction.options.getString('type');
            if (
                (await sert.get(interaction.user.id)) ||
                (await patrol.get(interaction.user.id)) ||
                (await mc.get(interaction.user.id))
            )
                return await interaction.reply('Shift already started.');
            Log('start', interaction, type);
            if (type === 'sert') {
                await sert.set(interaction.user.id, Date.now());
                if (interaction.member.bannable) {
                    await interaction.member.setNickname(
                        interaction.member.nickname.replace('T', 'E'),
                    );
                }
                await interaction.reply('Shift started for S.E.R.T.');
            } else if (type === "patrol") {
                await patrol.set(interaction.user.id, Date.now());
                await interaction.reply('Shift started for Patrol');
            } else if (type === 'mc') {
                await mc.set(interaction.user.id, Date.now());
                if (interaction.member.bannable) {
                    await interaction.member.setNickname(
                        interaction.member.nickname.replace('T', 'C'),
                    );
                }
                await interaction.reply('Shift started for M.C.');
            }
        } else if (interaction.options.getSubcommand() === 'end') {
            let type;
            if (
                !(await sert.get(interaction.user.id)) &&
                !(await patrol.get(interaction.user.id)) &&
                !(await mc.get(interaction.user.id))
            )
                return await interaction.reply('Shift not started.');
			if (await patrol.get(interaction.user.id)) type = 'patrol';
			else if (await mc.get(interaction.user.id)) type = 'mc';
            else type = 'sert';
            const message = await interaction.reply('Loading data...');
            let data;
            if (type === 'sert') {
                data = await sert.get(interaction.user.id);
            } else if (type === 'patrol') {
                data = await patrol.get(interaction.user.id);
			} else {
				data = await mc.get(interaction.user.id);
			}
            const time = (Date.now() - data) / 1000;
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time - hours * 3600) / 60);
            const seconds = Math.floor(time - hours * 3600 - minutes * 60);
            if (type === 'sert') {
                await sert.delete(interaction.user.id);
                await sertlb.add(interaction.user.id, time);
                if (interaction.member.bannable) {
                    await interaction.member.setNickname(
                        interaction.member.nickname.replace('E', 'T'),
                    );
                }
            } else if (type === "patrol") {
                await patrol.delete(interaction.user.id);
                await patrollb.add(interaction.user.id, time);
			} else {
				await mc.delete(interaction.user.id);
                await mclb.add(interaction.user.id, time);
                if (interaction.member.bannable) {
                    await interaction.member.setNickname(
                        interaction.member.nickname.replace('C', 'T'),
                    );
                }
			}
            Log('end', interaction, type);
            await message.edit(
                'Shift ended, time: ' +
                    hours +
                    'h ' +
                    minutes +
                    'm ' +
                    seconds +
                    's',
            );
        } else if (interaction.options.getSubcommand() === 'view') {
            const member = interaction.options.getUser('member');
            const message = await interaction.reply('Loading...');
            let sert = await sertlb.get(member.id);
            if (!sert) {
                sert = 0;
            }
            let patrol = await patrollb.get(member.id);
            if (!patrol) {
                patrol = 0;
			}
			let mc = await mclb.get(member.id);
            if (!mc) {
                mc = 0;
            }
            const hours = Math.floor(sert / 3600);
            const minutes = Math.floor((sert - hours * 3600) / 60);
            const seconds = Math.floor(sert - hours * 3600 - minutes * 60);
            const hours2 = Math.floor(patrol / 3600);
            const minutes2 = Math.floor((patrol - hours2 * 3600) / 60);
            const seconds2 = Math.floor(patrol - hours2 * 3600 - minutes2 * 60);
            const hours3 = Math.floor(patrol / 3600);
            const minutes3 = Math.floor((patrol - hours3 * 3600) / 60);
            const seconds3 = Math.floor(patrol - hours3 * 3600 - minutes3 * 60);
            await message.edit(
                'S.E.R.T.\n' +
                    hours +
                    'h ' +
                    minutes +
                    'm ' +
                    seconds +
                    's\nPatrol\n' +
                    hours2 +
                    'h ' +
                    minutes2 +
                    'm ' +
                    seconds2 +
                    's\nM.C.\n' +
                    hours3 +
                    'h ' +
                    minutes3 +
                    'm ' +
                    seconds3 +
                    's',
            );
        } else if (interaction.options.getSubcommand() === 'leaderboard') {
            const interactionMessage = await interaction.reply('Loading...');
            const type = interaction.options.getString('type');
            let message = '';

            const leaderboard = await getLeaderboard(1, 10, type);
            if (leaderboard.data.length >= 1) {
                for (let i in leaderboard.data) {
                    const time = leaderboard.data[i].value;
                    const hours = Math.floor(time / 3600);
                    const minutes = Math.floor((time - hours * 3600) / 60);
                    const seconds = Math.floor(
                        time - hours * 3600 - minutes * 60,
                    );
                    const place = Number(i) + 1;
                    message += `${place} | <@${leaderboard.data[i].id}> | ${hours}h ${minutes}m ${seconds}s\n`;
                }
            } else {
                message = 'No one has been on shift yet';
            }
            let embed;
            if (type === 'sert') {
                embed = new EmbedBuilder()
                    .setTitle('Leaderboard - S.E.R.T.')
                    .setDescription(message);
            } else if (type === 'patrol') {
                embed = new EmbedBuilder()
                    .setTitle('Leaderboard - Patrol')
                    .setDescription(message);
			} else {
				embed = new EmbedBuilder()
                    .setTitle('Leaderboard - M.C.')
                    .setDescription(message);
			}

            await interactionMessage.edit({ content: '', embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'onduty') {
            const interactionMessage = await interaction.reply('Loading...');
            const type = interaction.options.getString('type');
            let message = '';

            const leaderboard = await getLeaderboard(1, 10, type, true);
            if (leaderboard.data.length >= 1) {
                for (let i in leaderboard.data) {
                    const time =
                        (Date.now() - leaderboard.data[i].value) / 1000;
                    console.log(time);
                    const hours = Math.floor(time / 3600);
                    const minutes = Math.floor((time - hours * 3600) / 60);
                    const seconds = Math.floor(
                        time - hours * 3600 - minutes * 60,
                    );
                    const place = Number(i) + 1;
                    message += `${place} | <@${leaderboard.data[i].id}> | ${hours}h ${minutes}m ${seconds}s\n`;
                }
            } else {
                message = 'No one is on shift';
            }
            let embed;
            if (type === 'sert') {
                embed = new EmbedBuilder()
                    .setTitle('On Duty - S.E.R.T.')
                    .setDescription(message);
            } else if (type === 'patrol') {
                embed = new EmbedBuilder()
                    .setTitle('On Duty - Patrol')
                    .setDescription(message);
			} else {
				embed = new EmbedBuilder()
                    .setTitle('On Duty - M.C.')
                    .setDescription(message);
			}

            await interactionMessage.edit({ content: '', embeds: [embed] });
        } else if (interaction.options.getSubcommand() === 'manage') {
            if (!interaction.member.roles.cache.has('1248054824444887070'))
                return interaction.reply(
                    'You do not have permission to perform this action.',
                );
            const message = await interaction.reply('Loading...');
            const member = interaction.options.getUser('member');
            const type2 = interaction.options.getString('type');

            if (type2 === 'end') {
                if (
                    !(await sert.get(member.id)) &&
                    !(await patrol.get(member.id)) &&
                    !(await mc.get(member.id))
                )
                    return await message.edit(
                        'Member has not started a shift.',
                    );
				let type;
				if (await patrol.get(member.id)) type = 'patrol';
				else if (await sert.get(member.id)) type = 'sert';
				else type = 'mc';
                let data;
                if (type === 'sert') {
                    data = await sert.get(member.id);
                } else if (type === 'patrol') {
                    data = await patrol.get(member.id);
				} else {
					data = await mc.get(member.id);
				}
                const time = (Date.now() - data) / 1000;
                const hours = Math.floor(time / 3600);
                const minutes = Math.floor((time - hours * 3600) / 60);
                const seconds = Math.floor(time - hours * 3600 - minutes * 60);
                if (type === 'sert') {
                    await sert.delete(member.id);
                    await sertlb.add(member.id, time);
                    if (member.bannable) {
                        await member.setNickname(
                            member.nickname.replace('E', 'T'),
                        );
                    }
                } else if (type === 'patrol') {
                    await patrol.delete(member.id);
                    await patrollb.add(interaction.user.id, time);
				} else {
					await mc.delete(member.id);
                    await mclb.add(member.id, time);
                    if (member.bannable) {
                        await member.setNickname(
                            member.nickname.replace('C', 'T'),
                        );
                    }
				}
                Log('forceend', interaction, type, member.id);
                await message.edit(
                    'Shift ended, time: ' +
                        hours +
                        'h ' +
                        minutes +
                        'm ' +
                        seconds +
                        's',
                );
            } else if (type2 === 'reset') {
                if (sert.get(member.id)) {
                    sert.delete(member.id);
                }
                if (sertlb.get(member.id)) {
                    sertlb.delete(member.id);
                }
                if (patrol.get(member.id)) {
                    patrol.delete(member.id);
                }
                if (patrollb.get(member.id)) {
                    patrollb.delete(member.id);
                }
                if (mc.get(member.id)) {
                    mc.delete(member.id);
                }
                if (mclb.get(member.id)) {
                    mclb.delete(member.id);
                }
                Log('reset', interaction, member.id);
                await message.edit('Data reset');
            }
        } else if (interaction.options.getSubcommand() === 'report') {
            if (!interaction.member.roles.cache.has('1248054824444887070'))
                return interaction.reply(
                    'You do not have permission to perform this action.',
                );
            await interaction.reply('Data will be send below.');
            const type = interaction.options.getString('type');
            if (type === 'sert') {
                const items = (await sertlb.all()).length;
                const pages = Math.ceil(items / 10);
                for (var i = 0; i < pages; i++) {
                    const leaderboard = await getLeaderboard(i + 1, 10, 'sert');
                    let message = '';
                    if (leaderboard.data.length >= 1) {
                        for (let i in leaderboard.data) {
                            const time = leaderboard.data[i].value;
                            const hours = Math.floor(time / 3600);
                            const minutes = Math.floor(
                                (time - hours * 3600) / 60,
                            );
                            const seconds = Math.floor(
                                time - hours * 3600 - minutes * 60,
                            );
                            message += `<@${leaderboard.data[i].id}> | ${hours}h ${minutes}m ${seconds}s\n`;
                        }
                    } else {
                        message = 'No one has been on shift';
                    }
                    const embed = new EmbedBuilder()
                        .setTitle('Report - S.E.R.T.')
                        .setDescription(message)
                        .setAuthor({
                            name: 'All data of this type has been reset',
                        })
                        .setFooter({ text: `Page ${i + 1} of ${pages}` });
                    interaction.channel.send({ embeds: [embed] });
                    message = '';
                }
                sertlb.deleteAll();
                sert.deleteAll();
            } else if (type === 'patrol') {
                const items = (await patrollb.all()).length;
                const pages = Math.ceil(items / 10);
                for (var i = 0; i < pages; i++) {
                    const leaderboard = await getLeaderboard(
                        i + 1,
                        10,
                        'patrol',
                    );
                    let message = '';
                    if (leaderboard.data.length >= 1) {
                        for (let i in leaderboard.data) {
                            const time = leaderboard.data[i].value;
                            const hours = Math.floor(time / 3600);
                            const minutes = Math.floor(
                                (time - hours * 3600) / 60,
                            );
                            const seconds = Math.floor(
                                time - hours * 3600 - minutes * 60,
                            );
                            message += `<@${leaderboard.data[i].id}> | ${hours}h ${minutes}m ${seconds}s\n`;
                        }
                    } else {
                        message = 'No one has been on shift';
                    }
                    const embed = new EmbedBuilder()
                        .setTitle('Report - Patrol')
                        .setDescription(message)
                        .setAuthor({
                            name: 'All data of this type has been reset',
                        })
                        .setFooter({ text: `Page ${i + 1} of ${pages}` });
                    interaction.channel.send({ embeds: [embed] });
                    message = '';
                }
                patrollb.deleteAll();
                patrol.deleteAll();
            } else if (type === 'mc') {
                const items = (await mclb.all()).length;
                const pages = Math.ceil(items / 10);
                for (var i = 0; i < pages; i++) {
                    const leaderboard = await getLeaderboard(
                        i + 1,
                        10,
                        'mc',
                    );
                    let message = '';
                    if (leaderboard.data.length >= 1) {
                        for (let i in leaderboard.data) {
                            const time = leaderboard.data[i].value;
                            const hours = Math.floor(time / 3600);
                            const minutes = Math.floor(
                                (time - hours * 3600) / 60,
                            );
                            const seconds = Math.floor(
                                time - hours * 3600 - minutes * 60,
                            );
                            message += `<@${leaderboard.data[i].id}> | ${hours}h ${minutes}m ${seconds}s\n`;
                        }
                    } else {
                        message = 'No one has been on shift';
                    }
                    const embed = new EmbedBuilder()
                        .setTitle('Report - M.C.')
                        .setDescription(message)
                        .setAuthor({
                            name: 'All data of this type has been reset',
                        })
                        .setFooter({ text: `Page ${i + 1} of ${pages}` });
                    interaction.channel.send({ embeds: [embed] });
                    message = '';
                }
                mclb.deleteAll();
                mc.deleteAll();
            }
        }
    },
};