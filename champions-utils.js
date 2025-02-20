// --- champions-utils.js ---
'use strict';

import {roleCategories, difficultyLevels} from './data/constants.js';

function getDifficultyNumber(difficultyString) {
    switch (difficultyString) {
        case 'Low': return 1;
        case 'Moderate': return 2;
        case 'High': return 3;
        default: return 2; // Средний уровень сложности по умолчанию
    }
}

function getDifficultyStars(difficulty) {
    const difficultyNum = typeof difficulty === 'number' ? difficulty : getDifficultyNumber(difficulty);
    const maxStars = 3;
    return '★'.repeat(difficultyNum) + '☆'.repeat(maxStars - difficultyNum);
}


function filterChampions(champions, filters) {
    if (!Array.isArray(champions)) return [];

    return champions.filter(champion => {
        const roleMatch = filters.roles.includes('all') ||
            (Array.isArray(champion.roles) &&
             filters.roles.some(role => champion.roles.includes(role)));

        let difficultyMatch = true;
        if (filters.difficulty !== 'all') {
            const championDiff =  champion.difficulty;
            const filterDiff = filters.difficulty;
            difficultyMatch = championDiff === filterDiff;
        }

        const searchMatch = !filters.search ||
            champion.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            champion.title.toLowerCase().includes(filters.search.toLowerCase());

        return roleMatch && difficultyMatch && searchMatch;
    });
}

function createChampionCard(champion) {
    if (!champion) return '';

    try {
        return `
            <div class="champion-card" data-champion-id="${champion.id}">
                <div class="champion-image-container">
                    <img src="${champion.imageUrl}" alt="${champion.name}" class="champion-image">
                </div>
                <div class="champion-info">
                    <h3>${champion.name}</h3>
                    <p class="champion-title">${champion.title}</p>
                    <div class="champion-roles">
                        ${champion.roles.map(role => `<span class="role-tag">${roleCategories[role]}</span>`).join('')}
                    </div>
                    <div class="champion-difficulty">
                        <span>Сложность: ${getDifficultyStars(champion.difficulty)}</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error(`Error creating card for ${champion?.name || 'unknown champion'}:`, error);
        return '';
    }
}
export {
    getDifficultyNumber,
    getDifficultyStars,
    filterChampions,
    createChampionCard
};