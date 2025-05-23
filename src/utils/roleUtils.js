const config = require('../../config/config.json');

/**
 * Obtém o cargo associado a uma reação.
 * @param {MessageReaction} reaction - A reação do Discord.
 * @returns {Role|null} O cargo do Discord ou null se não encontrado.
 */
async function getRoleFromReaction(reaction) {
    // Verifica se a mensagem é uma mensagem de seleção de cargos
    const message = reaction.message;

    // Verifica se a mensagem tem um embed
    if (!message.embeds || message.embeds.length === 0) return null;

    // Verifica se o título do embed indica que é uma mensagem de seleção de cargos
    const embed = message.embeds[0];
    if (!embed.title || !embed.title.includes('Selecione')) return null;

    // Obtém o emoji da reação
    const emoji = reaction.emoji.name;

    // Procura o cargo correspondente no arquivo de configuração
    const roleConfig = config.roles.find(r => r.emoji === emoji);
    if (!roleConfig) return null;

    // Procura o cargo no servidor (ignorando maiúsculas/minúsculas e espaços extras)
    const guild = reaction.message.guild;
    const normalize = str => str.normalize('NFKC').toLowerCase().replace(/\s+/g, '').trim();
    const role = guild.roles.cache.find(r => normalize(r.name) === normalize(roleConfig.name));

    // Se o cargo não existe, cria-o
    if (!role) {
        try {
            // Verifica se há cor definida para o cargo no config
            const roleData = {
                name: roleConfig.name,
                reason: 'Cargo criado automaticamente pelo bot'
            };
            if (roleConfig.color) {
                roleData.color = roleConfig.color;
            }
            const newRole = await guild.roles.create(roleData);
            console.log(`Cargo ${roleConfig.name} criado com sucesso!`);
            return newRole;
        } catch (error) {
            console.error(`Erro ao criar cargo ${roleConfig.name}:`, error);
            return null;
        }
    }

    return role;
}

module.exports = { getRoleFromReaction };
