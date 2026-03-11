// Advanced Learning System
class AdaptiveLearningEngine {
    constructor() {
        this.difficultyLevel = 1.0; // 0.5 = easier, 2.0 = harder
        this.performanceHistory = [];
        this.spacedRepetition = new Map();
        this.analytics = new LearningAnalytics();
    }

    adjustDifficulty(isCorrect, timeToComplete) {
        const performance = {
            correct: isCorrect,
            time: timeToComplete,
            timestamp: Date.now()
        };
        
        this.performanceHistory.push(performance);
        
        // Keep only last 10 attempts for calculation
        if (this.performanceHistory.length > 10) {
            this.performanceHistory.shift();
        }
        
        const recentCorrect = this.performanceHistory.filter(p => p.correct).length;
        const accuracy = recentCorrect / this.performanceHistory.length;
        
        // Adjust difficulty based on performance
        if (accuracy > 0.8 && this.difficultyLevel < 2.0) {
            this.difficultyLevel += 0.1;
        } else if (accuracy < 0.6 && this.difficultyLevel > 0.5) {
            this.difficultyLevel -= 0.1;
        }
        
        this.analytics.recordAttempt(performance);
    }

    scheduleSpacedRepetition(word, difficulty) {
        const now = Date.now();
        const intervals = [1, 3, 7, 14, 30]; // days
        const currentInterval = this.spacedRepetition.get(word)?.interval || 0;
        const nextInterval = intervals[Math.min(currentInterval + 1, intervals.length - 1)];
        
        this.spacedRepetition.set(word, {
            nextReview: now + (nextInterval * 24 * 60 * 60 * 1000),
            interval: currentInterval + 1,
            difficulty: difficulty
        });
    }

    getWordsForReview() {
        const now = Date.now();
        const wordsToReview = [];
        
        for (const [word, data] of this.spacedRepetition) {
            if (data.nextReview <= now) {
                wordsToReview.push(word);
            }
        }
        
        return wordsToReview;
    }
}

class LearningAnalytics {
    constructor() {
        this.sessions = [];
        this.currentSession = null;
    }

    startSession() {
        this.currentSession = {
            startTime: Date.now(),
            attempts: [],
            wordsLearned: [],
            totalTime: 0
        };
    }

    recordAttempt(attempt) {
        if (this.currentSession) {
            this.currentSession.attempts.push(attempt);
        }
    }

    endSession() {
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
            this.currentSession.totalTime = this.currentSession.endTime - this.currentSession.startTime;
            this.sessions.push(this.currentSession);
            this.saveAnalytics();
            this.currentSession = null;
        }
    }

    getProgressReport() {
        const totalSessions = this.sessions.length;
        const totalAttempts = this.sessions.reduce((sum, s) => sum + s.attempts.length, 0);
        const correctAttempts = this.sessions.reduce((sum, s) => 
            sum + s.attempts.filter(a => a.correct).length, 0);
        const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
        
        return {
            totalSessions,
            totalAttempts,
            accuracy: Math.round(accuracy),
            averageSessionTime: totalSessions > 0 ? 
                Math.round(this.sessions.reduce((sum, s) => sum + s.totalTime, 0) / totalSessions / 1000) : 0,
            weakAreas: this.identifyWeakAreas(),
            strongAreas: this.identifyStrongAreas()
        };
    }

    identifyWeakAreas() {
        // Analyze which categories have lower accuracy
        const categoryPerformance = {};
        this.sessions.forEach(session => {
            session.attempts.forEach(attempt => {
                const category = attempt.category || 'unknown';
                if (!categoryPerformance[category]) {
                    categoryPerformance[category] = { correct: 0, total: 0 };
                }
                categoryPerformance[category].total++;
                if (attempt.correct) categoryPerformance[category].correct++;
            });
        });
        
        return Object.entries(categoryPerformance)
            .map(([cat, perf]) => ({ 
                category: cat, 
                accuracy: (perf.correct / perf.total) * 100 
            }))
            .filter(item => item.accuracy < 70)
            .sort((a, b) => a.accuracy - b.accuracy);
    }

    identifyStrongAreas() {
        const categoryPerformance = {};
        this.sessions.forEach(session => {
            session.attempts.forEach(attempt => {
                const category = attempt.category || 'unknown';
                if (!categoryPerformance[category]) {
                    categoryPerformance[category] = { correct: 0, total: 0 };
                }
                categoryPerformance[category].total++;
                if (attempt.correct) categoryPerformance[category].correct++;
            });
        });
        
        return Object.entries(categoryPerformance)
            .map(([cat, perf]) => ({ 
                category: cat, 
                accuracy: (perf.correct / perf.total) * 100 
            }))
            .filter(item => item.accuracy >= 80)
            .sort((a, b) => b.accuracy - a.accuracy);
    }

    saveAnalytics() {
        localStorage.setItem('spellbloc_analytics', JSON.stringify(this.sessions));
    }

    loadAnalytics() {
        const saved = localStorage.getItem('spellbloc_analytics');
        if (saved) {
            this.sessions = JSON.parse(saved);
        }
    }
}

// Game Modes
class GameModeManager {
    constructor() {
        this.currentMode = 'classic';
        this.modes = {
            classic: new ClassicMode(),
            story: new StoryMode(),
            timed: new TimedMode(),
            puzzle: new PuzzleMode()
        };
    }

    setMode(modeName) {
        this.currentMode = modeName;
        return this.modes[modeName];
    }

    getCurrentMode() {
        return this.modes[this.currentMode];
    }
}

class ClassicMode {
    constructor() {
        this.name = 'Classic';
        this.description = 'Traditional spelling practice';
    }

    initializeGame(wordData) {
        return wordData;
    }
}

class StoryMode {
    constructor() {
        this.name = 'Story Adventure';
        this.description = 'Spell words to unlock story chapters';
        this.currentChapter = 1;
        this.storyProgress = 0;
    }

    initializeGame(wordData) {
        // Add story context to words
        return wordData.map(word => ({
            ...word,
            storyContext: this.getStoryContext(word.word)
        }));
    }

    getStoryContext(word) {
        const contexts = {
            cat: "The brave cat explores the magical forest...",
            dog: "A friendly dog joins your adventure...",
            bird: "A colorful bird shows you the way..."
        };
        return contexts[word] || `You discover a ${word} on your journey...`;
    }
}

class TimedMode {
    constructor() {
        this.name = 'Speed Challenge';
        this.description = 'Race against time!';
        this.timeLimit = 30; // seconds
        this.timeRemaining = 30;
    }

    initializeGame(wordData) {
        this.timeRemaining = this.timeLimit;
        this.startTimer();
        return wordData;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = `⏰ ${this.timeRemaining}s`;
        }
    }

    endGame() {
        clearInterval(this.timer);
        // Trigger game end
    }
}

class PuzzleMode {
    constructor() {
        this.name = 'Word Puzzles';
        this.description = 'Solve word mysteries!';
    }

    initializeGame(wordData) {
        return wordData.map(word => ({
            ...word,
            puzzle: this.createPuzzle(word.word)
        }));
    }

    createPuzzle(word) {
        // Create a word puzzle (missing letters, anagrams, etc.)
        const puzzleTypes = ['missing_letter', 'anagram', 'rhyme'];
        const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
        
        switch (type) {
            case 'missing_letter':
                const pos = Math.floor(Math.random() * word.length);
                return {
                    type: 'missing_letter',
                    clue: word.split('').map((l, i) => i === pos ? '_' : l).join(''),
                    answer: word[pos]
                };
            case 'anagram':
                return {
                    type: 'anagram',
                    clue: word.split('').sort(() => Math.random() - 0.5).join(''),
                    answer: word
                };
            default:
                return { type: 'normal', clue: word, answer: word };
        }
    }
}

// Accessibility Features
class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            dyslexiaFont: false,
            fontSize: 'normal',
            colorBlindSupport: false,
            screenReader: false,
            reducedMotion: false
        };
        this.loadSettings();
    }

    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        document.body.classList.toggle('high-contrast', this.settings.highContrast);
        this.saveSettings();
    }

    toggleDyslexiaFont() {
        this.settings.dyslexiaFont = !this.settings.dyslexiaFont;
        document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont);
        this.saveSettings();
    }

    setFontSize(size) {
        document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge');
        document.body.classList.add(`font-${size}`);
        this.settings.fontSize = size;
        this.saveSettings();
    }

    enableScreenReader() {
        this.settings.screenReader = true;
        document.body.setAttribute('aria-live', 'polite');
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('spellbloc_accessibility', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('spellbloc_accessibility');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }

    applySettings() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        if (this.settings.dyslexiaFont) {
            document.body.classList.add('dyslexia-font');
        }
        if (this.settings.fontSize !== 'normal') {
            document.body.classList.add(`font-${this.settings.fontSize}`);
        }
    }
}

// Initialize advanced systems
const adaptiveLearning = new AdaptiveLearningEngine();
const gameModeManager = new GameModeManager();
const accessibilityManager = new AccessibilityManager();

// Load analytics on startup
adaptiveLearning.analytics.loadAnalytics();
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
                { word: 'or', emoji: '🔀', sound: 'or' },
                { word: 'ox', emoji: '🐂', sound: 'ox' },
                { word: 'ax', emoji: '🪓', sound: 'ax' },
                { word: 'of', emoji: '🔄', sound: 'of' },
                { word: 'oh', emoji: '😮', sound: 'oh' },
                { word: 'ad', emoji: '📢', sound: 'ad' },
                { word: 'ah', emoji: '😌', sound: 'ah' },
                { word: 'eh', emoji: '🤷', sound: 'eh' },
                { word: 'uh', emoji: '🤔', sound: 'uh' },
                { word: 'um', emoji: '🤨', sound: 'um' },
                { word: 'ow', emoji: '😣', sound: 'ow' },
                { word: 'aw', emoji: '🥺', sound: 'aw' },
                { word: 'ex', emoji: '❌', sound: 'ex' },
                { word: 'id', emoji: '🆔', sound: 'id' },
                { word: 'ed', emoji: '📝', sound: 'ed' },
                { word: 'el', emoji: '🔤', sound: 'el' },
                { word: 'em', emoji: '📏', sound: 'em' },
                { word: 'en', emoji: '🔚', sound: 'en' },
                { word: 'et', emoji: '👽', sound: 'et' }
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
                { word: 'no', emoji: '❌', sound: 'no' },
                { word: 'so', emoji: '👍', sound: 'so' },
                { word: 'he', emoji: '👨', sound: 'he' },
                { word: 'hi', emoji: '👋', sound: 'hi' },
                { word: 'be', emoji: '🐝', sound: 'bee' },
                { word: 'ma', emoji: '👩', sound: 'ma' },
                { word: 'pa', emoji: '👨', sound: 'pa' },
                { word: 'la', emoji: '🎵', sound: 'la' },
                { word: 'ha', emoji: '😂', sound: 'ha' },
                { word: 'ba', emoji: '🐑', sound: 'ba' },
                { word: 'da', emoji: '👨', sound: 'da' },
                { word: 'ta', emoji: '👋', sound: 'ta' },
                { word: 'pi', emoji: '🥧', sound: 'pi' },
                { word: 'ti', emoji: '🍵', sound: 'ti' },
                { word: 'mi', emoji: '🎵', sound: 'mi' },
                { word: 'si', emoji: '🎵', sound: 'si' },
                { word: 'po', emoji: '📮', sound: 'po' },
                { word: 'bo', emoji: '🎀', sound: 'bo' },
                { word: 'mo', emoji: '🐄', sound: 'mo' },
                { word: 'lo', emoji: '🔍', sound: 'lo' },
                { word: 'ho', emoji: '🎅', sound: 'ho' },
                { word: 'yo', emoji: '🪀', sound: 'yo' },
                { word: 'mu', emoji: '🐄', sound: 'mu' }
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
                { word: 'fox', emoji: '🦊' },
                { word: 'bat', emoji: '🦇' },
                { word: 'bug', emoji: '🐛' },
                { word: 'hen', emoji: '🐓' },
                { word: 'owl', emoji: '🦉' },
                { word: 'rat', emoji: '🐀' },
                { word: 'ant', emoji: '🐜' },
                { word: 'ape', emoji: '🐵' },
                { word: 'elk', emoji: '🦌' },
                { word: 'eel', emoji: '🐍' },
                { word: 'yak', emoji: '🐂' },
                { word: 'ram', emoji: '🐏' },
                { word: 'doe', emoji: '🦌' },
                { word: 'cub', emoji: '🐻' },
                { word: 'pup', emoji: '🐶' },
                { word: 'kit', emoji: '🦊' },
                { word: 'caw', emoji: '🐦' },
                { word: 'moo', emoji: '🐄' },
                { word: 'baa', emoji: '🐑' },
                { word: 'hog', emoji: '🐷' },
                { word: 'cod', emoji: '🐟' },
                { word: 'jay', emoji: '🐦' },
                { word: 'fly', emoji: '🪰' },
                { word: 'coy', emoji: '🐟' },
                { word: 'gnu', emoji: '🦌' }
            ],
            colors: [
                { word: 'red', emoji: '🔴' },
                { word: 'blue', emoji: '🔵' },
                { word: 'pink', emoji: '🩷' },
                { word: 'green', emoji: '🟢' },
                { word: 'gray', emoji: '⬜' },
                { word: 'tan', emoji: '🧋' },
                { word: 'gold', emoji: '🥇' },
                { word: 'mint', emoji: '🍃' },
                { word: 'navy', emoji: '🔵' },
                { word: 'lime', emoji: '🟢' },
                { word: 'rose', emoji: '🌹' },
                { word: 'jade', emoji: '🟢' },
                { word: 'ruby', emoji: '🔴' },
                { word: 'cyan', emoji: '🟦' },
                { word: 'aqua', emoji: '🟦' },
                { word: 'teal', emoji: '🟦' },
                { word: 'plum', emoji: '🟣' },
                { word: 'sage', emoji: '🟢' },
                { word: 'rust', emoji: '🟠' },
                { word: 'sand', emoji: '🧋' },
                { word: 'coal', emoji: '⚫' },
                { word: 'snow', emoji: '⚪' },
                { word: 'ash', emoji: '⬜' },
                { word: 'bone', emoji: '🧋' },
                { word: 'wine', emoji: '🟣' },
                { word: 'sky', emoji: '🟦' },
                { word: 'sea', emoji: '🟦' },
                { word: 'mud', emoji: '🟤' },
                { word: 'fog', emoji: '⬜' },
                { word: 'dew', emoji: '🟦' }
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
                { word: 'lion', emoji: '🦁' },
                { word: 'wolf', emoji: '🐺' },
                { word: 'deer', emoji: '🦌' },
                { word: 'goat', emoji: '🐐' },
                { word: 'crab', emoji: '🦀' },
                { word: 'seal', emoji: '🤭' },
                { word: 'toad', emoji: '🐸' },
                { word: 'hawk', emoji: '🦅' },
                { word: 'mole', emoji: '🐹' },
                { word: 'lynx', emoji: '🐈' },
                { word: 'boar', emoji: '🐗' },
                { word: 'swan', emoji: '🦢' },
                { word: 'wren', emoji: '🐦' },
                { word: 'newt', emoji: '🦎' },
                { word: 'ibex', emoji: '🐐' },
                { word: 'puma', emoji: '🐈' },
                { word: 'lynx', emoji: '🐈' },
                { word: 'mink', emoji: '🤦' },
                { word: 'vole', emoji: '🐹' },
                { word: 'shad', emoji: '🐟' },
                { word: 'bass', emoji: '🐟' },
                { word: 'carp', emoji: '🐟' },
                { word: 'pike', emoji: '🐟' },
                { word: 'sole', emoji: '🐟' }
            ],
            colors: [
                { word: 'red', emoji: '🔴' },
                { word: 'blue', emoji: '🔵' },
                { word: 'pink', emoji: '🩷' },
                { word: 'green', emoji: '🟢' },
                { word: 'gray', emoji: '⬜' },
                { word: 'tan', emoji: '🧋' },
                { word: 'gold', emoji: '🥇' },
                { word: 'mint', emoji: '🍃' },
                { word: 'navy', emoji: '🔵' },
                { word: 'lime', emoji: '🟢' },
                { word: 'rose', emoji: '🌹' },
                { word: 'jade', emoji: '🟢' },
                { word: 'ruby', emoji: '🔴' },
                { word: 'cyan', emoji: '🟦' },
                { word: 'aqua', emoji: '🟦' },
                { word: 'teal', emoji: '🟦' },
                { word: 'plum', emoji: '🟣' },
                { word: 'sage', emoji: '🟢' },
                { word: 'rust', emoji: '🟠' },
                { word: 'sand', emoji: '🧋' },
                { word: 'coal', emoji: '⚫' },
                { word: 'snow', emoji: '⚪' },
                { word: 'ash', emoji: '⬜' },
                { word: 'bone', emoji: '🧋' },
                { word: 'wine', emoji: '🟣' },
                { word: 'sky', emoji: '🟦' },
                { word: 'sea', emoji: '🟦' },
                { word: 'mud', emoji: '🟤' },
                { word: 'fog', emoji: '⬜' },
                { word: 'dew', emoji: '🟦' }
            ],
            fruits: [
                { word: 'plum', emoji: '🟣' },
                { word: 'pear', emoji: '🍐' },
                { word: 'lime', emoji: '🟢' },
                { word: 'kiwi', emoji: '🥝' },
                { word: 'date', emoji: '🌴' },
                { word: 'fig', emoji: '🍃' },
                { word: 'berry', emoji: '🍓' },
                { word: 'grape', emoji: '🍇' },
                { word: 'peach', emoji: '🍑' },
                { word: 'apple', emoji: '🍎' },
                { word: 'lemon', emoji: '🍋' },
                { word: 'melon', emoji: '🍉' },
                { word: 'mango', emoji: '🥭' },
                { word: 'guava', emoji: '🍏' },
                { word: 'papaya', emoji: '🥭' },
                { word: 'cherry', emoji: '🍒' },
                { word: 'olive', emoji: '🫒' },
                { word: 'prune', emoji: '🟣' },
                { word: 'raisin', emoji: '🍇' },
                { word: 'currant', emoji: '🍇' },
                { word: 'apricot', emoji: '🍑' },
                { word: 'citrus', emoji: '🍊' },
                { word: 'nectar', emoji: '🍯' },
                { word: 'juice', emoji: '🥤' },
                { word: 'pulp', emoji: '🍊' },
                { word: 'rind', emoji: '🍊' },
                { word: 'seed', emoji: '🌱' },
                { word: 'pit', emoji: '🍑' },
                { word: 'core', emoji: '🍎' },
                { word: 'stem', emoji: '🌱' }
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
                { word: 'mouse', emoji: '🐭' },
                { word: 'zebra', emoji: '🦓' },
                { word: 'panda', emoji: '🐼' },
                { word: 'koala', emoji: '🐨' },
                { word: 'sloth', emoji: '🦜' },
                { word: 'otter', emoji: '🤦' },
                { word: 'skunk', emoji: '🤨' },
                { word: 'camel', emoji: '🐪' },
                { word: 'llama', emoji: '🦙' },
                { word: 'rhino', emoji: '🦏' },
                { word: 'hippo', emoji: '🦛' },
                { word: 'bison', emoji: '🐃' },
                { word: 'moose', emoji: '🦌' },
                { word: 'badger', emoji: '🦝' },
                { word: 'beaver', emoji: '🦝' },
                { word: 'ferret', emoji: '🤦' },
                { word: 'weasel', emoji: '🤦' },
                { word: 'marten', emoji: '🤦' },
                { word: 'possum', emoji: '🐹' },
                { word: 'raccoon', emoji: '🦝' },
                { word: 'squirrel', emoji: '🐿️' },
                { word: 'chipmunk', emoji: '🐿️' },
                { word: 'prairie', emoji: '🐹' },
                { word: 'gopher', emoji: '🐹' },
                { word: 'marmot', emoji: '🐹' }
            ],
            colors: [
                { word: 'yellow', emoji: '🟡' },
                { word: 'orange', emoji: '🟠' },
                { word: 'purple', emoji: '🟣' },
                { word: 'brown', emoji: '🟤' },
                { word: 'black', emoji: '⚫' },
                { word: 'white', emoji: '⚪' },
                { word: 'silver', emoji: '⬜' },
                { word: 'bronze', emoji: '🥉' },
                { word: 'coral', emoji: '🪸' },
                { word: 'cream', emoji: '🧋' }
            ],
            fruits: [
                { word: 'apple', emoji: '🍎' },
                { word: 'grape', emoji: '🍇' },
                { word: 'lemon', emoji: '🍋' },
                { word: 'peach', emoji: '🍑' },
                { word: 'melon', emoji: '🍉' },
                { word: 'mango', emoji: '🥭' },
                { word: 'berry', emoji: '🍓' },
                { word: 'cherry', emoji: '🍒' },
                { word: 'papaya', emoji: '🥭' },
                { word: 'guava', emoji: '🍏' }
            ],
            objects: [
                { word: 'chair', emoji: '🪑' },
                { word: 'table', emoji: '🪑' },
                { word: 'phone', emoji: '📱' },
                { word: 'clock', emoji: '🕐' },
                { word: 'brush', emoji: '🖌️' },
                { word: 'spoon', emoji: '🥄' },
                { word: 'plate', emoji: '🍽️' },
                { word: 'knife', emoji: '🔪' },
                { word: 'towel', emoji: '🧽' },
                { word: 'pillow', emoji: '😴' }
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
                { word: 'rabbit', emoji: '🐰' },
                { word: 'hamster', emoji: '🐹' },
                { word: 'leopard', emoji: '🐆' },
                { word: 'cheetah', emoji: '🐆' },
                { word: 'gorilla', emoji: '🦍' },
                { word: 'octopus', emoji: '🐙' },
                { word: 'starfish', emoji: '⭐' }
            ],
            colors: [
                { word: 'yellow', emoji: '🟡' },
                { word: 'orange', emoji: '🟠' },
                { word: 'purple', emoji: '🟣' },
                { word: 'brown', emoji: '🟤' },
                { word: 'black', emoji: '⚫' },
                { word: 'white', emoji: '⚪' },
                { word: 'silver', emoji: '⬜' },
                { word: 'bronze', emoji: '🥉' },
                { word: 'coral', emoji: '🪸' },
                { word: 'cream', emoji: '🧋' },
                { word: 'crimson', emoji: '🔴' },
                { word: 'emerald', emoji: '🟢' }
            ],
            fruits: [
                { word: 'strawberry', emoji: '🍓' },
                { word: 'pineapple', emoji: '🍍' },
                { word: 'watermelon', emoji: '🍉' },
                { word: 'blueberry', emoji: '🫐' },
                { word: 'coconut', emoji: '🥥' },
                { word: 'banana', emoji: '🍌' },
                { word: 'raspberry', emoji: '🍓' },
                { word: 'blackberry', emoji: '🍓' },
                { word: 'cranberry', emoji: '🍓' },
                { word: 'grapefruit', emoji: '🍊' }
            ],
            objects: [
                { word: 'computer', emoji: '💻' },
                { word: 'bicycle', emoji: '🚲' },
                { word: 'umbrella', emoji: '☂️' },
                { word: 'sandwich', emoji: '🥪' },
                { word: 'backpack', emoji: '🎒' },
                { word: 'airplane', emoji: '✈️' },
                { word: 'telescope', emoji: '🔭' },
                { word: 'keyboard', emoji: '⌨️' },
                { word: 'notebook', emoji: '📓' },
                { word: 'calendar', emoji: '📅' },
                { word: 'envelope', emoji: '✉️' },
                { word: 'magazine', emoji: '📰' }
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
let startTime = 0;
let currentLanguage = 'en';
let subscriptionType = 'free'; // free, premium, school

// Advanced features
const rewardSystem = new RewardSystem();
const multiLanguage = new MultiLanguageSupport();
const parentDashboard = new ParentDashboard();

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
    setupAdvancedFeatures();
    adaptiveLearning.analytics.startSession();
});

function setupAdvancedFeatures() {
    // Initialize reward system display
    updateBadgeCount();
    
    // Setup accessibility features
    accessibilityManager.applySettings();
    
    // Setup performance monitoring
    setInterval(updatePerformanceDisplay, 5000);
    
    // Setup multi-language
    const savedLanguage = localStorage.getItem('spellbloc_language') || 'en';
    currentLanguage = savedLanguage;
    multiLanguage.setLanguage(savedLanguage);
    document.getElementById('languageSelect').value = savedLanguage;
    
    // Load subscription status
    updateSubscriptionDisplay();
    
    // Debug: Log available voices for language testing
    if ('speechSynthesis' in window) {
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                multiLanguage.getAvailableVoices();
            }, { once: true });
        } else {
            multiLanguage.getAvailableVoices();
        }
    }
}

function updateBadgeCount() {
    const badgeCountElement = document.getElementById('badgeCount');
    if (badgeCountElement) {
        badgeCountElement.textContent = rewardSystem.badges.length;
    }
}

function updatePerformanceDisplay() {
    const metrics = performanceMonitor.getMetrics();
    const fpsDisplay = document.getElementById('fpsDisplay');
    const memoryDisplay = document.getElementById('memoryDisplay');
    
    if (fpsDisplay) fpsDisplay.textContent = metrics.frameRate;
    if (memoryDisplay) memoryDisplay.textContent = metrics.memoryUsage;
}

function updateSubscriptionDisplay() {
    const statusElement = document.getElementById('subscriptionStatus');
    if (statusElement) {
        statusElement.textContent = subscriptionType === 'premium' ? 'Premium Plan' : 'Free Plan';
        statusElement.className = `subscription-status ${subscriptionType}`;
    }
}

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
    const currentMode = gameModeManager.getCurrentMode();
    startTime = Date.now();
    
    // Show instructions first
    showGameInstructions();
    
    // Initialize mode-specific features
    if (currentMode.name === 'Speed Challenge') {
        document.getElementById('timer').classList.remove('hidden');
        currentMode.initializeGame(wordData[currentCategory]);
    } else {
        document.getElementById('timer').classList.add('hidden');
    }
    
    // Show story context for story mode
    if (currentMode.name === 'Story Adventure') {
        document.getElementById('storyContext').classList.remove('hidden');
    } else {
        document.getElementById('storyContext').classList.add('hidden');
    }
    
    showScreen('game');
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
    const endTime = Date.now();
    const timeToComplete = (endTime - startTime) / 1000;
    
    feedback.textContent = multiLanguage.translate('perfect') || '🎉 Perfect! Great job!';
    feedback.className = 'feedback correct';
    
    playSound('success');
    
    // Record performance for adaptive learning
    adaptiveLearning.adjustDifficulty(true, timeToComplete);
    adaptiveLearning.scheduleSpacedRepetition(currentWord, adaptiveLearning.difficultyLevel);
    
    // Update difficulty indicator
    const difficultyElement = document.getElementById('difficultyLevel');
    if (difficultyElement) {
        difficultyElement.textContent = adaptiveLearning.difficultyLevel.toFixed(1);
    }
    
    // Award stars
    const starsEarned = 3;
    totalStars += starsEarned;
    currentStarsDisplay.textContent = totalStars;
    
    // Check for achievements
    const stats = adaptiveLearning.analytics.getProgressReport();
    rewardSystem.checkAchievements(stats);
    updateBadgeCount();
    
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
    const endTime = Date.now();
    const timeToComplete = (endTime - startTime) / 1000;
    
    feedback.textContent = multiLanguage.translate('try_again') || '🤔 Try again! You can do it!';
    feedback.className = 'feedback incorrect';
    
    playSound('error');
    
    // Record performance for adaptive learning
    adaptiveLearning.adjustDifficulty(false, timeToComplete);
    
    // Update difficulty indicator
    const difficultyElement = document.getElementById('difficultyLevel');
    if (difficultyElement) {
        difficultyElement.textContent = adaptiveLearning.difficultyLevel.toFixed(1);
    }
    
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
        startTime = Date.now(); // Reset timer for next attempt
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
// Advanced Feature Functions

function showParentDashboard() {
    showScreen('dashboard');
    updateDashboardContent();
}

function updateDashboardContent() {
    const report = parentDashboard.generateProgressReport('default', 'week');
    
    // Update progress stats
    const statsContainer = document.getElementById('progressStats');
    if (statsContainer && report) {
        statsContainer.innerHTML = `
            <div class="progress-stat">
                <div class="value">${report.summary.totalSessions}</div>
                <div class="label">Sessions</div>
            </div>
            <div class="progress-stat">
                <div class="value">${report.summary.accuracy}%</div>
                <div class="label">Accuracy</div>
            </div>
            <div class="progress-stat">
                <div class="value">${report.summary.totalAttempts}</div>
                <div class="label">Words Practiced</div>
            </div>
            <div class="progress-stat">
                <div class="value">${Math.round(report.summary.averageSessionTime / 60)}m</div>
                <div class="label">Avg Session</div>
            </div>
        `;
    }
    
    // Update achievements
    const achievementsContainer = document.getElementById('recentAchievements');
    if (achievementsContainer && report) {
        achievementsContainer.innerHTML = report.achievements.map(achievement => `
            <div class="achievement-badge">
                <span class="emoji">${achievement.emoji}</span>
                <span class="name">${achievement.name}</span>
            </div>
        `).join('');
    }
    
    // Update recommendations
    const recommendationsContainer = document.getElementById('recommendations');
    if (recommendationsContainer && report) {
        recommendationsContainer.innerHTML = report.recommendations.map(rec => `
            <div class="recommendation ${rec.priority}-priority">
                ${rec.message}
            </div>
        `).join('');
    }
    
    // Update custom words
    updateCustomWordsList();
}

function addCustomWords() {
    const input = document.getElementById('customWordInput');
    const words = input.value.split(',').map(w => w.trim()).filter(w => w.length > 0);
    
    if (words.length > 0) {
        parentDashboard.addCustomWordList('Custom List', words);
        input.value = '';
        updateCustomWordsList();
    }
}

function updateCustomWordsList() {
    const container = document.getElementById('customWordsList');
    const wordLists = parentDashboard.getCustomWordLists();
    
    if (container) {
        container.innerHTML = wordLists.map(list => 
            list.words.map(word => `
                <div class="custom-word-tag">
                    ${word.word}
                    <span class="remove" onclick="removeCustomWord('${word.word}')">&times;</span>
                </div>
            `).join('')
        ).join('');
    }
}

function removeCustomWord(word) {
    // Implementation for removing custom words
    updateCustomWordsList();
}

function showHint() {
    if (subscriptionType === 'free') {
        showUpgradeModal();
        return;
    }
    
    const hintText = `The word starts with "${currentWord[0].toUpperCase()}"`;
    feedback.textContent = `💡 Hint: ${hintText}`;
    feedback.className = 'feedback hint';
    
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }, 3000);
}

function showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🌟 Upgrade to Premium</h2>
            <div class="premium-features">
                <div class="feature">✨ Unlimited hints</div>
                <div class="feature">📊 Detailed analytics</div>
                <div class="feature">🎯 Advanced game modes</div>
                <div class="feature">🌍 All languages</div>
                <div class="feature">👨‍👩‍👧‍👦 Parent dashboard</div>
            </div>
            <div class="pricing">
                <div class="price">$4.99/month</div>
                <div class="price-note">Cancel anytime</div>
            </div>
            <div class="modal-buttons">
                <button class="upgrade-now-btn">Upgrade Now</button>
                <button class="close-modal-btn">Maybe Later</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal-btn').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.upgrade-now-btn').addEventListener('click', () => {
        // Simulate upgrade process
        subscriptionType = 'premium';
        updateSubscriptionDisplay();
        modal.remove();
        
        // Show success message
        const success = document.createElement('div');
        success.className = 'upgrade-success';
        success.innerHTML = `
            <div class="success-content">
                <h2>🎉 Welcome to Premium!</h2>
                <p>You now have access to all premium features!</p>
            </div>
        `;
        document.body.appendChild(success);
        
        setTimeout(() => success.remove(), 3000);
    });
}

function loadWord() {
    const words = wordData[currentCategory];
    if (currentWordIndex >= words.length) {
        currentWordIndex = 0;
    }

    const wordObj = words[currentWordIndex];
    currentWord = wordObj.word;
    userAnswer = [];
    startTime = Date.now();

    // Update current task description
    updateCurrentTask();

    // Apply difficulty adjustment
    const adjustedWord = applyDifficultyAdjustment(wordObj);
    
    // Update UI
    wordImage.textContent = adjustedWord.emoji;
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    // Show story context for story mode
    const currentMode = gameModeManager.getCurrentMode();
    if (currentMode.name === 'Story Adventure' && adjustedWord.storyContext) {
        const storyElement = document.getElementById('storyContext');
        if (storyElement) {
            storyElement.textContent = adjustedWord.storyContext;
            storyElement.classList.remove('hidden');
        }
    }
    
    // Show phonics display
    if (currentCategory === 'vowels' || currentCategory === 'consonants') {
        const phonicsElement = document.getElementById('phonicsDisplay');
        if (phonicsElement && wordObj.sound) {
            phonicsElement.textContent = `Sound: /${wordObj.sound}/`;
            phonicsElement.classList.remove('hidden');
        }
    } else {
        document.getElementById('phonicsDisplay').classList.add('hidden');
    }
    
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
    setTimeout(() => {
        if (currentCategory === 'vowels' || currentCategory === 'consonants') {
            speakLetterSound(wordObj);
        } else {
            multiLanguage.speakInLanguage(currentWord);
        }
    }, 500);
}

function applyDifficultyAdjustment(wordObj) {
    const difficulty = adaptiveLearning.difficultyLevel;
    
    // For easier difficulty, provide more hints
    if (difficulty < 0.8) {
        return {
            ...wordObj,
            hint: `This word has ${wordObj.word.length} letters`
        };
    }
    
    // For harder difficulty, add complexity
    if (difficulty > 1.5) {
        return {
            ...wordObj,
            challenge: 'No hints available - you got this!'
        };
    }
    
    return wordObj;
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    if (screen === 'home') {
        homeScreen.classList.add('active');
    } else if (screen === 'game') {
        gameScreen.classList.add('active');
    } else if (screen === 'victory') {
        victoryScreen.classList.add('active');
    } else if (screen === 'dashboard') {
        document.getElementById('dashboardScreen').classList.add('active');
    }
    
    // End analytics session when leaving game
    if (screen !== 'game') {
        adaptiveLearning.analytics.endSession();
    }
}

// Offline functionality
window.addEventListener('beforeunload', () => {
    // Save all data before page unload
    adaptiveLearning.analytics.endSession();
    rewardSystem.saveRewards();
    parentDashboard.saveDashboardData();
    accessibilityManager.saveSettings();
});

// Auto-save every 30 seconds
setInterval(() => {
    if (offlineManager.isOnline) {
        offlineManager.saveOfflineData('spellbloc_progress', {
            totalStars,
            playerLevel,
            currentAge,
            analytics: adaptiveLearning.analytics.sessions,
            rewards: rewardSystem.badges
        });
    }
}, 30000);

// Service Worker registration with error handling
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed (this is normal for file:// protocol):', error);
    });
}
// Language Testing Functions (for debugging)
window.testLanguages = function() {
    console.log('🌍 Testing all languages...');
    multiLanguage.testAllLanguages();
};

window.checkVoices = function() {
    console.log('🎤 Checking available voices...');
    return multiLanguage.getAvailableVoices();
};

window.testLanguage = function(lang) {
    console.log(`🗣️ Testing ${lang} language...`);
    const testWords = {
        'en': 'Hello, this is English',
        'es': 'Hola, esto es español',
        'fr': 'Bonjour, c\'est français',
        'de': 'Hallo, das ist Deutsch',
        'zh': '你好，这是中文'
    };
    
    const testWord = testWords[lang] || 'Test';
    multiLanguage.speakInLanguage(testWord, lang);
};

window.switchLanguage = function(lang) {
    console.log(`🔄 Switching to ${lang}...`);
    multiLanguage.setLanguage(lang);
    document.getElementById('languageSelect').value = lang;
};

// Auto-test languages on load (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        console.log('🚀 SpellBloc Language Testing Available:');
        console.log('• testLanguages() - Test all languages');
        console.log('• testLanguage("es") - Test specific language');
        console.log('• checkVoices() - Show available voices');
        console.log('• switchLanguage("fr") - Switch language');
    }, 2000);
}
// Game Instructions and Help System

function showGameInstructions() {
    const instructionsPanel = document.getElementById('gameInstructions');
    const instructionTitle = document.getElementById('instructionTitle');
    const instructionText = document.getElementById('instructionText');
    const exampleEmoji = document.querySelector('.example-emoji');
    const exampleWord = document.querySelector('.example-word');
    
    // Customize instructions based on category
    const instructions = getInstructionsForCategory(currentCategory);
    
    instructionTitle.textContent = instructions.title;
    instructionText.textContent = instructions.text;
    exampleEmoji.textContent = instructions.emoji;
    exampleWord.textContent = instructions.word;
    
    instructionsPanel.classList.remove('hidden');
}

function getInstructionsForCategory(category) {
    const instructions = {
        'vowels': {
            title: '🔤 Learning Vowels',
            text: 'Listen to the vowel sound, then tap the correct letter!',
            emoji: '🅰️',
            word: 'A'
        },
        'vowel_words': {
            title: '📝 Vowel Words',
            text: 'Listen to the short word, then spell it with the letters below!',
            emoji: '📍',
            word: 'A-T'
        },
        'consonants': {
            title: '🔤 Learning Consonants',
            text: 'Listen to the consonant sound, then tap the correct letter!',
            emoji: '🅱️',
            word: 'B'
        },
        'consonant_words': {
            title: '📝 Consonant Words',
            text: 'Listen to the short word, then spell it with the letters below!',
            emoji: '👥',
            word: 'W-E'
        },
        'animals': {
            title: '🐾 Animal Names',
            text: 'Look at the animal emoji, listen to its name, then spell the word!',
            emoji: '🐱',
            word: 'C-A-T'
        },
        'colors': {
            title: '🌈 Color Names',
            text: 'Look at the color emoji, listen to the color name, then spell it!',
            emoji: '🔴',
            word: 'R-E-D'
        },
        'fruits': {
            title: '🍎 Fruit Names',
            text: 'Look at the fruit emoji, listen to its name, then spell the word!',
            emoji: '🍎',
            word: 'A-P-P-L-E'
        },
        'objects': {
            title: '📦 Object Names',
            text: 'Look at the object emoji, listen to its name, then spell the word!',
            emoji: '⚽',
            word: 'B-A-L-L'
        }
    };
    
    return instructions[category] || {
        title: '📝 How to Play',
        text: 'Look at the emoji, listen to the word, then tap the letters to spell it!',
        emoji: '🎮',
        word: 'P-L-A-Y'
    };
}

function hideGameInstructions() {
    const instructionsPanel = document.getElementById('gameInstructions');
    instructionsPanel.classList.add('hidden');
    loadWord(); // Start the actual game
}

function updateCurrentTask() {
    const taskElement = document.getElementById('currentTask');
    const taskDescription = document.getElementById('taskDescription');
    
    if (!taskElement || !taskDescription) return;
    
    // Update task description based on category
    const taskTexts = {
        'vowels': 'Listen and tap the vowel letter you hear! 🔤',
        'vowel_words': 'Listen and spell the short word! 📝',
        'consonants': 'Listen and tap the consonant letter you hear! 🔤',
        'consonant_words': 'Listen and spell the short word! 📝',
        'animals': 'Look at the animal and spell its name! 🐾',
        'colors': 'Look at the color and spell its name! 🌈',
        'fruits': 'Look at the fruit and spell its name! 🍎',
        'objects': 'Look at the object and spell its name! 📦'
    };
    
    const taskText = taskTexts[currentCategory] || 'Spell the word you hear! 📝';
    taskDescription.textContent = taskText;
    
    // Update task styling based on category
    taskElement.className = `current-task task-${currentCategory}`;
}

function showHelp() {
    const helpTexts = {
        'vowels': 'Vowels are the letters A, E, I, O, U. Listen carefully to the sound!',
        'vowel_words': 'These are short words that use vowels. Listen to the whole word!',
        'consonants': 'Consonants are all the other letters (B, C, D, etc.). Listen to the sound!',
        'consonant_words': 'These are short words that use consonants. Listen to the whole word!',
        'animals': 'Spell the name of the animal you see. For example: 🐱 = CAT',
        'colors': 'Spell the name of the color you see. For example: 🔴 = RED',
        'fruits': 'Spell the name of the fruit you see. For example: 🍎 = APPLE',
        'objects': 'Spell the name of the object you see. For example: ⚽ = BALL'
    };
    
    const helpText = helpTexts[currentCategory] || 'Listen to the word and spell it using the letters below!';
    
    showTooltip(helpText, 3000);
}

function showTooltip(text, duration = 2000) {
    // Remove existing tooltip
    const existingTooltip = document.querySelector('.help-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
    
    // Create new tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    // Remove tooltip after duration
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.remove();
        }
    }, duration);
}

// Enhanced event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', () => {
        hideGameInstructions();
    });
    
    // Help button
    document.getElementById('helpBtn').addEventListener('click', () => {
        showHelp();
    });
    
    // Skip instructions if user clicks outside
    document.getElementById('gameInstructions').addEventListener('click', (e) => {
        if (e.target.id === 'gameInstructions') {
            hideGameInstructions();
        }
    });
});