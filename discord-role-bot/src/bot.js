const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();
const roleReactionCommand = require('./commands/roleReaction');
const messageReactionAddEvent = require('./events/messageReactionAdd');
const messageReactionRemoveEvent = require('./events/messageReactionRemove');
const readyEvent = require('./events/ready');
const helpCommand = require('./commands/help');
const cargoCommand = require('./commands/cargo');
const recriarCargosCommand = require('./commands/recriarcargos');
const rankUtils = require('./utils/rankUtils');
const guildMemberAddEvent = require('./events/guildMemberAdd');

// Verificando o token
if (!process.env.TOKEN) {
    console.error('TOKEN não encontrado no arquivo .env!');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Mapa para rastrear o tempo das últimas mensagens de cada usuário
const userMessageTimestamps = new Map();
// Mapa para rastrear usuários silenciados
const mutedUsers = new Map();

client.once('ready', async () => {
    // Apenas inicializa o bot e as funções de verificação, sem mensagem no chat geral
    readyEvent(client);
    garantirCargoDeRankParaTodos(client);
    // Envia mensagem de boas-vindas apenas na DM do dono do servidor
    for (const guild of client.guilds.cache.values()) {
        try {
            const owner = await guild.fetchOwner();
            if (owner && owner.user && !owner.user.bot) {
                await owner.send('O bot foi iniciado com sucesso no seu servidor! Se precisar de ajuda ou suporte, envie uma mensagem.').catch(() => {});
            }
        } catch (e) {
            // Ignora erros ao enviar DM
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Sistema anti-flood: silenciar por 2 minutos se enviar mais de 3 mensagens em menos de 5 segundos
    const now = Date.now();
    const muteRoleName = 'Silenciado';
    const floodWindow = 5000; // 5 segundos
    const floodMsgCount = 5; // mais de 5 mensagens
    const muteDuration = 2 * 60 * 1000; // 2 minutos

    // Se o usuário já está silenciado, ignora
    if (mutedUsers.has(message.author.id)) return;

    // Atualiza o histórico de mensagens do usuário
    let timestamps = userMessageTimestamps.get(message.author.id) || [];
    timestamps = timestamps.filter(ts => now - ts < floodWindow); // mantém só as dos últimos 5s
    timestamps.push(now);
    userMessageTimestamps.set(message.author.id, timestamps);

    if (timestamps.length > floodMsgCount) {
        // Silenciar usuário
        let muteRole = message.guild.roles.cache.find(r => r.name === muteRoleName);
        if (!muteRole) {
            muteRole = await message.guild.roles.create({
                name: muteRoleName,
                color: '#555555',
                reason: 'Criado para silenciar membros que floodam',
                permissions: []
            });
            // Remover permissões de envio de mensagens em todos os canais de texto
            for (const channel of message.guild.channels.cache.values()) {
                if (channel.type === 0) {
                    await channel.permissionOverwrites.edit(muteRole, { SendMessages: false }).catch(() => {});
                }
            }
        }
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member && !member.roles.cache.has(muteRole.id)) {
            await member.roles.add(muteRole).catch(() => {});
            mutedUsers.set(message.author.id, true);
            // Exclui as últimas mensagens enviadas por flood
            const messages = await message.channel.messages.fetch({ limit: 20 });
            const userFloodMessages = messages.filter(m => m.author.id === message.author.id && (now - m.createdTimestamp < floodWindow));
            for (const msg of userFloodMessages.values()) {
                msg.delete().catch(() => {});
            }
            // Mensagem pública no canal (aparece só por 5 segundos)
            const muteMsg = await message.channel.send(`${message.author} foi silenciado por 2 minutos por enviar mensagens muito rápido!`);
            setTimeout(() => { muteMsg.delete().catch(() => {}); }, 5000);
            // Mensagem privada para o usuário
            message.author.send('Você foi silenciado temporariamente por 2 minutos por enviar mensagens muito rápido (floodar) no servidor. Após esse tempo, você poderá enviar mensagens normalmente. Por favor, evite flood para não ser silenciado novamente.').catch(() => {});
            setTimeout(async () => {
                await member.roles.remove(muteRole).catch(() => {});
                mutedUsers.delete(message.author.id);
                message.channel.send(`${message.author} não está mais silenciado.`)
                    .then(msg => setTimeout(() => msg.delete().catch(() => {}), 7000));
            }, muteDuration);
        }
        return;
    }

    // Sistema de rankeamento
    const oldRank = rankUtils.getRank(message.author.id);
    const newRank = rankUtils.addMessage(message.author.id);
    if (newRank) {
        // Remover cargo antigo e adicionar o novo
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member) {
            // Remover todos os cargos de rank
            for (const rankName of rankUtils.RANKS) {
                const role = message.guild.roles.cache.find(r => r.name === rankName);
                if (role && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role).catch(() => {});
                }
            }
            // Adicionar o novo cargo de rank (cria se não existir)
            let newRankRole = message.guild.roles.cache.find(r => r.name === newRank);
            if (!newRankRole) {
                newRankRole = await message.guild.roles.create({
                    name: newRank,
                    reason: 'Cargo de rank criado automaticamente pelo bot'
                });
            }
            await member.roles.add(newRankRole).catch(() => {});
        }
        // Mensagem temporária ao subir de rank
        const rankMsg = await message.channel.send({ content: `🎉 Parabéns ${message.author}, você subiu para **${newRank}**!` });
        setTimeout(() => {
            rankMsg.delete().catch(() => {});
        }, 7000);
    }
    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === '!setroles') {
        // Permitir mensagem personalizada
        const customMsg = args.join(' ');
        roleReactionCommand.execute(message, customMsg);
    } else if (command === '!help') {
        helpCommand.execute(message);
    } else if (command === '!cargo') {
        cargoCommand.execute(message, args);
    } else if (command === '!recriarcargos') {
        recriarCargosCommand.execute(message);
    } else if (command === '!rank') {
        // Apaga a mensagem do usuário imediatamente
        message.delete().catch(() => {});
        const xp = rankUtils.getXP(message.author.id);
        const rankMsg = await message.channel.send(`Seu rank atual é **${xp.rank}**\nXP: **${xp.current}/${xp.next}** para o próximo rank (**${xp.nextRank}**)\nPontos totais: **${xp.total}**`);
        setTimeout(() => {
            rankMsg.delete().catch(() => {});
        }, 7000);
    } else if (command === '!leaderboard') {
        const top = rankUtils.getLeaderboard(10);
        if (top.length === 0) {
            return message.reply('Ainda não há dados de rank!');
        }
        let text = '**🏆 Top 10 - Leaderboard dos mais ativos:**\n';
        for (const entry of top) {
            const user = await message.guild.members.fetch(entry.userId).catch(() => null);
            text += `${entry.position}. ${user ? user.user.tag : 'Usuário desconhecido'} — ${entry.points} XP (${entry.rank})\n`;
        }
        message.channel.send(text);
    } else if (command === '!unsilenciar') {
        const unsilenciarCommand = require('./commands/unsilenciar');
        unsilenciarCommand.execute(message, args);
    }
});

// Feedback visual ao atribuir/remover cargos por reação
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Erro ao carregar a reação:', error);
            return;
        }
    }
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = await require('./utils/roleUtils').getRoleFromReaction(reaction);
    if (role && member && !user.bot) {
        member.roles.add(role).then(() => {
            reaction.message.channel.send({ content: `✅ ${user} recebeu o cargo **${role.name}**!`, ephemeral: true }).then(msg => setTimeout(() => msg.delete(), 5000));
        });
    }
});
client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Erro ao carregar a reação:', error);
            return;
        }
    }
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = await require('./utils/roleUtils').getRoleFromReaction(reaction);
    if (role && member && !user.bot) {
        member.roles.remove(role).then(() => {
            reaction.message.channel.send({ content: `❌ ${user} perdeu o cargo **${role.name}**!`, ephemeral: true }).then(msg => setTimeout(() => msg.delete(), 5000));
        });
    }
});
client.on('guildMemberAdd', guildMemberAddEvent);

// Função para garantir que todos tenham pelo menos um cargo de rank
async function garantirCargoDeRankParaTodos(client) {
    const rankNames = rankUtils.RANKS;
    const rankMaisBaixo = rankNames[0];
    for (const guild of client.guilds.cache.values()) {
        await guild.roles.fetch();
        let rankERole = guild.roles.cache.find(r => r.name === rankMaisBaixo);
        if (!rankERole) {
            rankERole = await guild.roles.create({ name: rankMaisBaixo, reason: 'Cargo de rank inicial criado automaticamente pelo bot' });
        }
        // Em vez de buscar todos, use só os membros em cache (NÃO faça member.fetch(true) para evitar timeout)
        for (const member of guild.members.cache.values()) {
            if (member.user.bot) continue;
            // NÃO atualiza a lista de cargos do membro forçadamente
            const jaTemRank = rankNames.some(rankName => member.roles.cache.some(role => role.name === rankName));
            if (!jaTemRank) {
                await member.roles.add(rankERole).catch(() => {});
            }
        }
    }
}

// Executa a cada 30 minutos
setInterval(() => {
    garantirCargoDeRankParaTodos(client);
}, 30 * 60 * 1000);

client.login(process.env.TOKEN)
    .then(() => {
        console.log('Bot logado com sucesso!');
    })
    .catch((error) => {
        console.error('Erro ao fazer login:', error);
    });
