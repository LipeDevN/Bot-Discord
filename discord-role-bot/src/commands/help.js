// Comando de ajuda para o bot
module.exports = {
    name: 'help',
    description: 'Mostra os comandos disponíveis e como usar o bot.',
    async execute(message) {
        const helpText = `**Comandos disponíveis:**\n\n` +
            `\`!setroles [mensagem personalizada]\` - Cria uma mensagem de seleção de cargos.\n` +
            `\`!help\` - Mostra esta mensagem de ajuda.\n` +
            `\`!cargo <nome do cargo>\` - Atribui ou remove um cargo manualmente.\n` +
            `\`!recriarcargos\` - (Admin) Recria todos os cargos do config com as cores.\n`;
        await message.channel.send(helpText);
    }
};
