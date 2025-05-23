const { ActivityType } = require('discord.js');

module.exports = (client) => {
    console.log(`==========================================================`);
    console.log(`🤖 Bot online como ${client.user.tag}!`);
    console.log(`🔰 Servindo em ${client.guilds.cache.size} servidores`);
    console.log(`👥 Servindo ${client.users.cache.size} usuários`);
    console.log(`⚙️ Prefixo: !`);
    console.log(`📝 Use !setroles para criar mensagem de seleção de cargos`);
    console.log(`==========================================================`);

    // Mostra no console os nomes dos servidores em que o bot está
    const guildNames = client.guilds.cache.map(guild => guild.name);
    console.log('Servidores conectados:', guildNames.length > 0 ? guildNames.join(', ') : 'Nenhum');

    // Define a atividade do bot
    client.user.setActivity('seleção de cargos | !setroles', { type: ActivityType.Watching });

    // Tenta se auto atribuir o cargo 'Bot' em cada servidor
    client.guilds.cache.forEach(async guild => {
        const botMember = guild.members.me;
        if (!botMember) return;
        const botRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'bot');
        if (botRole && !botMember.roles.cache.has(botRole.id)) {
            try {
                await botMember.roles.add(botRole);
                console.log(`Cargo 'Bot' atribuído ao bot em: ${guild.name}`);
            } catch (err) {
                console.log(`Não foi possível atribuir o cargo 'Bot' em ${guild.name}:`, err.message);
            }
        }
    });

    // Garante que todos os membros tenham o cargo 'Rank E' ao iniciar
    client.guilds.cache.forEach(async guild => {
        let rankERole = guild.roles.cache.find(r => r.name === 'Rank E');
        if (!rankERole) {
            rankERole = await guild.roles.create({ name: 'Rank E', reason: 'Cargo de rank inicial criado automaticamente pelo bot' });
        }
        const members = await guild.members.fetch();
        members.forEach(async member => {
            if (!member.user.bot && !member.roles.cache.has(rankERole.id)) {
                await member.roles.add(rankERole).catch(() => {});
            }
        });
    });

    // Garante que todos os cargos de rank existam e estejam destacados (hoisted)
    const rankUtils = require('../utils/rankUtils');
    client.guilds.cache.forEach(async guild => {
        for (const rankName of rankUtils.RANKS) {
            let rankRole = guild.roles.cache.find(r => r.name === rankName);
            if (!rankRole) {
                rankRole = await guild.roles.create({
                    name: rankName,
                    hoist: true, // Destaca o cargo no menu lateral
                    reason: 'Cargo de rank criado automaticamente pelo bot'
                });
            } else if (!rankRole.hoist) {
                await rankRole.setHoist(true, 'Destacar cargo de rank no menu lateral');
            }
        }
    });
};
