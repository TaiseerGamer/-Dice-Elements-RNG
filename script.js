// Game State Values
let coins = 0;
let baseLuck = 1.0;
let potionLuck = 0;
let skinLuckBonus = 0;

let baseCoinMultiplier = 1;
let skinCoinMultiplier = 1;

let luckCost = 50;
let coinCost = 100;
let potionCost = 500;

let totalRollsCount = 0;
let pityCounter = 0;
const PITY_MAX = 100;

let potionActive = false;
let potionSeconds = 0;

let highestChance = 0;
let highestName = "None Yet";
let highestColor = "#aaa";
let recentRolls = [];
let unlockedSkins = [];
let claimedAchievements = [];

let anomalyActive = false;
let anomalyReward = 0;

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
    { name: "Infinity", chance: 100000000, color: "#a29bfe", payout: 50000000 },
    { name: "Multiverse", chance: 750000000, color: "#fd79a8", payout: 400000000 },
    { name: "Absolute Zero", chance: 5000000000, color: "#00d2d3", payout: 3000000000 },
    // v0.0.4 Endgame Expansions
    { name: "Singularity", chance: 40000000000, color: "#e84393", payout: 25000000000 },
    { name: "The Matrix", chance: 300000000000, color: "#2ed573", payout: 180000000000 }
];

function getTotalLuck() { return (baseLuck + potionLuck + skinLuckBonus); }
function getTotalCoinMultiplier() { return baseCoinMultiplier * skinCoinMultiplier; }

// Alert notice mechanic
function showAlert(message, color = "#2ecc71") {
    const alertBox = document.getElementById('game-alert');
    alertBox.innerText = message;
    alertBox.style.backgroundColor = color;
    alertBox.style.opacity = "1";
    setTimeout(() => { alertBox.style.opacity = "0"; }, 2000);
}

function updateUI() {
    document.getElementById('coins').innerText = Math.floor(coins).toLocaleString();
    document.getElementById('luck-stat').innerText = getTotalLuck().toFixed(1);
    document.getElementById('stat-rolls').innerText = totalRollsCount.toLocaleString();
    
    document.getElementById('luck-cost').innerText = `Buy: ${luckCost}`;
    document.getElementById('coin-cost').innerText = `Buy: ${coinCost}`;
    document.getElementById('potion-cost').innerText = `Buy: ${potionCost}`;
    
    document.getElementById('luck-cost').disabled = coins < luckCost;
    document.getElementById('coin-cost').disabled = coins < coinCost;
    document.getElementById('potion-cost').disabled = coins < potionCost;

    // Refresh display structures
    const best = document.getElementById('best-roll-display');
    best.innerText = highestName === "None Yet" ? "None Yet" : `${highestName} (1/${highestChance.toLocaleString()})`;
    best.style.color = highestColor;

    updateForgeButton(1, 25000);
    updateForgeButton(2, 500000);
    updateMilestoneButton(1, 100);
    updateMilestoneButton(2, 1000);
    updateMilestoneButton(3, 10000);

    const fill = (pityCounter / PITY_MAX) * 100;
    document.getElementById('pity-fill').style.width = `${fill}%`;
    document.getElementById('pity-indicator').style.display = pityCounter >= PITY_MAX ? 'block' : 'none';
}

function roll() {
    let currentLuck = getTotalLuck();
    totalRollsCount++;
    
    if (pityCounter >= PITY_MAX) {
        currentLuck *= 10;
        pityCounter = 0;
    } else { pityCounter++; }

    const rollVal = Math.random() / currentLuck;
    let result = rarities[0];

    for (let i = rarities.length - 1; i >= 0; i--) {
        if (rollVal <= (1 / rarities[i].chance)) {
            result = rarities[i];
            break;
        }
    }

    const reward = result.payout * getTotalCoinMultiplier();
    coins += reward;

    if (result.chance > highestChance) {
        highestChance = result.chance;
        highestName = result.name;
        highestColor = result.color;
    }

    document.getElementById('rarity-name').innerText = result.name;
    document.getElementById('rarity-name').style.color = result.color;
    document.getElementById('rarity-chance').innerText = `1 in ${result.chance.toLocaleString()}`;

    // Random Anomaly Triggering (0.5% chance per active roll)
    if (Math.random() < 0.005 && !anomalyActive) {
        triggerAnomaly(reward * 50);
    }

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

/* ANOMALY ACTIONS */
function triggerAnomaly(payoutSize) {
    anomalyActive = true;
    anomalyReward = Math.max(500, Math.floor(payoutSize));
    document.getElementById('anomaly').style.display = 'block';
}

function popAnomaly() {
    if (anomalyActive) {
        coins += anomalyReward;
        showAlert(`+${anomalyReward.toLocaleString()} ANOMALY CASH!`, "#ff4757");
        document.getElementById('anomaly').style.display = 'none';
        anomalyActive = false;
        updateUI();
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

function buyUpgrade(type) {
    if (type === 'luck' && coins >= luckCost) {
        coins -= luckCost;
        baseLuck += 0.2;
        luckCost = Math.floor(luckCost * 1.7);
    } else if (type === 'coins' && coins >= coinCost) {
        coins -= coinCost;
        baseCoinMultiplier += 1;
        coinCost = Math.floor(coinCost * 2.2);
    }
    updateUI();
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

function buySkin(id, cost, luckBonus, coinMult) {
    if (coins >= cost && !unlockedSkins.includes(id)) {
        coins -= cost;
        unlockedSkins.push(id);
        skinLuckBonus += luckBonus;
        skinCoinMultiplier = Math.max(skinCoinMultiplier, coinMult);
        if(id === 1) document.getElementById('dice').style.background = '#e67e22';
        if(id === 2) document.getElementById('dice').style.background = '#9b59b6';
        updateUI();
    }
}

function updateForgeButton(id, cost) {
    const btn = document.getElementById(`skin-btn-${id}`);
    if (unlockedSkins.includes(id)) {
        btn.innerText = "Equipped";
        btn.disabled = true;
    } else { btn.disabled = coins < cost; }
}

function claimReward(id, target, reward) {
    if (totalRollsCount >= target && !claimedAchievements.includes(id)) {
        coins += reward;
        claimedAchievements.push(id);
        updateUI();
    }
}

function updateMilestoneButton(id, target) {
    const btn = document.getElementById(`ach-btn-${id}`);
    if (claimedAchievements.includes(id)) {
        btn.innerText = "Claimed ✓";
        btn.disabled = true;
    } else { btn.disabled = totalRollsCount < target; }
}

/* DATA ARCHIVE STATIONS (LOCALSTORAGE) */
function saveGame(manual = false) {
    const saveState = {
        coins, baseLuck, baseCoinMultiplier, luckCost, coinCost,
        totalRollsCount, pityCounter, highestChance, highestName, highestColor,
        unlockedSkins, claimedAchievements, skinLuckBonus, skinCoinMultiplier
    };
    localStorage.setItem('diceRNG_savefile', JSON.stringify(saveState));
    if (manual) showAlert("Progress Saved Safely!");
}

function loadGame() {
    const data = localStorage.getItem('diceRNG_savefile');
    if (!data) return;
    const save = JSON.parse(data);
    
    coins = save.coins ?? 0;
    baseLuck = save.baseLuck ?? 1.0;
    baseCoinMultiplier = save.baseCoinMultiplier ?? 1;
    luckCost = save.luckCost ?? 50;
    coinCost = save.coinCost ?? 100;
    totalRollsCount = save.totalRollsCount ?? 0;
    pityCounter = save.pityCounter ?? 0;
    highestChance = save.highestChance ?? 0;
    highestName = save.highestName ?? "None Yet";
    highestColor = save.highestColor ?? "#aaa";
    unlockedSkins = save.unlockedSkins ?? [];
    claimedAchievements = save.claimedAchievements ?? [];
    skinLuckBonus = save.skinLuckBonus ?? 0;
    skinCoinMultiplier = save.skinCoinMultiplier ?? 1;

    // Reinject skin colors to dice component on boot load
    if(unlockedSkins.includes(2)) document.getElementById('dice').style.background = '#9b59b6';
    else if(unlockedSkins.includes(1)) document.getElementById('dice').style.background = '#e67e22';

    updateUI();
}

function wipeSave() {
    if (confirm("Are you absolutely sure you want to reset everything? Your progress will be lost forever!")) {
        localStorage.removeItem('diceRNG_savefile');
        window.location.reload();
    }
}

// Running Engine Loops
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

// Auto save process loop triggers every 5 seconds
setInterval(() => { saveGame(false); }, 5000);

let autoRollActive = false;
let autoRollInterval;
function toggleAutoRoll() {
    autoRollActive = !autoRollActive;
    const btn = document.getElementById('autoroll-btn');
    if (autoRollActive) {
        btn.innerText = "Auto-Roll: ON";
        btn.style.background = "#e74c3c";
        autoRollInterval = setInterval(roll, 200);
    } else {
        btn.innerText = "Auto-Roll: OFF";
        btn.style.background = "#34495e";
        clearInterval(autoRollInterval);
    }
}

document.getElementById('dice').addEventListener('click', roll);
window.onload = function() {
    loadGame();
    updateUI();
};