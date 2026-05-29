// Game State
let coins = 0;
let luck = 1.0;
let coinTierBonus = 1;
let luckCost = 50;
let coinCost = 100;
let highestChanceRolled = 0; // Tracks best roll index

let autoRollInterval = null;
let isAutoRolling = false;

// Rarity Data (1 in X chance)
const rarities = [
    { name: "Common", chance: 1, color: "#ffffff", payout: 1 },
    { name: "Uncommon", chance: 5, color: "#a2ffb8", payout: 5 },
    { name: "Rare", chance: 20, color: "#54a0ff", payout: 20 },
    { name: "Epic", chance: 100, color: "#a55eea", payout: 100 },
    { name: "Legendary", chance: 500, color: "#f7b731", payout: 500 },
    { name: "Mythic", chance: 2500, color: "#eb3b5a", payout: 2500 },
    { name: "Supernatural", chance: 7500, color: "#00d2d3", payout: 6000 },
    { name: "Demonic", chance: 20000, color: "#ff6b6b", payout: 15000 },
    { name: "Angelical", chance: 50000, color: "#fff200", payout: 40000 },
    { name: "Elemental: Fire", chance: 150000, color: "#ff4d00", payout: 120000 },
    { name: "Elemental: Void", chance: 500000, color: "#57606f", payout: 400000 },
    { name: "Galactic", chance: 2000000, color: "#2bcbba", payout: 1500000 },
    { name: "Universal", chance: 10000000, color: "#fd79a8", payout: 8000000 }
];

const diceBtn = document.getElementById('dice');
const rarityText = document.getElementById('rarity-name');
const chanceText = document.getElementById('rarity-chance');
const coinsDisplay = document.getElementById('coins');
const luckDisplay = document.getElementById('luck-stat');
const bestRollDisplay = document.getElementById('best-roll-display');
const displayBox = document.getElementById('rarity-display-box');
const log = document.getElementById('roll-log');
const autoBtn = document.getElementById('autoroll-btn');

function updateUI() {
    coinsDisplay.innerText = Math.floor(coins).toLocaleString();
    luckDisplay.innerText = luck.toFixed(1);
    document.getElementById('luck-cost').innerText = `Cost: ${luckCost}`;
    document.getElementById('coin-cost').innerText = `Cost: ${coinCost}`;
    
    document.getElementById('luck-cost').disabled = coins < luckCost;
    document.getElementById('coin-cost').disabled = coins < coinCost;
}

function roll() {
    // Dice Click Animation Bounce
    diceBtn.style.transform = "scale(0.85) rotate(12deg)";
    setTimeout(() => { diceBtn.style.transform = "scale(1) rotate(0deg)"; }, 40);

    // Calculate Roll with Luck factor
    const rollVal = Math.random() / luck;
    let result = rarities[0];
    let resultIndex = 0;
    
    for (let i = rarities.length - 1; i >= 0; i--) {
        if (rollVal <= (1 / rarities[i].chance)) {
            result = rarities[i];
            resultIndex = i;
            break;
        }
    }

    // Money Calculations
    const earnings = result.payout * coinTierBonus;
    coins += earnings;

    // Tracker for Best Roll
    if (result.chance > highestChanceRolled) {
        highestChanceRolled = result.chance;
        bestRollDisplay.innerText = `${result.name} (1/${result.chance.toLocaleString()})`;
        bestRollDisplay.style.color = result.color;
    }

    // Display Text & Colors
    rarityText.innerText = result.name;
    rarityText.style.color = result.color;
    chanceText.innerText = `1 in ${result.chance.toLocaleString()}`;
    
    // Dynamic Box Glow Effects for Rare Drops
    if (result.chance >= 100) {
        displayBox.style.boxShadow = `inset 0 0 20px ${result.color}44, 0 0 15px ${result.color}33`;
        displayBox.style.background = `${result.color}11`;
    } else {
        displayBox.style.boxShadow = "none";
        displayBox.style.background = "rgba(0,0,0,0.2)";
    }

    // Log Feed Output
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `Rolled <span style="color:${result.color}; font-weight:bold">${result.name}</span> (+${earnings.toLocaleString()} 💰)`;
    log.prepend(logEntry);

    // Prevent log from overflowing memory endlessly
    if (log.children.length > 25) {
        log.removeChild(log.lastChild);
    }

    updateUI();
}

function toggleAutoRoll() {
    if (isAutoRolling) {
        clearInterval(autoRollInterval);
        autoBtn.innerText = "Auto-Roll: OFF";
        autoBtn.classList.remove('active');
        isAutoRolling = false;
    } else {
        // Automatically rolls every 300ms
        autoRollInterval = setInterval(roll, 300);
        autoBtn.innerText = "Auto-Roll: ON";
        autoBtn.classList.add('active');
        isAutoRolling = true;
    }
}

function buyUpgrade(type) {
    if (type === 'luck' && coins >= luckCost) {
        coins -= luckCost;
        luck += 0.2;
        luckCost = Math.floor(luckCost * 1.6);
    } else if (type === 'coins' && coins >= coinCost) {
        coins -= coinCost;
        coinTierBonus += 2;
        coinCost = Math.floor(coinCost * 1.9);
    }
    updateUI();
}

diceBtn.addEventListener('click', roll);
updateUI();