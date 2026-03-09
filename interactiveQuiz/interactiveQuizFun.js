const correctAnswers = {
    1: ["FIU Mango"],
    2: ["Lapis", "109 Towers"],
    3: ["Ryder Business Building"],
    4: ["MMC Campus"],
    5: ["PG5"]
};
 
let userAnswers = { 1: [], 2: [], 3: [], 4: [], 5: [] };
let timerInterval;
let secondsElapsed = 0;
 
// --- Timer Functionality ---
function startTimer() {
    if(timerInterval) clearInterval(timerInterval);
    secondsElapsed = 0;
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}
 
function updateTimerDisplay() {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    const formatted = 
        (minutes < 10 ? "0" + minutes : minutes) + ":" + 
        (seconds < 10 ? "0" + seconds : seconds);
    
    document.getElementById('timerDisplay').textContent = formatted;
}
 
function stopTimer() {
    clearInterval(timerInterval);
}
 
function quitQuiz() {
    if(confirm("Are you sure you want to quit? This will reset your progress.")) {
        retakeQuiz();
    }
}
 
// --- Answering Logic ---
function setupAnswerButtons() {
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questionNum = parseInt(this.dataset.question);
            const answer = this.dataset.answer;
            const isCheckbox = this.classList.contains('checkbox-btn');
            
            if (isCheckbox) {
                handleCheckboxAnswer(questionNum, answer, this);
            } else {
                handleRadioAnswer(questionNum, answer, this);
            }
            updateProgress();
        });
    });
}
 
function handleRadioAnswer(questionNum, answer, button) {
    const parent = button.closest('.answers');
    parent.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
    
    button.classList.add('selected');
    userAnswers[questionNum] = [answer];
}
 
function handleCheckboxAnswer(questionNum, answer, button) {
    button.classList.toggle('selected');
    if (button.classList.contains('selected')) {
        if (!userAnswers[questionNum].includes(answer)) userAnswers[questionNum].push(answer);
    } else {
        userAnswers[questionNum] = userAnswers[questionNum].filter(a => a !== answer);
    }
}
 
function updateProgress() {
    let answeredCount = 0;
    for (let i = 1; i <= 5; i++) {
        if (userAnswers[i].length > 0) answeredCount++;
    }
    
    document.getElementById('answeredCount').textContent = answeredCount;
    const progressPercent = (answeredCount / 5) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';
}
 
// --- Submission Logic ---
function submitQuiz() {
    let allAnswered = true;
    for (let i = 1; i <= 5; i++) {
        if (userAnswers[i].length === 0) {
            allAnswered = false;
            break;
        }
    }
    
    if (!allAnswered) {
        alert('Please answer all questions before submitting!');
        return;
    }
    
    stopTimer();
    
    let score = 0;
    let resultsHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const correct = correctAnswers[i].sort();
        const user = userAnswers[i].sort();
        const isCorrect = JSON.stringify(user) === JSON.stringify(correct);
        
        if (isCorrect) score++;
        
        // Inline styles to ensure visibility on white background
        resultsHTML += `
            <div style="margin-bottom: 15px; padding: 15px; background: #f3f4f6; border-radius: 8px; border-left: 5px solid ${isCorrect ? '#10b981' : '#ef4444'};">
                <strong style="color: ${isCorrect ? '#059669' : '#dc2626'}; font-size: 1rem; display:block; margin-bottom:5px;">
                    Question ${i}: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </strong>
                <span style="color:#374151; font-size: 0.95rem;">Your answer: <strong>${user.join(', ') || 'None'}</strong></span><br>
                ${!isCorrect ? `<span style="color:#4b5563; font-size: 0.9rem;">Correct answer: <strong>${correct.join(', ')}</strong></span>` : ''}
            </div>
        `;
    }
    
    // Score message
    let message = '';
    if (score === 5) {
        message = "Perfect! You're a true FIU expert! 🏆";
    } else if (score >= 4) {
        message = "Excellent work! You know your campus well! 🌟";
    } else if (score >= 3) {
        message = "Good job! You've got solid FIU knowledge! 👍";
    } else if (score >= 2) {
        message = "Not bad! Keep exploring the campus! 🎓";
    } else {
        message = "Time to explore FIU more! Try again! 📚";
    }
    
    // Populate Results
    document.getElementById('scoreNumber').textContent = `${score} / 5`;
    document.getElementById('scoreMessage').textContent = message;
    document.getElementById('resultsDetails').innerHTML = resultsHTML;
    
    // Show results view
    document.getElementById('questionsView').classList.add('hidden');
    document.getElementById('resultsView').classList.remove('hidden');
    
    // Reset scroll to top
    document.querySelector('.left-scroll-panel').scrollTop = 0;
}
 
function retakeQuiz() {
    // Reset data
    userAnswers = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
    
    updateProgress();
    
    // Show questions view
    document.getElementById('resultsView').classList.add('hidden');
    document.getElementById('questionsView').classList.remove('hidden');
    
    // Reset scroll
    document.querySelector('.left-scroll-panel').scrollTop = 0;
    
    // Restart timer
    startTimer();
}

// Initialize quiz - SINGLE DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    setupAnswerButtons();
    updateProgress();
    startTimer();
    
    // Submit button
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
    
    // Retake button
    document.getElementById('retakeBtn').addEventListener('click', retakeQuiz);
    
    // Quit button
    document.getElementById('quitBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
            window.location.href = '../index.html';
        }
    });
    
    // Navigation links confirmation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            if (confirm('Are you sure you want to leave? Your quiz progress will be lost.')) {
                window.location.href = href;
            }
        });
    });
});