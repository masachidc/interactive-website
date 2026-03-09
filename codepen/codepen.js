window.onload = function () {
    var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
        'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
        't', 'u', 'v', 'w', 'x', 'y', 'z'];
    
    var categories;
    var chosenCategory;
    var word;
    var guess;
    var guesses = [];
    var lives;
    var counter;
    var space;

    var showLives = document.getElementById("mylives");
    var catagoryName = document.getElementById("catagoryName");
    var showClue = document.getElementById("clue");
    var myButtons, letters, list, correct, wordHolder;
    var myStickman, context;

    var buttons = function () {
        myButtons = document.getElementById('buttons');
        letters = document.createElement('ul');
        letters.id = 'alphabet';

        for (var i = 0; i < alphabet.length; i++) {
            list = document.createElement('li');
            list.innerHTML = alphabet[i];
            list.onclick = function () {
                var guess = (this.innerHTML);
                this.setAttribute("class", "active");
                this.onclick = null;
                var found = false;
                for (var i = 0; i < word.length; i++) {
                    if (word[i] === guess) {
                        guesses[i].innerHTML = guess;
                        counter += 1;
                        found = true;
                    }
                }
                if (!found) {
                    lives -= 1;
                    comments();
                    animate();
                } else {
                    comments();
                }
            };
            letters.appendChild(list);
        }
        myButtons.appendChild(letters);
    };

    var selectCat = function () {
        if (chosenCategory === categories[0]) {
            catagoryName.innerHTML = "Premier League Teams";
        } else if (chosenCategory === categories[1]) {
            catagoryName.innerHTML = "Movies";
        } else if (chosenCategory === categories[2]) {
            catagoryName.innerHTML = "Cities";
        }
    };

    var result = function () {
        wordHolder = document.getElementById('hold');
        correct = document.createElement('ul');
        correct.setAttribute('id', 'my-word');

        for (var i = 0; i < word.length; i++) {
            guess = document.createElement('li');
            guess.setAttribute('class', 'guess');
            if (word[i] === "-") {
                guess.innerHTML = "-";
                space = 1;
            } else {
                guess.innerHTML = "_";
            }
            guesses.push(guess);
            correct.appendChild(guess);
        }
        wordHolder.appendChild(correct);
    };

    var comments = function () {
        showLives.innerHTML = "Lives: " + lives;
        showLives.style.color = "#ffffff";
        if (lives < 1) {
            showLives.innerHTML = "Game Over";
            showLives.className = "game-status lose";
            document.getElementById('alphabet').style.pointerEvents = 'none';
        }
        if (counter + space === guesses.length && lives > 0) {
            showLives.innerHTML = "You Win!";
            showLives.className = "game-status win";
            document.getElementById('alphabet').style.pointerEvents = 'none';
        }
    };

    var animate = function () {
        var drawMe = lives;
        drawArray[drawMe]();
    };

    var canvas = function () {
        myStickman = document.getElementById("stickman");
        context = myStickman.getContext('2d');
        context.beginPath();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 3;
    };

    var head = function () {
        myStickman = document.getElementById("stickman");
        context = myStickman.getContext('2d');
        context.beginPath();
        context.arc(200, 80, 30, 0, Math.PI * 2, true);
        context.stroke();
    };

    var draw = function (pathFromx, pathFromy, pathTox, pathToy) {
        context.moveTo(pathFromx, pathFromy);
        context.lineTo(pathTox, pathToy);
        context.stroke();
    };

    var frame1 = function () { draw(50, 350, 350, 350); };
    var frame2 = function () { draw(100, 350, 100, 50); };
    var frame3 = function () { draw(100, 50, 250, 50); };
    var frame4 = function () { draw(200, 50, 200, 80); };
    var torso = function () { draw(200, 110, 200, 200); };
    var rightArm = function () { draw(200, 140, 250, 180); };
    var leftArm = function () { draw(200, 140, 150, 180); };
    var rightLeg = function () { draw(200, 200, 250, 280); };
    var leftLeg = function () { draw(200, 200, 150, 280); };

    var drawArray = [rightLeg, leftLeg, rightArm, leftArm, torso, head, frame4, frame3, frame2, frame1];

    var play = function () {
        categories = [
            ["everton", "liverpool", "swansea", "chelsea", "hull", "manchester-city", "newcastle-united"],
            ["alien", "dirty-harry", "gladiator", "finding-nemo", "jaws"],
            ["manchester", "milan", "madrid", "amsterdam", "prague"]
        ];

        chosenCategory = categories[Math.floor(Math.random() * categories.length)];
        word = chosenCategory[Math.floor(Math.random() * chosenCategory.length)];
        word = word.replace(/\s/g, "-");
        
        buttons();
        guesses = [];
        lives = 10;
        counter = 0;
        space = 0;
        result();
        comments();
        selectCat();
        canvas();
        showLives.className = "";
    };

    play();

    document.getElementById('hint').onclick = function () {
        var hints = [
            ["Based in Merseyside", "Based in Merseyside", "First Welsh team to reach the Premier League", "Owned by a Russian Billionaire", "Once managed by Phil Brown", "2013 FA Cup runners up", "Gazza's first club"],
            ["Science-Fiction horror film", "1971 American action film", "Historical drama", "Animated Fish", "Giant great white shark"],
            ["Northern city in the UK", "Home of AC and Inter", "Spanish capital", "Netherlands capital", "Czech Republic capital"]
        ];

        var categoryIndex = categories.indexOf(chosenCategory);
        var hintIndex = chosenCategory.indexOf(word);
        showClue.innerHTML = "Clue: " + hints[categoryIndex][hintIndex];
    };

    document.getElementById('reset').onclick = function () {
        if (correct) correct.parentNode.removeChild(correct);
        if (letters) letters.parentNode.removeChild(letters);
        showClue.innerHTML = "Click 'Hint' for a clue";
        context.clearRect(0, 0, 400, 400);
        play();
    };
};