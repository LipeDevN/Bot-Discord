const { getRoleFromReaction } = require('../utils/roleUtils');

module.exports = async (reaction, user) => {
    // Ignora reações de bots
    if (user.bot) return;

    try {
        const role = await getRoleFromReaction(reaction);
        if (!role) return;

        const member = await reaction.message.guild.members.fetch(user.id);
        if (member) {
            try {
                await member.roles.add(role);
                console.log(`Cargo ${role.name} adicionado a ${user.username}`);
            } catch (error) {
                console.error(`Erro ao adicionar cargo: ${error}`);
                // Tenta notificar o usuário sobre o erro
                if (error.message.includes('Missing Permissions')) {
                    try {
                        await user.send(`Não foi possível adicionar o cargo **${role.name}** devido a um problema de permissões no servidor. Por favor, entre em contato com um administrador.`);
                    } catch (dmError) {
                        console.log(`Não foi possível enviar DM para ${user.username}: ${dmError.message}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao processar reação:', error);
    }
};
