// Comando para atribuir/remover cargo manualmente
const { getRoleFromReaction } = require('../utils/roleUtils');
const config = require('../../config/config.json');

module.exports = {
    name: 'cargo',
    description: 'Atribui ou remove um cargo manualmente pelo nome.',
    async execute(message, args) {
        if (!args[0]) {
            return message.reply('Use: !cargo <nome do cargo>');
        }
        const cargoNome = args.join(' ').toLowerCase();
        const roleConfig = config.roles.find(r => r.name.toLowerCase() === cargoNome);
        if (!roleConfig) {
            return message.reply('Cargo não encontrado. Confira o nome no !help.');
        }
        const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === cargoNome);
        if (!role) {
            return message.reply('Cargo não existe no servidor. Use !recriarcargos para criar todos os cargos do config.');
        }
        const member = message.guild.members.cache.get(message.author.id);
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            return message.reply(`Cargo **${role.name}** removido!`);
        } else {
            await member.roles.add(role);
            return message.reply(`Cargo **${role.name}** atribuído!`);
        }
    }
};
