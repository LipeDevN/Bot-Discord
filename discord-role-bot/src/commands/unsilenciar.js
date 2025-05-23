// Comando para remover o silenciamento manualmente de um membro
module.exports = {
    name: 'unsilenciar',
    description: 'Remove o silenciamento de um membro (remove o cargo Silenciado).',
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_ROLES')) {
            return message.reply('Você não tem permissão para usar este comando!');
        }
        if (!args[0]) {
            return message.reply('Use: !unsilenciar @usuario');
        }
        // Tenta obter o membro pelo mention ou ID
        const mention = args[0];
        let member = null;
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            const id = mention.replace(/<@!?([0-9]+)>/, '$1');
            member = await message.guild.members.fetch(id).catch(() => null);
        } else {
            member = await message.guild.members.fetch(mention).catch(() => null);
        }
        if (!member) {
            return message.reply('Usuário não encontrado!');
        }
        const muteRole = message.guild.roles.cache.find(r => r.name === 'Silenciado');
        if (!muteRole || !member.roles.cache.has(muteRole.id)) {
            return message.reply('Este usuário não está silenciado.');
        }
        await member.roles.remove(muteRole).catch(() => {});
        message.reply(`O silenciamento de ${member} foi removido!`);
    }
};
