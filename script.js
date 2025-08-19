// Estado global do jogo
let gameState = {
    user: {
        isLoggedIn: false,
        name: '',
        balance: 0,
        freeSpins: 0,
        totalSpins: 0,
        totalWinnings: 0
    },
    roulette: {
        isSpinning: false,
        canStop: false,
        currentRotation: 0,
        spinSpeed: 0,
        spinInterval: null
    },
    prizes: [20, 35, 50], // Prêmios da mesa iniciante
    segments: [
        { type: 'empty', value: 0 },
        { type: 'prize', value: 20 },
        { type: 'empty', value: 0 },
        { type: 'prize', value: 35 },
        { type: 'empty', value: 0 },
        { type: 'prize', value: 50 },
        { type: 'empty', value: 0 },
        { type: 'empty', value: 0 }
    ]
};

// Elementos DOM
const elements = {
    registerBtn: document.getElementById('registerBtn'),
    spinBtn: document.getElementById('spinBtn'),
    stopBtn: document.getElementById('stopBtn'),
    rouletteWheel: document.getElementById('rouletteWheel'),
    freeSpinsInfo: document.getElementById('freeSpinsInfo'),
    freeSpinsCount: document.getElementById('freeSpinsCount'),
    userBalance: document.querySelector('.user-balance'),
    loginModal: document.getElementById('loginModal'),
    resultModal: document.getElementById('resultModal'),
    closeButtons: document.querySelectorAll('.close'),
    loginForm: document.getElementById('loginForm'),
    socialButtons: document.querySelectorAll('.btn-social'),
    prizeAmount: document.getElementById('prizeAmount'),
    resultMessage: document.getElementById('resultMessage'),
    continueBtn: document.getElementById('continueBtn'),
    rankingList: document.querySelector('.ranking-list'),
    notificationList: document.querySelector('.notification-list')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    loadRankingData();
    startNotificationSystem();
});

// Configurar event listeners
function setupEventListeners() {
    // Botão de cadastro
    elements.registerBtn.addEventListener('click', openLoginModal);
    
    // Botões da roleta
    elements.spinBtn.addEventListener('click', startSpin);
    elements.stopBtn.addEventListener('click', stopSpin);
    
    // Modais
    elements.closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Clique fora do modal para fechar
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Login social
    elements.socialButtons.forEach(btn => {
        btn.addEventListener('click', handleSocialLogin);
    });
    
    // Formulário de login
    elements.loginForm.addEventListener('submit', handleEmailLogin);
    
    // Botão continuar do resultado
    elements.continueBtn.addEventListener('click', closeResultModal);
    
    // Botões das mesas
    document.querySelectorAll('.btn-play').forEach(btn => {
        btn.addEventListener('click', handleTableSelection);
    });
}

// Inicializar o jogo
function initializeGame() {
    updateUI();
    generateRandomRanking();
}

// Abrir modal de login
function openLoginModal() {
    elements.loginModal.style.display = 'block';
}

// Fechar modais
function closeModal() {
    elements.loginModal.style.display = 'none';
    elements.resultModal.style.display = 'none';
}

function closeResultModal() {
    elements.resultModal.style.display = 'none';
}

// Login social simulado
function handleSocialLogin(event) {
    const provider = event.target.classList.contains('google') ? 'Google' : 'Facebook';
    
    // Simular login bem-sucedido
    gameState.user.isLoggedIn = true;
    gameState.user.name = 'Usuário ' + provider;
    gameState.user.balance = 0;
    gameState.user.freeSpins = 3;
    
    closeModal();
    updateUI();
    showWelcomeMessage();
}

// Login por email simulado
function handleEmailLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
        // Simular login bem-sucedido
        gameState.user.isLoggedIn = true;
        gameState.user.name = email.split('@')[0];
        gameState.user.balance = 0;
        gameState.user.freeSpins = 3;
        
        closeModal();
        updateUI();
        showWelcomeMessage();
    }
}

// Mostrar mensagem de boas-vindas
function showWelcomeMessage() {
    addNotification(`${gameState.user.name} se cadastrou e ganhou 3 giros grátis!`);
}

// Atualizar interface do usuário
function updateUI() {
    if (gameState.user.isLoggedIn) {
        elements.registerBtn.style.display = 'none';
        elements.spinBtn.style.display = 'inline-block';
        elements.freeSpinsInfo.style.display = 'block';
        elements.freeSpinsCount.textContent = gameState.user.freeSpins;
        elements.userBalance.textContent = `Saldo: R$ ${gameState.user.balance.toFixed(2)}`;
    } else {
        elements.registerBtn.style.display = 'inline-block';
        elements.spinBtn.style.display = 'none';
        elements.stopBtn.style.display = 'none';
        elements.freeSpinsInfo.style.display = 'none';
        elements.userBalance.textContent = 'Saldo: R$ 0,00';
    }
    
    // Atualizar estado dos botões
    if (gameState.user.freeSpins <= 0 && gameState.user.balance <= 0) {
        elements.spinBtn.disabled = true;
        elements.spinBtn.textContent = 'Sem giros disponíveis';
    } else {
        elements.spinBtn.disabled = false;
        elements.spinBtn.textContent = 'Girar Roleta';
    }
}

// Iniciar giro da roleta
function startSpin() {
    if (!gameState.user.isLoggedIn || gameState.roulette.isSpinning) return;
    
    if (gameState.user.freeSpins <= 0 && gameState.user.balance <= 0) {
        alert('Você não tem giros grátis nem saldo suficiente!');
        return;
    }
    
    // Consumir giro grátis ou saldo
    if (gameState.user.freeSpins > 0) {
        gameState.user.freeSpins--;
    } else {
        gameState.user.balance -= 5; // Custo mínimo da mesa iniciante
    }
    
    gameState.user.totalSpins++;
    
    // Configurar estado da roleta
    gameState.roulette.isSpinning = true;
    gameState.roulette.canStop = false;
    gameState.roulette.spinSpeed = 20; // Velocidade inicial alta
    
    // Atualizar UI
    elements.spinBtn.style.display = 'none';
    elements.stopBtn.style.display = 'inline-block';
    elements.stopBtn.disabled = true;
    
    // Iniciar animação
    startSpinAnimation();
    
    // Permitir parar após 2 segundos
    setTimeout(() => {
        gameState.roulette.canStop = true;
        elements.stopBtn.disabled = false;
        elements.stopBtn.textContent = 'Parar Agora!';
    }, 2000);
    
    updateUI();
}

// Animação de giro
function startSpinAnimation() {
    gameState.roulette.spinInterval = setInterval(() => {
        gameState.roulette.currentRotation += gameState.roulette.spinSpeed;
        elements.rouletteWheel.style.transform = `rotate(${gameState.roulette.currentRotation}deg)`;
        
        // Reduzir velocidade gradualmente se não pode mais parar
        if (!gameState.roulette.canStop) {
            gameState.roulette.spinSpeed = Math.max(gameState.roulette.spinSpeed - 0.1, 15);
        }
    }, 50);
}

// Parar giro da roleta
function stopSpin() {
    if (!gameState.roulette.canStop) return;
    
    gameState.roulette.isSpinning = false;
    gameState.roulette.canStop = false;
    
    // Parar animação
    clearInterval(gameState.roulette.spinInterval);
    
    // Calcular resultado
    const result = calculateSpinResult();
    
    // Animação de desaceleração
    let currentSpeed = gameState.roulette.spinSpeed;
    const deceleration = setInterval(() => {
        currentSpeed *= 0.95;
        gameState.roulette.currentRotation += currentSpeed;
        elements.rouletteWheel.style.transform = `rotate(${gameState.roulette.currentRotation}deg)`;
        
        if (currentSpeed < 0.5) {
            clearInterval(deceleration);
            
            // Ajustar para o resultado final
            const finalRotation = result.finalRotation;
            elements.rouletteWheel.style.transform = `rotate(${finalRotation}deg)`;
            gameState.roulette.currentRotation = finalRotation;
            
            // Mostrar resultado após animação
            setTimeout(() => {
                showResult(result);
            }, 500);
        }
    }, 50);
    
    // Resetar botões
    elements.stopBtn.style.display = 'none';
    elements.spinBtn.style.display = 'inline-block';
}

// Calcular resultado do giro
function calculateSpinResult() {
    const segmentAngle = 360 / 8; // 8 segmentos
    const normalizedRotation = gameState.roulette.currentRotation % 360;
    const segmentIndex = Math.floor((360 - normalizedRotation + segmentAngle/2) / segmentAngle) % 8;
    
    const segment = gameState.segments[segmentIndex];
    let prize = 0;
    let message = '';
    
    // Regra especial: segundo giro grátis sempre ganha R$ 75
    if (gameState.user.totalSpins === 2 && gameState.user.freeSpins >= 0) {
        prize = 75;
        message = 'Parabéns! Você ganhou o prêmio especial do segundo giro!';
        gameState.user.balance += prize;
    } else if (segment.type === 'prize') {
        prize = segment.value;
        message = `Parabéns! Você ganhou R$ ${prize}!`;
        gameState.user.balance += prize;
    } else {
        message = 'Que pena! Tente novamente na próxima vez.';
    }
    
    if (prize > 0) {
        gameState.user.totalWinnings += prize;
        addNotification(`${gameState.user.name} ganhou R$ ${prize} na roleta!`);
        updateRanking(gameState.user.name, prize);
    }
    
    return {
        prize: prize,
        message: message,
        finalRotation: segmentIndex * segmentAngle
    };
}

// Mostrar resultado
function showResult(result) {
    elements.prizeAmount.textContent = `R$ ${result.prize.toFixed(2)}`;
    elements.resultMessage.textContent = result.message;
    
    if (result.prize > 0) {
        elements.resultModal.querySelector('.result-modal').style.borderColor = 'var(--neon-gold)';
        elements.resultModal.querySelector('.result-modal').style.boxShadow = 'var(--glow-gold)';
    } else {
        elements.resultModal.querySelector('.result-modal').style.borderColor = 'var(--neon-red)';
        elements.resultModal.querySelector('.result-modal').style.boxShadow = '0 0 20px rgba(255, 68, 68, 0.5)';
    }
    
    elements.resultModal.style.display = 'block';
    updateUI();
}

// Seleção de mesa
function handleTableSelection(event) {
    if (!gameState.user.isLoggedIn) {
        alert('Você precisa fazer login primeiro!');
        openLoginModal();
        return;
    }
    
    const card = event.target.closest('.card');
    const tableType = card.classList.contains('beginner') ? 'beginner' : 
                     card.classList.contains('intermediate') ? 'intermediate' : 'high-roller';
    
    let minBet = 0;
    let newPrizes = [];
    
    switch(tableType) {
        case 'beginner':
            minBet = 5;
            newPrizes = [20, 35, 50];
            break;
        case 'intermediate':
            minBet = 20;
            newPrizes = [75, 120, 200];
            break;
        case 'high-roller':
            minBet = 100;
            newPrizes = [350, 500, 750];
            break;
    }
    
    if (gameState.user.balance < minBet && gameState.user.freeSpins <= 0) {
        alert(`Você precisa de pelo menos R$ ${minBet} para jogar nesta mesa!`);
        return;
    }
    
    // Atualizar prêmios da roleta
    gameState.prizes = newPrizes;
    gameState.segments[1].value = newPrizes[0];
    gameState.segments[3].value = newPrizes[1];
    gameState.segments[5].value = newPrizes[2];
    
    // Atualizar segmentos visuais
    const segments = elements.rouletteWheel.querySelectorAll('.segment');
    segments[1].textContent = `R$ ${newPrizes[0]}`;
    segments[3].textContent = `R$ ${newPrizes[1]}`;
    segments[5].textContent = `R$ ${newPrizes[2]}`;
    
    // Scroll para a roleta
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    
    alert(`Mesa ${tableType} selecionada! Aposta mínima: R$ ${minBet}`);
}

// Sistema de ranking
function generateRandomRanking() {
    const names = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira'];
    const rankings = [];
    
    for (let i = 0; i < 5; i++) {
        rankings.push({
            name: names[i],
            winnings: Math.floor(Math.random() * 2000) + 500
        });
    }
    
    rankings.sort((a, b) => b.winnings - a.winnings);
    displayRanking(rankings);
}

function displayRanking(rankings) {
    elements.rankingList.innerHTML = '';
    rankings.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <span>${index + 1}. ${player.name}</span>
            <span>R$ ${player.winnings.toFixed(2)}</span>
        `;
        elements.rankingList.appendChild(item);
    });
}

function updateRanking(playerName, winnings) {
    // Simulação simples de atualização do ranking
    const item = document.createElement('div');
    item.className = 'ranking-item';
    item.innerHTML = `
        <span>🏆 ${playerName}</span>
        <span>R$ ${winnings.toFixed(2)}</span>
    `;
    elements.rankingList.insertBefore(item, elements.rankingList.firstChild);
    
    // Manter apenas os 5 primeiros
    while (elements.rankingList.children.length > 5) {
        elements.rankingList.removeChild(elements.rankingList.lastChild);
    }
}

// Sistema de notificações
function startNotificationSystem() {
    // Adicionar algumas notificações iniciais
    const initialNotifications = [
        'Pedro ganhou R$ 200 na mesa intermediária!',
        'Ana conquistou R$ 500 na mesa high roller!',
        'Carlos fez R$ 35 na mesa iniciante!'
    ];
    
    initialNotifications.forEach((notification, index) => {
        setTimeout(() => {
            addNotification(notification);
        }, index * 2000);
    });
    
    // Gerar notificações aleatórias
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% de chance
            generateRandomNotification();
        }
    }, 10000);
}

function addNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.innerHTML = `<span>${text}</span>`;
    
    elements.notificationList.insertBefore(notification, elements.notificationList.firstChild);
    
    // Manter apenas as 5 últimas notificações
    while (elements.notificationList.children.length > 5) {
        elements.notificationList.removeChild(elements.notificationList.lastChild);
    }
    
    // Remover após 30 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 30000);
}

function generateRandomNotification() {
    const names = ['Lucas', 'Fernanda', 'Roberto', 'Juliana', 'Marcos', 'Patrícia'];
    const prizes = [20, 35, 50, 75, 120, 200, 350, 500];
    const tables = ['iniciante', 'intermediária', 'high roller'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    
    addNotification(`${name} ganhou R$ ${prize} na mesa ${table}!`);
}

// Carregar dados do ranking
function loadRankingData() {
    // Simular carregamento de dados do servidor
    setTimeout(() => {
        generateRandomRanking();
    }, 1000);
}

// Funções utilitárias
function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Salvar estado do jogo no localStorage
function saveGameState() {
    localStorage.setItem('rouletteGameState', JSON.stringify(gameState));
}

// Carregar estado do jogo do localStorage
function loadGameState() {
    const saved = localStorage.getItem('rouletteGameState');
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState = { ...gameState, ...savedState };
        updateUI();
    }
}

// Salvar estado periodicamente
setInterval(saveGameState, 5000);

// Carregar estado ao inicializar
window.addEventListener('load', loadGameState);

