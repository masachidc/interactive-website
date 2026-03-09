// --- Configuration ---
const quizData = [
    {
        id: 1,
        text: "Name this building.",
        image: "01.jpg",
        type: "single", 
        options: ["FIU Mango", "Wellness Center", "AHC 1", "SIPA II"],
        correct: ["FIU Mango"]
    },
    {
        id: 2,
        text: "Select the TWO buildings shown.",
        image: "02.jpg",
        type: "multi",
        requiredSelections: 2, 
        options: ["Lapis", "The One", "109 Towers", "Terazul"],
        correct: ["Lapis", "109 Towers"]
    },
    {
        id: 3,
        text: "Identify this building.",
        image: "03.jpg",
        type: "single",
        options: ["Viertes Haus", "Ryder Business Building", "SIPA I", "Deuxieme Maison"],
        correct: ["Ryder Business Building"]
    },
    {
        id: 4,
        text: "Where is this pond located?",
        image: "04.jpg",
        type: "single",
        options: ["Biscayne Bay Campus", "Engineering Center", "MMC Campus", "FIU DC"],
        correct: ["MMC Campus"]
    },
    {
        id: 5,
        text: "Name the garage.",
        image: "05.jpg",
        type: "single",
        options: ["PG6", "PG4", "PG3", "PG5"],
        correct: ["PG5"]
    }
];

// --- State ---
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let offenses = 0;
let userSelections = [];
let isPaused = false;
let isLocked = false;
let timerInterval;
let timeLeftDeci = 100; // 100 * 100ms = 10 seconds
const MAX_TIME = 100;
let isMobile = false;

// --- UI References ---
let ui = {};
let views = {};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if mobile
    isMobile = window.innerWidth <= 900;
    
    // Handle orientation changes
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 900;
        
        // Refresh layout if switching between mobile/desktop
        if (wasMobile !== isMobile) {
            updateLayout();
        }
    });

    // Safe Reference Grab
    ui = {
        qText: document.getElementById('qText'),
        qImage: document.getElementById('qImage'),
        answersGrid: document.getElementById('answersGrid'),
        timerText: document.getElementById('timerText'),
        timerBar: document.getElementById('timerBar'),
        currentScore: document.getElementById('currentScore'),
        qCount: document.getElementById('qCount'),
        progressFill: document.getElementById('overallProgress'),
        warningModal: document.getElementById('warningModal'),
        statusText: document.getElementById('systemStatus')
    };

    views = {
        intro: document.getElementById('introView'),
        question: document.getElementById('questionView'),
        results: document.getElementById('resultsView')
    };

    // Event Listeners with both click and touch support
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
        startBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            startQuiz();
        });
    }

    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', resumeQuiz);
        resumeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            resumeQuiz();
        });
    }

    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => window.location.href = '../index.html');
        homeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            window.location.href = '../index.html';
        });
    }

    // Anti-Cheat Setup (less aggressive on mobile)
    if (!isMobile) {
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleCheatTrigger);
    }

    // Prevent zoom on double-tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

// --- Core Logic ---

function updateLayout() {
    // Force reflow if needed when switching between layouts
    if (ui.qImage && ui.qImage.src) {
        ui.qImage.style.display = 'none';
        setTimeout(() => {
            ui.qImage.style.display = '';
        }, 10);
    }
}

function startQuiz() {
    score = 0;
    currentIndex = 0;
    offenses = 0;
    isPaused = false;
    isLocked = false;
    
    currentQuestions = shuffleArray([...quizData]);
    
    updateScoreUI();
    showView('question');
    
    // Small delay to ensure layout is ready
    setTimeout(() => {
        loadQuestion();
        // Scroll to top on mobile
        if (isMobile) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 100);
}

function loadQuestion() {
    if (currentIndex >= currentQuestions.length) {
        endQuiz();
        return;
    }

    const q = currentQuestions[currentIndex];
    userSelections = [];
    isLocked = false;
    
    // UI Update
    ui.qText.textContent = q.text;
    ui.qImage.src = q.image;
    ui.qImage.alt = q.text;
    ui.qCount.textContent = currentIndex + 1;
    ui.progressFill.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;
    
    // Generate Buttons
    ui.answersGrid.innerHTML = '';
    const shuffledOptions = shuffleArray([...q.options]);
    
    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.setAttribute('type', 'button');
        
        // Match CSS classes for shapes
        const indicatorClass = q.type === 'multi' ? 'checkbox-square' : 'radio-circle';
        btn.innerHTML = `<span class="${indicatorClass}"></span> ${opt}`;
        
        // Support both click and touch
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleInput(btn, opt, q);
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleInput(btn, opt, q);
        });
        
        ui.answersGrid.appendChild(btn);
    });

    // Scroll to question on mobile
    if (isMobile) {
        setTimeout(() => {
            const questionView = document.getElementById('questionView');
            if (questionView) {
                questionView.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    startTimer();
}

function handleInput(btn, option, qData) {
    if (isLocked || isPaused) return;

    if (qData.type === 'single') {
        stopTimer();
        isLocked = true;
        
        // Remove previous selections
        document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const isCorrect = qData.correct.includes(option);
        finalizeQuestion(isCorrect, [btn]);
        
    } else if (qData.type === 'multi') {
        // Toggle Logic
        if (userSelections.includes(option)) {
            userSelections = userSelections.filter(s => s !== option);
            btn.classList.remove('selected');
        } else {
            if (userSelections.length < qData.requiredSelections) {
                userSelections.push(option);
                btn.classList.add('selected');
            }
        }

        // Auto-Submit Check
        if (userSelections.length >= qData.requiredSelections) {
            stopTimer();
            isLocked = true;
            
            const correctSet = new Set(qData.correct);
            const userSet = new Set(userSelections);
            const isCorrect = setsAreEqual(correctSet, userSet);
            
            finalizeQuestion(isCorrect);
        }
    }
}

function finalizeQuestion(isCorrect, userBtns = []) {
    const qData = currentQuestions[currentIndex];
    
    if (isCorrect) {
        // Scoring: Base 100 + Speed Bonus (0-50)
        const timeBonus = Math.floor((timeLeftDeci / MAX_TIME) * 50);
        score += (100 + timeBonus);
        
        // Highlight Correct
        document.querySelectorAll('.answer-btn').forEach(b => {
            const text = b.textContent.trim();
            if (userSelections.includes(text) || b.classList.contains('selected') || userBtns.includes(b)) {
                b.classList.add('correct');
            }
        });
    } else {
        // Highlight Wrong & Correct
        document.querySelectorAll('.answer-btn').forEach(b => {
            const text = b.textContent.trim();
            if (qData.correct.includes(text)) {
                b.classList.add('correct');
            } else if (userSelections.includes(text) || userBtns.includes(b)) {
                b.classList.add('wrong');
            }
        });
    }
    
    updateScoreUI();
    
    setTimeout(() => {
        currentIndex++;
        loadQuestion();
    }, 1500);
}

// --- Timer ---
function startTimer() {
    clearInterval(timerInterval);
    timeLeftDeci = MAX_TIME;
    updateTimerVisuals();
    
    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeftDeci--;
            updateTimerVisuals();
            if (timeLeftDeci <= 0) handleTimeout();
        }
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function handleTimeout() {
    stopTimer();
    isLocked = true;
    ui.qText.textContent = "Time's Up!";
    
    const qData = currentQuestions[currentIndex];
    document.querySelectorAll('.answer-btn').forEach(b => {
        const text = b.textContent.trim();
        if (qData.correct.includes(text)) b.classList.add('correct');
        b.style.opacity = '0.5';
        b.style.pointerEvents = 'none';
    });
    
    setTimeout(() => {
        currentIndex++;
        loadQuestion();
    }, 1500);
}

function updateTimerVisuals() {
    const seconds = Math.ceil(timeLeftDeci / 10);
    ui.timerText.textContent = seconds;
    ui.timerBar.style.width = `${(timeLeftDeci / MAX_TIME) * 100}%`;
    
    if (timeLeftDeci < 30) {
        ui.timerBar.style.backgroundColor = '#ef4444';
        ui.timerText.style.color = '#ef4444';
    } else {
        ui.timerBar.style.backgroundColor = '#B6862C';
        ui.timerText.style.color = '#ef4444';
    }
}

// --- Anti-Cheat ---
function handleVisibilityChange() {
    if (document.hidden && views.question && !views.question.classList.contains('hidden')) {
        handleCheatTrigger();
    }
}

function handleCheatTrigger() {
    if (isPaused || isLocked || isMobile) return;
    
    isPaused = true;
    offenses++;
    
    ui.statusText.textContent = "🔴 Warning!";
    ui.warningModal.classList.remove('hidden');
}

function resumeQuiz() {
    ui.warningModal.classList.add('hidden');
    isPaused = false;
    ui.statusText.textContent = "🟢 Active";
}

// --- Utilities ---
function showView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    if (views[viewName]) {
        views[viewName].classList.remove('hidden');
    }
}

function updateScoreUI() {
    if (ui.currentScore) ui.currentScore.textContent = score;
}

function endQuiz() {
    stopTimer();
    showView('results');
    
    // Scroll to top on mobile
    if (isMobile) {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }
    
    document.getElementById('finalScoreDisplay').textContent = score;
    
    // Stats calculation
    const fairPlay = Math.max(0, 100 - (offenses * 20));
    const totalPossibleBase = currentQuestions.length * 100;
    
    // Speed bonus indication
    const avgSpeed = score > totalPossibleBase ? "Yes" : "Limited";
    
    document.getElementById('speedStat').textContent = avgSpeed;
    document.getElementById('fairPlayStat').textContent = `${fairPlay}%`;
    
    let msg = "Nice Try!";
    if (score > 600) msg = "FIU Expert Status! 🏆";
    else if (score > 450) msg = "Great Job!";
    else if (score > 300) msg = "Solid Performance!";
    
    document.getElementById('finalMessage').textContent = msg;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function setsAreEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const item of a) if (!b.has(item)) return false;
    return true;
}