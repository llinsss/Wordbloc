// Game Data
const wordData = {
    animals: [
        { word: 'cat', emoji: '🐱' },
        { word: 'dog', emoji: '🐶' },
        { word: 'fish', emoji: '🐠' },
        { word: 'bird', emoji: '🐦' },
        { word: 'frog', emoji: '🐸' },
        { word: 'bear', emoji: '🐻' },
        { word: 'lion', emoji: '🦁' },
        { word: 'duck', emoji: '🦆' }
    ],
    fruits: [
        { word: 'apple', emoji: '🍎' },
        { word: 'grape', emoji: '🍇' },
        { word: 'lemon', emoji: '🍋' },
        { word: 'peach', emoji: '🍑' },
        { word: 'melon', emoji: '🍉' },
        { word: 'berry', emoji: '🫐' },
        { word: 'mango', emoji: '🥭' },
        { word: 'pear', emoji: '🍐' }
    ],
    colors: [
        { word: 'red', emoji: '🔴' },
        { word: 'blue', emoji: '🔵' },
        { word: 'green', emoji: '🟢' },
        { word: 'yellow', emoji: '🟡' },
        { word: 'pink', emoji: '🩷' },
        { word: 'orange', emoji: '🟠' },
        { word: 'purple', emoji: '🟣' },
        { word: 'brown', emoji: '🟤' }
    ],
    objects: [
        { word: 'ball', emoji: '⚽' },
        { word: 'book', emoji: '📚' },
        { word: 'star', emoji: '⭐' },
        { word: 'heart', emoji: '❤️' },
        { word: 'house', emoji: '🏠' },
        { word: 'tree', emoji: '🌳' },
        { word: 'sun', emoji: '☀️' },
        { word: 'moon', emoji: '🌙' }
    ]
};

// Game State
let currentCategory = '';
let currentWordIndex = 0;
let currentWord = '';
let userAnswer = [];
let totalStars = parseInt(localStorage.getItem('spellbloc_totalStars')) || 0;
let playerLevel = parseInt(localStorage.getItem('spellbloc_playerLevel')) || 1;
let volume = 0.7;

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const victoryScreen = document.getElementById('victoryScreen');
const wordImage = document.getElementById('wordImage');
const dropZone = document.getElementById('dropZone');
const letterBank = document.getElementById('letterBank');
const feedback = document.getElementById('feedback');
const progressFill = document.getElementById('progressFill');
const currentStarsDisplay = document.getElementById('currentStars');
const totalStarsDisplay = document.getElementById('totalStars');
const playerLevelDisplay = document.getElementById('playerLevel');
const settingsPanel = document.getElementById('settingsPanel');
const volumeControl = document.getElementById('volumeControl');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    setupEventListeners();
});

function setupEventListeners() {
    // Category selection
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            currentWordIndex = 0;
            startGame();
        });
    });

    // Navigation
    document.getElementById('backBtn').addEventListener('click', () => showScreen('home'));
    document.getElementById('homeBtn').addEventListener('click', () => showScreen('home'));
    document.getElementById('nextLevelBtn').addEventListener('click', nextWord);
    document.getElementById('playSound').addEventListener('click', () => speakWord(currentWord));

    // Delete and Clear buttons
    document.getElementById('deleteBtn').addEventListener('click', deleteLast);
    document.getElementById('clearBtn').addEventListener('click', clearAll);

    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => {
        settingsPanel.classList.toggle('active');
    });
    document.getElementById('closeSettings').addEventListener('click', () => {
        settingsPanel.classList.remove('active');
    });
    volumeControl.addEventListener('input', (e) => {
        volume = e.target.value / 100;
    });
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if (screen === 'home') {
        homeScreen.classList.add('active');
    } else if (screen === 'game') {
        gameScreen.classList.add('active');
    } else if (screen === 'victory') {
        victoryScreen.classList.add('active');
    }
}

function startGame() {
    showScreen('game');
    loadWord();
}

function loadWord() {
    const words = wordData[currentCategory];
    if (currentWordIndex >= words.length) {
        currentWordIndex = 0;
    }

    const wordObj = words[currentWordIndex];
    currentWord = wordObj.word;
    userAnswer = [];

    // Update UI
    wordImage.textContent = wordObj.emoji;
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    // Update progress
    const progress = ((currentWordIndex + 1) / words.length) * 100;
    progressFill.style.width = progress + '%';

    // Create drop zone slots
    dropZone.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'letter-slot';
        slot.dataset.index = i;
        dropZone.appendChild(slot);
    }

    // Create scrambled letters
    createLetterBank();

    // Auto-play word
    setTimeout(() => speakWord(currentWord), 500);
}

function createLetterBank() {
    const letters = currentWord.split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    
    letterBank.innerHTML = '';
    scrambled.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter.toUpperCase();
        tile.dataset.letter = letter;
        tile.dataset.id = index;
        
        tile.addEventListener('click', () => handleLetterClick(tile));
        
        letterBank.appendChild(tile);
    });
}

function handleLetterClick(tile) {
    if (tile.classList.contains('used')) return;

    const letter = tile.dataset.letter;
    const currentSlotIndex = userAnswer.length;

    if (currentSlotIndex < currentWord.length) {
        userAnswer.push({ letter, tileId: tile.dataset.id });
        tile.classList.add('used');

        const slot = dropZone.children[currentSlotIndex];
        slot.textContent = letter.toUpperCase();
        slot.classList.add('filled');
        slot.dataset.tileId = tile.dataset.id;

        playSound('pop');

        // Add click to remove
        slot.addEventListener('click', () => removeLetterFromSlot(slot, currentSlotIndex));

        if (userAnswer.length === currentWord.length) {
            checkAnswer();
        }
    }
}

function removeLetterFromSlot(slot, slotIndex) {
    if (userAnswer.length === currentWord.length) return;

    const tileId = slot.dataset.tileId;
    const tile = letterBank.querySelector(`[data-id="${tileId}"]`);
    
    if (tile) {
        tile.classList.remove('used');
    }

    userAnswer.splice(slotIndex, 1);
    
    Array.from(dropZone.children).forEach((s, i) => {
        if (i < userAnswer.length) {
            s.textContent = userAnswer[i].letter.toUpperCase();
            s.classList.add('filled');
            s.dataset.tileId = userAnswer[i].tileId;
        } else {
            s.textContent = '';
            s.classList.remove('filled');
            delete s.dataset.tileId;
        }
    });
}

function deleteLast() {
    if (userAnswer.length === 0) return;
    
    const lastAnswer = userAnswer[userAnswer.length - 1];
    const tile = letterBank.querySelector(`[data-id="${lastAnswer.tileId}"]`);
    
    if (tile) {
        tile.classList.remove('used');
    }
    
    userAnswer.pop();
    
    const lastSlot = dropZone.children[userAnswer.length];
    lastSlot.textContent = '';
    lastSlot.classList.remove('filled');
    delete lastSlot.dataset.tileId;
    
    playSound('pop');
}

function clearAll() {
    if (userAnswer.length === 0) return;
    
    userAnswer = [];
    
    Array.from(dropZone.children).forEach(slot => {
        slot.textContent = '';
        slot.classList.remove('filled');
        delete slot.dataset.tileId;
    });
    
    Array.from(letterBank.children).forEach(tile => {
        tile.classList.remove('used');
    });
    
    playSound('pop');
}

function checkAnswer() {
    const answer = userAnswer.map(a => a.letter).join('');
    
    if (answer === currentWord) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    feedback.textContent = '🎉 Perfect! Great job!';
    feedback.className = 'feedback correct';
    
    playSound('success');
    
    // Award stars
    const starsEarned = 3;
    totalStars += starsEarned;
    currentStarsDisplay.textContent = totalStars;
    
    // Level up every 10 stars
    if (totalStars >= playerLevel * 10) {
        playerLevel++;
    }
    
    saveProgress();
    
    // Celebrate animation
    wordImage.classList.add('celebrate');
    setTimeout(() => wordImage.classList.remove('celebrate'), 500);
    
    // Auto-advance to next word or show round complete
    currentWordIndex++;
    const words = wordData[currentCategory];
    
    if (currentWordIndex >= words.length) {
        // Round complete - show victory screen
        setTimeout(() => {
            showVictoryScreen(starsEarned);
        }, 1500);
    } else {
        // Continue to next word
        setTimeout(() => {
            loadWord();
        }, 1500);
    }
}

function handleIncorrectAnswer() {
    feedback.textContent = '🤔 Try again! You can do it!';
    feedback.className = 'feedback incorrect';
    
    playSound('error');
    
    // Reset after delay
    setTimeout(() => {
        userAnswer = [];
        Array.from(dropZone.children).forEach(slot => {
            slot.textContent = '';
            slot.classList.remove('filled');
        });
        Array.from(letterBank.children).forEach(tile => {
            tile.classList.remove('used');
        });
        feedback.textContent = '';
    }, 1500);
}

function showVictoryScreen(stars) {
    const totalRoundStars = wordData[currentCategory].length * 3;
    document.getElementById('earnedStars').textContent = totalRoundStars;
    document.getElementById('victoryStars').textContent = '⭐'.repeat(Math.min(totalRoundStars / 3, 5));
    showScreen('victory');
}

function nextWord() {
    currentWordIndex = 0;
    showScreen('game');
    loadWord();
}

function updateStats() {
    totalStarsDisplay.textContent = totalStars;
    playerLevelDisplay.textContent = playerLevel;
}

function saveProgress() {
    localStorage.setItem('spellbloc_totalStars', totalStars);
    localStorage.setItem('spellbloc_playerLevel', playerLevel);
    updateStats();
}

// Audio Functions (using Web Speech API)
function speakWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.volume = volume;
        speechSynthesis.speak(utterance);
    }
}

function playSound(type) {
    // Using Web Audio API for simple sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = volume * 0.3;
    
    if (type === 'pop') {
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    } else if (type === 'success') {
        oscillator.frequency.value = 523.25; // C5
        oscillator.type = 'sine';
        setTimeout(() => {
            oscillator.frequency.value = 659.25; // E5
        }, 100);
        setTimeout(() => {
            oscillator.frequency.value = 783.99; // G5
        }, 200);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    } else if (type === 'error') {
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    // Prevent scrolling while playing
    if (gameScreen.classList.contains('active')) {
        e.preventDefault();
    }
}, { passive: false });
