// Game State
let coins = 0;
let luck = 1.0;
let coinTierBonus = 1;
let luckCost = 50;
let coinCost = 100;

// Rarity Data (1 in X chance)
const rarities = [
    { name: "Common", chance: 1, color: "#ffffff", payout: 1 },
    { name: "Uncommon", chance: 5, color: "#a2ffb8", payout: 5 },
    { name: "Rare", chance: 20, color: "#54a0ff", payout: 20 },
    { name: "Epic", chance: 100, color: "#a55eea", payout: 100 },
    { name: "Legendary", chance: 500, color: "#f7b731", payout: 500 },
    { name: "Mythic", chance: 2500, color: "#eb3b5a", payout: 2500 },
    { name: "Elemental: Fire", chance: 10000, color: "#ff4d00", payout: 10000 },
    { name: "Elemental: Void", chance: 50000, color: "#2f3542", payout: 50000 },
    { name: "Galactic", chance: 250000, color: "#2bcbba", payout: 250000 },
    { name: "Universal", chance: 1000000, color: "#fd79a8", payout: 1000000 }
];

const diceBtn = document.getElementById('dice');
const rarityText = document.getElementById('rarity-name');
const chanceText = document.getElementById('rarity-chance');
const coinsDisplay = document.getElementById('coins');
const luckDisplay = document.getElementById('luck-stat');
const log = document.getElementById('roll-log');

function updateUI() {
    coinsDisplay.innerText = Math.floor(coins).toLocaleString();
    luckDisplay.innerText = luck.toFixed(1);
    document.getElementById('luck-cost').innerText = `Cost: ${luckCost}`;
    document.getElementById('coin-cost').innerText = `Cost: ${coinCost}`;
    
    // Disable buttons if can't afford
    document.getElementById('luck-cost').disabled = coins < luckCost;
    document.getElementById('coin-cost').disabled = coins < coinCost;
}

function roll() {
    // Add a little animation
    diceBtn.style.transform = "scale(0.9) rotate(15deg)";
    setTimeout(() => { diceBtn.style.transform = "scale(1) rotate(0deg)"; }, 50);

    // Calculate Roll adjusted by luck
    const rollVal = Math.random() / luck;
    
    let result = rarities[0];
    
    // Loop backwards through rarities to find the rarest hit
    for (let i = rarities.length - 1; i >= 0; i--) {
        if (rollVal <= (1 / rarities[i].chance)) {
            result = rarities[i];
            break;
        }
    }

    // Grant Rewards
    const earnings = result.payout * coinTierBonus;
    coins += earnings;

    // Update Screen
    rarityText.innerText = result.name;
    rarityText.style.color = result.color;
    chanceText.innerText = `1 in ${result.chance.toLocaleString()}`;
    
    const logEntry = document.createElement('div');
    logEntry.innerHTML = `Rolled <b>${result.name}</b> (+${earnings} 💰)`;
    log.prepend(logEntry);

    updateUI();
}

function buyUpgrade(type) {
    if (type === 'luck' && coins >= luckCost) {
        coins -= luckCost;
        luck += 0.2;
        luckCost = Math.floor(luckCost * 1.5);
    } else if (type === 'coins' && coins >= coinCost) {
        coins -= coinCost;
        coinTierBonus += 2;
        coinCost = Math.floor(coinCost * 1.8);
    }
    updateUI();
}

// Event Listeners
diceBtn.addEventListener('click', roll);
updateUI(); // Initial check