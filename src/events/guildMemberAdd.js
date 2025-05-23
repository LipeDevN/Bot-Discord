// Ao novo membro entrar, garantir que receba o cargo 'Rank E' e '@Membro GC'
module.exports = async (member) => {
    if (member.user.bot) return;
    let rankERole = member.guild.roles.cache.find(r => r.name === 'Rank E');
    if (!rankERole) {
        rankERole = await member.guild.roles.create({ name: 'Rank E', reason: 'Cargo de rank inicial criado automaticamente pelo bot' });
    }
    if (!member.roles.cache.has(rankERole.id)) {
        await member.roles.add(rankERole).catch(() => {});
    }

    let membroGcRole = member.guild.roles.cache.find(r => r.name === 'Membro GC');
    if (!membroGcRole) {
        membroGcRole = await member.guild.roles.create({ name: 'Membro GC', reason: 'Cargo de membro geral criado automaticamente pelo bot' });
    }
    if (!member.roles.cache.has(membroGcRole.id)) {
        await member.roles.add(membroGcRole).catch(() => {});
    }
};
