const { PermissionsBitField } = require('discord.js');
const config = require('../../config/config.json');
const { createEmbed } = require('../utils/embedHelper');

module.exports = {
    name: 'roleReaction',
    description: 'Configura uma mensagem de seleção de cargos com reações.',
    async execute(message, customMsg) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('Você não tem permissão para usar este comando!');
        }

        // Cria os campos para o embed a partir das configurações
        const fields = config.roles.map(role => {
            return {
                name: `${role.emoji} ${role.name}`,
                value: role.description || 'Clique para obter este cargo',
                inline: true
            };
        });

        // Cria o embed usando o helper
        const embed = createEmbed(
            '🚀 Selecione seus cargos de Programação',
            customMsg || config.messages.roleSelect,
            fields,
            config.embedColors.main
        );

        // Envia a mensagem embed
        const roleMessage = await message.channel.send({ embeds: [embed] });

        // Adiciona as reações
        for (const role of config.roles) {
            try {
                await roleMessage.react(role.emoji);
                // Pequeno delay para evitar rate limit
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.error(`Erro ao adicionar reação ${role.emoji}:`, error);
            }
        }

        // Mensagem de confirmação para o usuário que executou o comando
        await message.reply({
            content: '✅ Mensagem de seleção de cargos criada com sucesso!'
        }).catch(console.error);
    },
};
