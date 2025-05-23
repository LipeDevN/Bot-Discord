// Comando administrativo para recriar todos os cargos do config
const config = require('../../config/config.json');

module.exports = {
    name: 'recriarcargos',
    description: 'Recria todos os cargos do config com as cores definidas.',
    async execute(message) {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply('Você não tem permissão para usar este comando!');
        }
        for (const roleConfig of config.roles) {
            let role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleConfig.name.toLowerCase());
            if (role) {
                await role.delete('Recriação de cargos pelo bot');
            }
            await message.guild.roles.create({
                name: roleConfig.name,
                color: roleConfig.color || undefined,
                reason: 'Cargo recriado pelo comando !recriarcargos'
            });
        }
        await message.reply('Todos os cargos do config foram recriados com sucesso!');
    }
};
