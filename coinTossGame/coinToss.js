// Game variables
let wins = 0;
let losses = 0;
let total = 0;

// Get DOM elements
const coin = document.getElementById('coin');
const headsBtn = document.getElementById('headsBtn');
const tailsBtn = document.getElementById('tailsBtn');
const resultMessage = document.getElementById('resultMessage');
const winsDisplay = document.getElementById('wins');
const lossesDisplay = document.getElementById('losses');
const totalDisplay = document.getElementById('total');
const resetBtn = document.getElementById('resetBtn');

/**
 * Flips the coin and determines win/loss
 * @param {string} playerChoice - Either 'heads' or 'tails'
 */
function flipCoin(playerChoice) {
    // Disable buttons during flip
    headsBtn.disabled = true;
    tailsBtn.disabled = true;

    // Clear previous result
    resultMessage.innerHTML = '';

    // Add flipping animation
    coin.classList.add('flipping');
    coin.textContent = '';

    // Simulate coin flip
    setTimeout(() => {
        // Random result: 0 for heads, 1 for tails
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        
        // Display result
        coin.textContent = result === 'heads' ? 'H' : 'T';
        coin.classList.remove('flipping');

        // Check if player won
        const won = playerChoice === result;
        
        // Update scores
        total++;
        if (won) {
            wins++;
        } else {
            losses++;
        }

        // Update display
        updateScoreDisplay();

        // Show result message
        displayResult(won, result);

        // Re-enable buttons
        headsBtn.disabled = false;
        tailsBtn.disabled = false;
    }, 1000);
}

/**
 * Updates the score display
 */
function updateScoreDisplay() {
    winsDisplay.textContent = wins;
    lossesDisplay.textContent = losses;
    totalDisplay.textContent = total;
}

/**
 * Displays the result message
 * @param {boolean} won - Whether the player won
 * @param {string} result - The coin flip result
 */
function displayResult(won, result) {
    const resultText = document.createElement('div');
    resultText.className = `result-text ${won ? 'win' : 'lose'}`;
    resultText.textContent = won 
        ? `🎉 You Win! It was ${result}!` 
        : `😔 You Lose! It was ${result}.`;
    resultMessage.appendChild(resultText);
}

/**
 * Resets all scores and game state
 */
function resetScore() {
    wins = 0;
    losses = 0;
    total = 0;
    winsDisplay.textContent = '0';
    lossesDisplay.textContent = '0';
    totalDisplay.textContent = '0';
    resultMessage.innerHTML = '';
    coin.textContent = '?';
}

// Event listeners
headsBtn.addEventListener('click', () => flipCoin('heads'));
tailsBtn.addEventListener('click', () => flipCoin('tails'));
resetBtn.addEventListener('click', resetScore);