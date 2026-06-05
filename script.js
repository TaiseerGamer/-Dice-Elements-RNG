// Game State
let coins = 0;
let baseLuck = 1.0;
let potionLuck = 0;
let coinMultiplier = 1;
let luckCost = 50;
let coinCost = 100;
let potionCost = 500;

let pityCounter = 0;
const PITY_MAX = 100;

let potionActive = false;
let potionSeconds = 0;

let highestChance = 0;
let recentRolls = [];

const rarities = [
    { name: "Common", chance: 1, color: "#ffffff", payout: 1 },
    { name: "Uncommon", chance: 5, color: "#a2ffb8", payout: 5 },
    { name: "Rare", chance: 20, color: "#54a0ff", payout: 20 },
    { name: "Epic", chance: 100, color: "#a55eea", payout: 100 },
    { name: "Legendary", chance: 500, color: "#f7b731", payout: 500 },
    { name: "Mythic", chance: 2500, color: "#eb3b5a", payout: 2500 },
    { name: "Angelical", chance: 50000, color: "#fff200", payout: 40000 },
    { name: "Elemental", chance: 250000, color: "#ff4d00", payout: 200000 },
    { name: "Corrupted", chance: 1000000, color: "#2f3542", payout: 800000 },
    { name: "Divine", chance: 10000000, color: "#74b9ff", payout: 5000000 },
    { name: "Infinity", chance: 100000000, color: "#a29bfe", payout: 50000000 }
];

function getLuck() {
    return baseLuck + potionLuck;
}

function updateUI() {
    document.getElementById('coins').innerText = Math.floor(coins).toLocaleString();
    document.getElementById('luck-stat').innerText = getLuck().toFixed(1);
    
    document.getElementById('luck-cost').innerText = `Buy: ${luckCost}`;
    document.getElementById('coin-cost').innerText = `Buy: ${coinCost}`;
    document.getElementById('potion-cost').innerText = `Buy: ${potionCost}`;
    
    document.getElementById('luck-cost').disabled = coins < luckCost;
    document.getElementById('coin-cost').disabled = coins < coinCost;
    document.getElementById('potion-cost').disabled = coins < potionCost;

    // Update Pity Bar
    const fill = (pityCounter / PITY_MAX) * 100;
    document.getElementById('pity-fill').style.width = `${fill}%`;
    document.getElementById('pity-indicator').style.display = pityCounter >= PITY_MAX ? 'block' : 'none';
}

function roll() {
    let currentLuck = getLuck();
    
    // Apply Pity
    if (pityCounter >= PITY_MAX) {
        currentLuck *= 10;
        pityCounter = 0;
    } else {
        pityCounter++;
    }

    const rollVal = Math.random() / currentLuck;
    let result = rarities[0];

    for (let i = rarities.length - 1; i >= 0; i--) {
        if (rollVal <= (1 / rarities[i].chance)) {
            result = rarities[i];
            break;
        }
    }

    coins += result.payout * coinMultiplier;

    // Track Best
    if (result.chance > highestChance) {
        highestChance = result.chance;
        const best = document.getElementById('best-roll-display');
        best.innerText = result.name;
        best.style.color = result.color;
    }

    // Update Display
    const nameTxt = document.getElementById('rarity-name');
    nameTxt.innerText = result.name;
    nameTxt.style.color = result.color;
    document.getElementById('rarity-chance').innerText = `1 in ${result.chance.toLocaleString()}`;

    updateRecentRolls(result);
    updateUI();
}

function updateRecentRolls(res) {
    recentRolls.unshift(res);
    if (recentRolls.length > 5) recentRolls.pop();
    
    const feed = document.getElementById('recent-feed');
    feed.innerHTML = '';
    recentRolls.forEach(r => {
        const item = document.createElement('div');
        item.className = 'recent-roll-item';
        item.style.borderColor = r.color;
        item.style.color = r.color;
        item.innerText = r.name.substring(0, 4);
        feed.appendChild(item);
    });
}

function buyPotion() {
    if (coins >= potionCost) {
        coins -= potionCost;
        potionSeconds += 30;
        potionLuck = 2.0;
        potionActive = true;
        document.getElementById('potion-timer').style.display = 'block';
        updateUI();
    }
}

// Potion Timer Loop
setInterval(() => {
    if (potionSeconds > 0) {
        potionSeconds--;
        document.getElementById('potion-timer').innerText = `Potion Active: ${potionSeconds}s`;
    } else if (potionActive) {
        potionActive = false;
        potionLuck = 0;
        document.getElementById('potion-timer').style.display = 'none';
        updateUI();
    }
}, 1000);

function buyUpgrade(type) {
    if (type === 'luck' && coins >= luckCost) {
        coins -= luckCost;
        baseLuck += 0.2;
        luckCost = Math.floor(luckCost * 1.7);
    } else if (type === 'coins' && coins >= coinCost) {
        coins -= coinCost;
        coinMultiplier += 1;
        coinCost = Math.floor(coinCost * 2.2);
    }
    updateUI();
}

// Auto roll Logic
let autoRollActive = false;
let autoRollInterval;
function toggleAutoRoll() {
    autoRollActive = !autoRollActive;
    const btn = document.getElementById('autoroll-btn');
    if (autoRollActive) {
        btn.innerText = "Auto-Roll: ON";
        btn.style.background = "#e74c3c";
        autoRollInterval = setInterval(roll, 250);
    } else {
        btn.innerText = "Auto-Roll: OFF";
        btn.style.background = "#34495e";
        clearInterval(autoRollInterval);
    }
}

document.getElementById('dice').addEventListener('click', roll);
updateUI();