// 🔧 YAHAN APNI AD IDs CHANGE KARO
const AD_CONFIG = {
    APP_ID: "ca-app-pub-6265404039784615~1672019405", // APP ID
    BANNER_ID: "ca-app-pub-6265404039784615/6313778474", // BANNER AD ID
    INTERSTITIAL_ID: "ca-app-pub-6265404039784615/8555770768", // INTERSTITIAL AD ID
    REWARDED_ID: "ca-app-pub-6265404039784615/8551901339" // REWARDED AD ID
};

// Extended Chai Database
const chaiDatabase = {
    basic: ["Masala Chai", "Adrak Chai", "Elaichi Chai", "Plain Chai", "Kadak Chai"],
    special: ["Kesari Chai", "Lemon Chai", "Pudina Chai", "Saffron Chai", "Honey Chai"],
    premium: ["Tulsi Chai", "Pepper Chai", "Cardamom Chai", "Cinnamon Chai", "Vanilla Chai"],
    exotic: ["Bubble Chai", "Iced Chai", "Coconut Chai", "Rose Chai", "Almond Chai"],
    seasonal: ["Winter Spice Chai", "Monsoon Masala", "Summer Cooler", "Festival Special", "Rainbow Chai"]
};

// Extended Special Requests
const specialRequestsDatabase = [
    "with extra sugar", "without sugar", "less sweet", "extra strong", "mild flavor",
    "with ice cream", "with chocolate", "with 2.5 sugar cubes", "with honey", "with cinnamon",
    "with vanilla", "with caramel", "with whipped cream", "with bubble pearls", "with coconut milk",
    "in blue color", "rainbow colored", "extra hot", "ice cold", "with mint leaves",
    "zero calorie", "sugar free", "with protein", "with vitamins", "in fancy cup"
];

// Game Configuration
const gameConfig = {
    levels: {
        beginner: { 
            name: "🌱 Beginner",
            time: 60, 
            maxOrders: 2, 
            lives: 3, 
            targetScore: 100,
            chaiPools: ['basic'],
            specialPool: 'simple',
            orderSpeed: 5000,
            orderTime: 20
        },
        easy: { 
            name: "😊 Easy",
            time: 50, 
            maxOrders: 3, 
            lives: 3, 
            targetScore: 200,
            chaiPools: ['basic', 'special'],
            specialPool: 'medium',
            orderSpeed: 4000,
            orderTime: 18
        },
        medium: { 
            name: "🎯 Medium",
            time: 45, 
            maxOrders: 3, 
            lives: 3, 
            targetScore: 350,
            chaiPools: ['basic', 'special', 'premium'],
            specialPool: 'complex',
            orderSpeed: 3500,
            orderTime: 15
        },
        hard: { 
            name: "🔥 Hard",
            time: 40, 
            maxOrders: 4, 
            lives: 3, 
            targetScore: 500,
            chaiPools: ['basic', 'special', 'premium', 'exotic'],
            specialPool: 'all',
            orderSpeed: 3000,
            orderTime: 12
        }
    },
    ads: {
        interstitialFrequency: 3,
        rewardedAdLife: 1
    },
    iap: {
        removeAdsPrice: "₹49",
        premiumPrice: "₹99"
    }
};

// Game State
let gameState = {
    currentLevel: 'beginner',
    score: 0,
    timeLeft: 0,
    currentOrders: [],
    lives: 0,
    gameActive: false,
    levelCompleted: false,
    adsWatched: 0,
    ordersServed: 0,
    premiumUser: false
};

// Game Elements
const elements = {
    score: null,
    timer: null,
    lives: null,
    levelInfo: null,
    ordersList: null,
    buttonsGrid: null,
    rewardAdBtn: null,
    removeAdsBtn: null
};

// Game Intervals
let gameTimer;
let orderGenerator;

// Customer Data
const customerImages = ["😊", "😄", "🙂", "🤓", "😎", "🧐", "🥳", "👴", "👵", "🧑‍💼"];

// Session-specific data
let sessionData = {
    chaiTypes: {},
    specialRequests: {}
};

// ================== AD IMPLEMENTATION ==================

// Real AdMob Initialization
function initializeAds() {
    if (window.admob) {
        console.log("📱 Initializing REAL AdMob ads...");
        
        // 1. BANNER AD (Bottom mein always visible)
        admob.createBanner({
            adId: AD_CONFIG.BANNER_ID,
            position: admob.AD_POSITION.BOTTOM_CENTER,
            autoShow: true,
            isTesting: false, // ✅ PRODUCTION MODE
            overlap: false,
            offsetTopBar: false
        });
        
        // 2. INTERSTITIAL AD (Full screen - preload)
        admob.prepareInterstitial({
            adId: AD_CONFIG.INTERSTITIAL_ID,
            autoShow: false,
            isTesting: false // ✅ PRODUCTION MODE
        });
        
        // 3. REWARDED AD (Video ad - preload)
        admob.prepareRewardedVideoAd({
            adId: AD_CONFIG.REWARDED_ID,
            autoShow: false,
            isTesting: false // ✅ PRODUCTION MODE
        });
        
        console.log("✅ 3 ad types initialized successfully");
    } else {
        console.log("❌ AdMob plugin not available");
    }
}

// Show INTERSTITIAL AD (Full screen)
function showInterstitialAd() {
    if (window.admob && !gameState.premiumUser) {
        console.log("📺 Showing interstitial ad");
        admob.showInterstitial();
        
        // 30 seconds baad naya interstitial load karo
        setTimeout(() => {
            admob.prepareInterstitial({
                adId: AD_CONFIG.INTERSTITIAL_ID,
                autoShow: false,
                isTesting: false
            });
        }, 30000);
    }
}

// Show REWARDED AD (Video)
function showRewardedAd() {
    if (!window.admob || !gameState.gameActive || gameState.premiumUser) return;
    
    console.log("🎁 Showing rewarded video ad");
    
    elements.rewardAdBtn.classList.add('loading');
    elements.rewardAdBtn.innerHTML = '⏳ Loading Video Ad...';
    
    // Rewarded ad event listeners
    document.addEventListener('onRewardedVideoAdCompleted', function() {
        console.log("✅ Rewarded video completed - Giving reward");
        
        // Reward player with extra life
        gameState.lives += gameConfig.ads.rewardedAdLife;
        gameState.adsWatched++;
        updateUI();
        saveGameState();
        showFeedback('✅ +1 Life from Video Ad!', 'success');
        
        // Reload rewarded ad for next time
        setTimeout(() => {
            admob.prepareRewardedVideoAd({
                adId: AD_CONFIG.REWARDED_ID,
                autoShow: false,
                isTesting: false
            });
        }, 30000);
        
        elements.rewardAdBtn.classList.remove('loading');
        elements.rewardAdBtn.innerHTML = '🎁 Watch Ad for Extra Life';
    });
    
    document.addEventListener('onRewardedVideoAdDismissed', function() {
        console.log("❌ Rewarded video dismissed");
        elements.rewardAdBtn.classList.remove('loading');
        elements.rewardAdBtn.innerHTML = '🎁 Watch Ad for Extra Life';
    });
    
    admob.showRewardedVideoAd();
}

// ================== GAME INITIALIZATION ==================

function initApp() {
    console.log("🎪 Starting Chai Wai App...");
    initChallengeScreen();
    console.log("✅ App initialized successfully!");
}

// Initialize Challenge Screen
function initChallengeScreen() {
    console.log("🚀 Initializing challenge screen...");
    
    const startBtn = document.getElementById('start-challenge-btn');
    console.log("🔍 Start button found:", startBtn);
    
    if (startBtn) {
        startBtn.addEventListener('click', startGameFromChallenge);
        console.log("✅ Click event listener added");
    } else {
        console.error("❌ Start button not found!");
    }
}

// Start game from challenge screen with animation
function startGameFromChallenge() {
    console.log("🎮 Challenge button clicked! Starting animation...");
    
    // Challenge screen hide karo
    showScreen('transition-screen');
    
    // Generate random session data
    generateSessionData();
    
    // Animation complete hone ke baad game start karo
    setTimeout(() => {
        showScreen('game-screen');
        initializeGame();
    }, 3000);
}

// Generate random data for this session
function generateSessionData() {
    console.log("🎲 Generating random session data...");
    
    // Generate random chai types for each level
    Object.keys(gameConfig.levels).forEach(level => {
        const levelConfig = gameConfig.levels[level];
        let availableChais = [];
        
        // Collect chais from selected pools
        levelConfig.chaiPools.forEach(pool => {
            availableChais = [...availableChais, ...chaiDatabase[pool]];
        });
        
        // Shuffle and select 4-6 random chais
        const shuffled = [...availableChais].sort(() => 0.5 - Math.random());
        sessionData.chaiTypes[level] = shuffled.slice(0, 4 + Math.floor(Math.random() * 3));
    });
    
    // Generate random special requests
    sessionData.specialRequests = {
        simple: specialRequestsDatabase.slice(0, 8).sort(() => 0.5 - Math.random()),
        medium: specialRequestsDatabase.slice(0, 12).sort(() => 0.5 - Math.random()),
        complex: specialRequestsDatabase.slice(0, 16).sort(() => 0.5 - Math.random()),
        all: [...specialRequestsDatabase].sort(() => 0.5 - Math.random())
    };
    
    console.log("✅ Session data generated:", sessionData);
}

// Show specific screen
function showScreen(screenId) {
    console.log("🖥️ Switching to screen:", screenId);
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Initialize game
function initializeGame() {
    console.log("🎯 Initializing game...");
    initializeGameElements();
    setupEventListeners();
    loadGameState();
    initializeAds(); // ✅ Ads initialize karo
    startLevel('beginner');
}

// Initialize game elements
function initializeGameElements() {
    elements.score = document.getElementById('score');
    elements.timer = document.getElementById('timer');
    elements.lives = document.getElementById('lives');
    elements.levelInfo = document.getElementById('level-info');
    elements.ordersList = document.getElementById('orders-list');
    elements.buttonsGrid = document.getElementById('buttons-grid');
    elements.rewardAdBtn = document.getElementById('reward-ad-btn');
    elements.removeAdsBtn = document.getElementById('remove-ads-btn');
}

// ================== GAME LOGIC ==================

function startLevel(level) {
    console.log("Starting level:", level);
    const config = gameConfig.levels[level];
    
    if (gameTimer) clearInterval(gameTimer);
    if (orderGenerator) clearInterval(orderGenerator);
    
    gameState.currentLevel = level;
    gameState.timeLeft = config.time;
    gameState.lives = config.lives;
    gameState.currentOrders = [];
    gameState.gameActive = true;
    gameState.levelCompleted = false;
    
    updateUI();
    setupLevelDisplay();
    createChaiButtons();
    startTimer();
    startOrderGenerator();
}

function setupLevelDisplay() {
    const levelConfig = gameConfig.levels[gameState.currentLevel];
    
    if (elements.levelInfo) {
        elements.levelInfo.innerHTML = `
            <div class="level-header">
                <h2>${levelConfig.name}</h2>
                <div class="level-target">Target: ${levelConfig.targetScore} points</div>
            </div>
            <div class="level-stats">
                <span>📝 Max Orders: ${levelConfig.maxOrders}</span>
                <span>⏱️ Time: ${levelConfig.time}s</span>
                <span>❤️ Lives: ${levelConfig.lives}</span>
            </div>
        `;
    }
}

function createChaiButtons() {
    if (!elements.buttonsGrid) return;
    
    const currentChais = sessionData.chaiTypes[gameState.currentLevel];
    elements.buttonsGrid.innerHTML = '';
    
    currentChais.forEach(chai => {
        const button = document.createElement('button');
        button.className = getChaiButtonClass(chai);
        button.textContent = chai;
        button.onclick = () => serveChaiType(chai);
        elements.buttonsGrid.appendChild(button);
    });
}

function getChaiButtonClass(chai) {
    if (chaiDatabase.exotic.includes(chai)) return 'chai-btn rare';
    if (chaiDatabase.seasonal.includes(chai)) return 'chai-btn special';
    if (chaiDatabase.premium.includes(chai)) return 'chai-btn special';
    return 'chai-btn';
}

function serveChaiType(selectedChai) {
    if (!gameState.gameActive) return;
    
    const matchingOrder = gameState.currentOrders.find(order => order.chai === selectedChai);
    
    if (matchingOrder) {
        serveOrder(matchingOrder.id);
    } else {
        loseLife("Wrong chai type! ❌");
    }
}

function serveOrder(orderId) {
    const orderIndex = gameState.currentOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;
    
    const servedOrder = gameState.currentOrders[orderIndex];
    const timeBonus = Math.floor(servedOrder.timeLeft / 2);
    const points = 20 + timeBonus;
    
    gameState.score += points;
    gameState.ordersServed++;
    gameState.currentOrders.splice(orderIndex, 1);
    
    renderOrders();
    showFeedback(`✅ Perfect! +${points} points`, "success");
    checkLevelCompletion();
    
    if (!gameState.premiumUser && gameState.ordersServed % gameConfig.ads.interstitialFrequency === 0) {
        setTimeout(showInterstitialAd, 500);
    }
}

function generateOrder() {
    if (!gameState.gameActive || gameState.levelCompleted) return;
    
    const levelConfig = gameConfig.levels[gameState.currentLevel];
    if (gameState.currentOrders.length >= levelConfig.maxOrders) return;
    
    const currentChais = sessionData.chaiTypes[gameState.currentLevel];
    const currentSpecials = sessionData.specialRequests[levelConfig.specialPool];
    
    const order = {
        id: Date.now() + Math.random(),
        chai: currentChais[Math.floor(Math.random() * currentChais.length)],
        special: currentSpecials[Math.floor(Math.random() * currentSpecials.length)],
        emoji: customerImages[Math.floor(Math.random() * customerImages.length)],
        timeLeft: levelConfig.orderTime
    };
    
    gameState.currentOrders.push(order);
    renderOrders();
    startOrderTimer(order.id);
}

function startOrderGenerator() {
    const levelConfig = gameConfig.levels[gameState.currentLevel];
    
    orderGenerator = setInterval(() => {
        if (gameState.gameActive && !gameState.levelCompleted) {
            generateOrder();
        }
    }, levelConfig.orderSpeed);
}

function startOrderTimer(orderId) {
    const orderTimer = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(orderTimer);
            return;
        }
        
        const order = gameState.currentOrders.find(o => o.id === orderId);
        if (!order) {
            clearInterval(orderTimer);
            return;
        }
        
        order.timeLeft--;
        renderOrders();
        
        if (order.timeLeft <= 0) {
            clearInterval(orderTimer);
            failOrder(orderId, "Time Up! ⏰");
        }
    }, 1000);
}

// ================== UI FUNCTIONS ==================

function renderOrders() {
    if (!elements.ordersList) return;
    
    elements.ordersList.innerHTML = '';
    
    if (gameState.currentOrders.length === 0) {
        elements.ordersList.innerHTML = '<div class="no-orders">No orders yet... Wait for customers! 👀</div>';
        return;
    }
    
    gameState.currentOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order';
        orderElement.innerHTML = `
            <div class="order-content">
                <span class="customer-emoji">${order.emoji}</span>
                <span class="order-text"><strong>${order.chai}</strong> ${order.special}</span>
                <span class="order-timer">⏳ ${order.timeLeft}s</span>
            </div>
        `;
        elements.ordersList.appendChild(orderElement);
    });
}

function updateUI() {
    if (elements.score) elements.score.textContent = gameState.score;
    if (elements.timer) elements.timer.textContent = `${gameState.timeLeft}s`;
    if (elements.lives) elements.lives.textContent = gameState.lives;
    
    if (elements.timer) {
        elements.timer.style.color = gameState.timeLeft <= 10 ? '#ff4444' : '#333';
    }
}

function showFeedback(message, type) {
    const existingFeedback = document.querySelector('.feedback');
    if (existingFeedback) existingFeedback.remove();
    
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 2000);
}

// ================== GAME FLOW ==================

function checkLevelCompletion() {
    const targetScore = gameConfig.levels[gameState.currentLevel].targetScore;
    if (gameState.score >= targetScore && !gameState.levelCompleted) {
        gameState.levelCompleted = true;
        
        // Interstitial ad with 30% chance on level complete
        if (!gameState.premiumUser && Math.random() < 0.3) {
            setTimeout(showInterstitialAd, 1000);
        }
        
        completeLevel();
    }
}

function completeLevel() {
    gameState.gameActive = false;
    clearInterval(orderGenerator);
    
    const levels = Object.keys(gameConfig.levels);
    const currentIndex = levels.indexOf(gameState.currentLevel);
    const nextLevel = levels[currentIndex + 1];
    
    setTimeout(() => {
        if (nextLevel) {
            const continueGame = confirm(
                `🎉 Level Complete!\n\n🏆 Score: ${gameState.score}\n❤️ Lives: ${gameState.lives}\n\nNext: ${gameConfig.levels[nextLevel].name}\n\nReady?`
            );
            
            if (continueGame) startLevel(nextLevel);
        } else {
            showGameComplete();
        }
    }, 1500);
}

function startTimer() {
    gameTimer = setInterval(() => {
        if (!gameState.gameActive) {
            clearInterval(gameTimer);
            return;
        }
        
        gameState.timeLeft--;
        updateUI();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);
}

function failOrder(orderId, reason) {
    gameState.currentOrders = gameState.currentOrders.filter(order => order.id !== orderId);
    renderOrders();
    loseLife(reason);
}

function loseLife(reason) {
    gameState.lives--;
    updateUI();
    showFeedback(reason, "error");
    
    if (gameState.lives <= 0) endGame();
}

function endGame() {
    gameState.gameActive = false;
    clearInterval(gameTimer);
    clearInterval(orderGenerator);
    
    // Game over par interstitial ad with 50% chance
    if (!gameState.premiumUser && Math.random() < 0.5) {
        setTimeout(showInterstitialAd, 1500);
    }
    
    // Disable buttons
    document.querySelectorAll('.chai-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    if (elements.rewardAdBtn) elements.rewardAdBtn.disabled = true;
    
    setTimeout(() => {
        const playAgain = confirm(`🎮 Game Over!\n🏆 Score: ${gameState.score}\n\nTry Again?`);
        if (playAgain) location.reload();
    }, 1000);
}

function showGameComplete() {
    setTimeout(() => {
        alert(`🏆 CONGRATULATIONS!\nFinal Score: ${gameState.score}\nYou are a CHAI MASTER! 👑`);
    }, 1000);
}

// ================== MONETIZATION ==================

function setupEventListeners() {
    if (elements.rewardAdBtn) {
        elements.rewardAdBtn.addEventListener('click', showRewardedAd);
    }
    
    if (elements.removeAdsBtn) {
        elements.removeAdsBtn.addEventListener('click', offerRemoveAds);
    }
}

function loadGameState() {
    const saved = localStorage.getItem('chaiWaiGame');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState.premiumUser = data.premiumUser || false;
            gameState.adsWatched = data.adsWatched || 0;
        } catch (e) {
            console.log("Error loading saved game:", e);
        }
    }
    updateMonetizationUI();
}

function saveGameState() {
    const data = {
        premiumUser: gameState.premiumUser,
        adsWatched: gameState.adsWatched
    };
    localStorage.setItem('chaiWaiGame', JSON.stringify(data));
}

function updateMonetizationUI() {
    if (!elements.removeAdsBtn || !elements.rewardAdBtn) return;
    
    if (gameState.premiumUser) {
        elements.removeAdsBtn.style.display = 'none';
        // Banner ad hide karna complex hai, isliye nahi kiya
    }
    
    elements.rewardAdBtn.disabled = !gameState.gameActive;
}

function offerRemoveAds() {
    const confirmPurchase = confirm(`Remove All Ads Forever?\nPrice: ${gameConfig.iap.removeAdsPrice}\n\nClick OK to simulate purchase`);
    if (confirmPurchase) {
        gameState.premiumUser = true;
        updateMonetizationUI();
        saveGameState();
        showFeedback('⭐ Premium Activated! Ads Removed!', 'success');
    }
}

// Start the app
window.addEventListener('load', initApp);