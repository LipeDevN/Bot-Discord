const { getRoleFromReaction } = require('../utils/roleUtils');

module.exports = async (reaction, user) => {
    // Ignora reações de bots
    if (user.bot) return;

    const role = await getRoleFromReaction(reaction);
    if (!role) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (member) {
        try {
            await member.roles.remove(role);
            console.log(`Cargo ${role.name} removido de ${user.username}`);
        } catch (error) {
            console.error(`Erro ao remover cargo: ${error}`);
        }
    }
};
