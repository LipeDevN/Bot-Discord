const { EmbedBuilder } = require('discord.js');

/**
 * Cria um embed formatado para mensagens do bot.
 * @param {string} title - Título do embed
 * @param {string} description - Descrição do embed
 * @param {Array} fields - Campos do embed (array de objetos {name, value, inline})
 * @param {string} color - Cor do embed em formato hexadecimal
 * @param {Object} options - Opções adicionais (footer, thumbnail, image, etc)
 * @returns {EmbedBuilder} O embed construído
 */
function createEmbed(title, description, fields, color, options = {}) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color || '#0099ff')
        .setTimestamp();

    if (fields && Array.isArray(fields)) {
        fields.forEach(field => {
            embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline || false
            });
        });
    }

    if (options.footer) {
        embed.setFooter({
            text: options.footer.text,
            iconURL: options.footer.iconURL
        });
    }

    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    if (options.image) {
        embed.setImage(options.image);
    }

    if (options.author) {
        embed.setAuthor({
            name: options.author.name,
            iconURL: options.author.iconURL,
            url: options.author.url
        });
    }

    return embed;
}

module.exports = { createEmbed };
