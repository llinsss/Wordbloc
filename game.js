// Age-Based Learning Curriculum
const curriculum = {
    age2: {
        name: "First Letters",
        description: "Learn letter shapes and sounds",
        categories: {
            vowels: [
                { word: 'a', emoji: '🅰️', sound: 'ah' },
                { word: 'e', emoji: '🇪', sound: 'eh' },
                { word: 'i', emoji: '🇮', sound: 'ih' },
                { word: 'o', emoji: '🅾️', sound: 'oh' },
                { word: 'u', emoji: '🇺', sound: 'uh' }
            ],
            vowel_words: [
                { word: 'at', emoji: '📍', sound: 'at' },
                { word: 'it', emoji: '👆', sound: 'it' },
                { word: 'up', emoji: '⬆️', sound: 'up' },
                { word: 'on', emoji: '🔛', sound: 'on' },
                { word: 'in', emoji: '📥', sound: 'in' },
                { word: 'am', emoji: '👋', sound: 'am' },
                { word: 'an', emoji: '🅰️', sound: 'an' },
                { word: 'as', emoji: '↗️', sound: 'as' },
                { word: 'if', emoji: '❓', sound: 'if' },
                { word: 'is', emoji: '✅', sound: 'is' },
                { word: 'us', emoji: '👥', sound: 'us' },
                { word: 'or', emoji: '🔀', sound: 'or' }
            ]
        }
    },
    age3: {
        name: "Letter Sounds",
        description: "Master all letter sounds",
        categories: {
            vowels: [
                { word: 'a', emoji: '🅰️', sound: 'ah' },
                { word: 'e', emoji: '🇪', sound: 'eh' },
                { word: 'i', emoji: '🇮', sound: 'ih' },
                { word: 'o', emoji: '🅾️', sound: 'oh' },
                { word: 'u', emoji: '🇺', sound: 'uh' }
            ],
            vowel_words: [
                { word: 'at', emoji: '📍', sound: 'at' },
                { word: 'it', emoji: '👆', sound: 'it' },
                { word: 'up', emoji: '⬆️', sound: 'up' },
                { word: 'on', emoji: '🔛', sound: 'on' },
                { word: 'in', emoji: '📥', sound: 'in' },
                { word: 'am', emoji: '👋', sound: 'am' },
                { word: 'an', emoji: '🅰️', sound: 'an' },
                { word: 'as', emoji: '↗️', sound: 'as' },
                { word: 'if', emoji: '❓', sound: 'if' },
                { word: 'is', emoji: '✅', sound: 'is' },
                { word: 'us', emoji: '👥', sound: 'us' },
                { word: 'or', emoji: '🔀', sound: 'or' },
                { word: 'ox', emoji: '🐂', sound: 'ox' },
                { word: 'ax', emoji: '🪓', sound: 'ax' },
                { word: 'of', emoji: '🔄', sound: 'of' },
                { word: 'oh', emoji: '😮', sound: 'oh' }
            ],
            consonants: [
                { word: 'b', emoji: '🅱️', sound: 'buh' },
                { word: 'c', emoji: '🇨', sound: 'kuh' },
                { word: 'd', emoji: '🇩', sound: 'duh' },
                { word: 'm', emoji: '🇲', sound: 'muh' },
                { word: 'p', emoji: '🅿️', sound: 'puh' },
                { word: 't', emoji: '🇹', sound: 'tuh' }
            ],
            consonant_words: [
                { word: 'we', emoji: '👥', sound: 'we' },
                { word: 'me', emoji: '👤', sound: 'me' },
                { word: 'to', emoji: '➡️', sound: 'to' },
                { word: 'do', emoji: '✅', sound: 'do' },
                { word: 'go', emoji: '🏃', sound: 'go' },
                { word: 'my', emoji: '👆', sound: 'my' },
                { word: 'by', emoji: '📍', sound: 'by' },
                { word: 'no', emoji: '❌', sound: 'no' }
            ]
        }
    },
    age4: {
        name: "First Words",
        description: "Simple 3-letter words",
        categories: {
            vowels: [
                { word: 'a', emoji: '🅰️', sound: 'ah' },
                { word: 'e', emoji: '🇪', sound: 'eh' },
                { word: 'i', emoji: '🇮', sound: 'ih' },
                { word: 'o', emoji: '🅾️', sound: 'oh' },
                { word: 'u', emoji: '🇺', sound: 'uh' }
            ],
            consonants: [
                { word: 'b', emoji: '🅱️', sound: 'buh' },
                { word: 'c', emoji: '🇨', sound: 'kuh' },
                { word: 'd', emoji: '🇩', sound: 'duh' },
                { word: 'm', emoji: '🇲', sound: 'muh' },
                { word: 'p', emoji: '🅿️', sound: 'puh' },
                { word: 't', emoji: '🇹', sound: 'tuh' }
            ],
            animals: [
                { word: 'cat', emoji: '🐱' },
                { word: 'dog', emoji: '🐶' },
                { word: 'pig', emoji: '🐷' },
                { word: 'cow', emoji: '🐮' },
                { word: 'bee', emoji: '🐝' },
                { word: 'fox', emoji: '🦊' }
            ],
            colors: [
                { word: 'red', emoji: '🔴' },
                { word: 'blue', emoji: '🔵' },
                { word: 'pink', emoji: '🩷' },
                { word: 'green', emoji: '🟢' }
            ]
        }
    },
    age5: {
        name: "Word Builder",
        description: "4-letter words and blends",
        categories: {
            vowels: [
                { word: 'a', emoji: '🅰️', sound: 'ah' },
                { word: 'e', emoji: '🇪', sound: 'eh' },
                { word: 'i', emoji: '🇮', sound: 'ih' },
                { word: 'o', emoji: '🅾️', sound: 'oh' },
                { word: 'u', emoji: '🇺', sound: 'uh' }
            ],
            consonants: [
                { word: 'b', emoji: '🅱️', sound: 'buh' },
                { word: 'c', emoji: '🇨', sound: 'kuh' },
                { word: 'd', emoji: '🇩', sound: 'duh' },
                { word: 'm', emoji: '🇲', sound: 'muh' },
                { word: 'p', emoji: '🅿️', sound: 'puh' },
                { word: 't', emoji: '🇹', sound: 'tuh' }
            ],
            animals: [
                { word: 'bird', emoji: '🐦' },
                { word: 'fish', emoji: '🐠' },
                { word: 'frog', emoji: '🐸' },
                { word: 'bear', emoji: '🐻' },
                { word: 'duck', emoji: '🦆' },
                { word: 'lion', emoji: '🦁' }
            ],
            colors: [
                { word: 'red', emoji: '🔴' },
                { word: 'blue', emoji: '🔵' },
                { word: 'pink', emoji: '🩷' },
                { word: 'green', emoji: '🟢' }
            ],
            fruits: [
                { word: 'plum', emoji: '🟣' },
                { word: 'pear', emoji: '🍐' },
                { word: 'lime', emoji: '🟢' },
                { word: 'kiwi', emoji: '🥝' }
            ]
        }
    },
    age6: {
        name: "Spelling Master",
        description: "5-letter words and complex sounds",
        categories: {
            vowels: [
                { word: 'a', emoji: '🅰️', sound: 'ah' },
                { word: 'e', emoji: '🇪', sound: 'eh' },
                { word: 'i', emoji: '🇮', sound: 'ih' },
                { word: 'o', emoji: '🅾️', sound: 'oh' },
                { word: 'u', emoji: '🇺', sound: 'uh' }
            ],
            consonants: [
                { word: 'b', emoji: '🅱️', sound: 'buh' },
                { word: 'c', emoji: '🇨', sound: 'kuh' },
                { word: 'd', emoji: '🇩', sound: 'duh' },
                { word: 'm', emoji: '🇲', sound: 'muh' },
                { word: 'p', emoji: '🅿️', sound: 'puh' },
                { word: 't', emoji: '🇹', sound: 'tuh' }
            ],
            animals: [
                { word: 'tiger', emoji: '🐅' },
                { word: 'horse', emoji: '🐴' },
                { word: 'sheep', emoji: '🐑' },
                { word: 'whale', emoji: '🐋' },
                { word: 'snake', emoji: '🐍' },
                { word: 'mouse', emoji: '🐭' }
            ],
            colors: [
                { word: 'yellow', emoji: '🟡' },
                { word: 'orange', emoji: '🟠' },
                { word: 'purple', emoji: '🟣' },
                { word: 'brown', emoji: '🟤' },
                { word: 'black', emoji: '⚫' },
                { word: 'white', emoji: '⚪' }
            ],
            fruits: [
                { word: 'apple', emoji: '🍎' },
                { word: 'grape', emoji: '🍇' },
                { word: 'lemon', emoji: '🍋' },
                { word: 'peach', emoji: '🍑' },
                { word: 'melon', emoji: '🍉' },
                { word: 'mango', emoji: '🥭' }
            ],
            objects: [
                { word: 'chair', emoji: '🪑' },
                { word: 'table', emoji: '🪑' },
                { word: 'phone', emoji: '📱' },
                { word: 'clock', emoji: '🕐' },
                { word: 'brush', emoji: '🖌️' },
                { word: 'spoon', emoji: '🥄' }
            ]
        }
    },
    age7: {
        name: "Reading Ready",
        description: "Complex words and reading prep",
        categories: {
            vowels: [
                { word: 'a', emoji: '🅰️', sound: 'ah' },
                { word: 'e', emoji: '🇪', sound: 'eh' },
                { word: 'i', emoji: '🇮', sound: 'ih' },
                { word: 'o', emoji: '🅾️', sound: 'oh' },
                { word: 'u', emoji: '🇺', sound: 'uh' }
            ],
            consonants: [
                { word: 'b', emoji: '🅱️', sound: 'buh' },
                { word: 'c', emoji: '🇨', sound: 'kuh' },
                { word: 'd', emoji: '🇩', sound: 'duh' },
                { word: 'm', emoji: '🇲', sound: 'muh' },
                { word: 'p', emoji: '🅿️', sound: 'puh' },
                { word: 't', emoji: '🇹', sound: 'tuh' }
            ],
            animals: [
                { word: 'elephant', emoji: '🐘' },
                { word: 'giraffe', emoji: '🦒' },
                { word: 'penguin', emoji: '🐧' },
                { word: 'dolphin', emoji: '🐬' },
                { word: 'butterfly', emoji: '🦋' },
                { word: 'rabbit', emoji: '🐰' }
            ],
            colors: [
                { word: 'yellow', emoji: '🟡' },
                { word: 'orange', emoji: '🟠' },
                { word: 'purple', emoji: '🟣' },
                { word: 'brown', emoji: '🟤' },
                { word: 'black', emoji: '⚫' },
                { word: 'white', emoji: '⚪' }
            ],
            fruits: [
                { word: 'strawberry', emoji: '🍓' },
                { word: 'pineapple', emoji: '🍍' },
                { word: 'watermelon', emoji: '🍉' },
                { word: 'blueberry', emoji: '🫐' },
                { word: 'coconut', emoji: '🥥' },
                { word: 'banana', emoji: '🍌' }
            ],
            objects: [
                { word: 'computer', emoji: '💻' },
                { word: 'bicycle', emoji: '🚲' },
                { word: 'umbrella', emoji: '☂️' },
                { word: 'sandwich', emoji: '🥪' },
                { word: 'backpack', emoji: '🎒' },
                { word: 'airplane', emoji: '✈️' }
            ]
        }
    }
};

// Get current age-appropriate curriculum
let currentAge = parseInt(localStorage.getItem('spellbloc_age')) || 2;
let wordData = curriculum[`age${currentAge}`].categories;

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
    updateAgeDisplay();
    setupEventListeners();
});

function updateAgeDisplay() {
    const ageData = curriculum[`age${currentAge}`];
    document.getElementById('ageTitle').textContent = `${ageData.name} (Age ${currentAge})`;
    document.getElementById('ageSelect').value = currentAge;
    
    // Update categories
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';
    
    Object.keys(wordData).forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = category;
        btn.innerHTML = `
            <span class="emoji">${wordData[category][0].emoji}</span>
            <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
        `;
        btn.addEventListener('click', () => {
            currentCategory = category;
            currentWordIndex = 0;
            startGame();
        });
        container.appendChild(btn);
    });
}

function setupEventListeners() {
    // Age selection
    document.getElementById('ageSelect').addEventListener('change', (e) => {
        currentAge = parseInt(e.target.value);
        localStorage.setItem('spellbloc_age', currentAge);
        wordData = curriculum[`age${currentAge}`].categories;
        updateAgeDisplay();
    });

    // Navigation
    document.getElementById('backBtn').addEventListener('click', () => showScreen('home'));
    document.getElementById('homeBtn').addEventListener('click', () => showScreen('home'));
    document.getElementById('nextLevelBtn').addEventListener('click', nextWord);
    document.getElementById('playSound').addEventListener('click', () => {
        const words = wordData[currentCategory];
        const wordObj = words[currentWordIndex];
        if (currentCategory === 'vowels' || currentCategory === 'consonants') {
            speakLetterSound(wordObj);
        } else {
            speakWord(currentWord);
        }
    });

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

    // Auto-play word or letter sound
    if (currentCategory === 'vowels' || currentCategory === 'consonants') {
        setTimeout(() => speakLetterSound(wordObj), 500);
    } else if (currentCategory === 'vowel_words' || currentCategory === 'consonant_words') {
        setTimeout(() => speakWord(currentWord), 500);
    } else {
        setTimeout(() => speakWord(currentWord), 500);
    }
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
    const categories = Object.keys(wordData);
    const currentIndex = categories.indexOf(currentCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    
    currentCategory = categories[nextIndex];
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
        utterance.rate = 0.6;
        utterance.pitch = 1.4;
        utterance.volume = volume;
        speechSynthesis.speak(utterance);
    }
}

function speakLetterSound(wordObj) {
    if (wordObj.sound && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(wordObj.sound);
        utterance.rate = 0.5;
        utterance.pitch = 1.5;
        utterance.volume = volume;
        speechSynthesis.speak(utterance);
    } else {
        speakWord(wordObj.word);
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
