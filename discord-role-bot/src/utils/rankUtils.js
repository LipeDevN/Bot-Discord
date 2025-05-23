// Sistema de rankeamento por mensagens
const fs = require('fs');
const path = require('path');

const RANKS = [
    'Rank E',
    'Rank D',
    'Rank C',
    'Rank B',
    'Rank A',
    'Rank S',
    'Rank SS',
    'Rank SS+',
    'Rank G',
    'Rank N',
    'Rank N+'
];

// Pontos necessários para cada rank (ajuste como quiser)
const RANK_POINTS = [0, 30, 100, 250, 500, 900, 1500, 2200, 3000, 4000, 5200, 7000];

const DATA_PATH = path.join(__dirname, '../../rankData.json');

function loadData() {
    if (!fs.existsSync(DATA_PATH)) return {};
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function getUserRank(points) {
    for (let i = RANK_POINTS.length - 1; i >= 0; i--) {
        if (points >= RANK_POINTS[i]) return i;
    }
    return 0;
}

module.exports = {
    addMessage(userId) {
        const data = loadData();
        if (!data[userId]) data[userId] = { points: 0, rank: RANKS[0] };
        data[userId].points += 1;
        const newRankIndex = getUserRank(data[userId].points);
        const newRank = RANKS[newRankIndex];
        if (data[userId].rank !== newRank) {
            data[userId].rank = newRank;
            saveData(data);
            return newRank;
        }
        saveData(data);
        return null;
    },
    getRank(userId) {
        const data = loadData();
        return data[userId] ? data[userId].rank : RANKS[0];
    },
    getPoints(userId) {
        const data = loadData();
        return data[userId] ? data[userId].points : 0;
    },
    getXP(userId) {
        const data = loadData();
        const points = data[userId] ? data[userId].points : 0;
        const rankIndex = getUserRank(points);
        const currentRankXP = points - RANK_POINTS[rankIndex];
        const nextRankXP = (RANK_POINTS[rankIndex + 1] || RANK_POINTS[rankIndex]) - RANK_POINTS[rankIndex];
        return {
            current: currentRankXP,
            next: nextRankXP,
            total: points,
            rank: RANKS[rankIndex],
            nextRank: RANKS[rankIndex + 1] || RANKS[rankIndex]
        };
    },
    getLeaderboard(limit = 10) {
        const data = loadData();
        const sorted = Object.entries(data)
            .sort((a, b) => b[1].points - a[1].points)
            .slice(0, limit);
        return sorted.map(([userId, info], i) => ({
            userId,
            points: info.points,
            rank: info.rank,
            position: i + 1
        }));
    },
    RANKS,
    RANK_POINTS
};
