
////////////////////////// DEFINING GLOBALS //////////////////////////

let myKeyboard = input.Keyboard();
let previousTime = performance.now();

let canvasB = null;
let contextB = null;
let canvasF = null;
let contextF = null;

const COORD_SIZE_X = 1024;
const COORD_SIZE_Y = 600;

///// Terrain /////

let numLandingPads = 2;
let lengthOfLandingPad = 100;

const MAX_HEIGHT_TERRAIN = COORD_SIZE_Y * (2/3);
const MIN_HEIGHT_TERRAIN = COORD_SIZE_Y * (19/20);
const START_HEIGHT = COORD_SIZE_Y * (2/3);
const NUM_DIVISIONS = 4;
const MARGIN_BUFFER = 150;

const TEXT_DISTANCE_FROM_EDGE = 225;

let terrain = [];
let landingPads = [];

///// Space Ship /////

let spaceShipSrc = "";
let spaceShip = "";
let startX = COORD_SIZE_X / 2;
let startY = COORD_SIZE_Y * (1/10);
let startFuel = 1000;
let rotationRate = Math.PI / 3000;
let fuelRate = 0.1;
let startingSpeed = 0.1;
let tempSpeed = 0;

let landedSafely = false;
let firstWin = false;

///// Audio /////

let gameMusicSrc = 'Audio/StellarEngine.mp3';
let gameMusic = new Audio(gameMusicSrc);
gameMusic.volume = 0.3;

let launchSound = new Audio('Audio/Cave8.ogg');
let menuClickSound = new Audio('Audio/click.ogg');

let thrustSound1 = new Audio('Audio/Campfire_crackle3.ogg');
let thrustSound2 = new Audio('Audio/Furnace_fire_crackle2.ogg');
let crashSound = new Audio('Audio/ChunkyExplosion.mp3');
let landingSound = new Audio('Audio/square_partyjoin.ogg');

///// Particle Systems /////

let imageFire = new Image();
imageFire.src = 'assets/fire.png';
let exhaustSystem = "";

let imageDeath = new Image();
imageDeath.src = 'assets/smoke.png';
let deathSystem = "";
let finishSequence = false;
let currentNumber = 3;
let finishCountdown = false;

///// Misc. /////

let score = 0;
let timeLeft = 0;


////////////////////////// GENERATING TERRAIN //////////////////////////

function getRandomNumber(lowerBound, upperBound) {
    return Math.random() * (upperBound - lowerBound) + lowerBound;
}

function generateTerrain() {
    terrain = [];
    landingPads = [];

    if (numLandingPads === 2) {
        let x1 = getRandomNumber(MARGIN_BUFFER, COORD_SIZE_X / 2 - lengthOfLandingPad);
        let y1 = getRandomNumber(MIN_HEIGHT_TERRAIN, MAX_HEIGHT_TERRAIN);
        landingPads.push({
            left: {x: x1, y: y1},
            right: {x: x1 + lengthOfLandingPad, y: y1}
        });

        let x2 = getRandomNumber(COORD_SIZE_X / 2 + 50, COORD_SIZE_X - lengthOfLandingPad - MARGIN_BUFFER);
        let y2 = getRandomNumber(MIN_HEIGHT_TERRAIN, MAX_HEIGHT_TERRAIN);
        landingPads.push({
            left: {x: x2, y: y2},
            right: {x: x2 + lengthOfLandingPad, y: y2}
        });

        terrain.push({
            left: {x: 0, y: START_HEIGHT},
            right: {x: x1, y: y1}
        });
        terrain.push({
            left: {x: x1 +lengthOfLandingPad, y: y1},
            right: {x: x2, y: y2}
        });
        terrain.push({
            left: {x: x2 + lengthOfLandingPad, y: y2},
            right: {x: COORD_SIZE_X, y: START_HEIGHT}
        });
    }
    else if (numLandingPads === 1) {
        let x = getRandomNumber(MARGIN_BUFFER, COORD_SIZE_X - lengthOfLandingPad - MARGIN_BUFFER);
        let y = getRandomNumber(MIN_HEIGHT_TERRAIN, MAX_HEIGHT_TERRAIN);
        landingPads.push({
            left: {x: x, y: y},
            right: {x: x + lengthOfLandingPad, y: y}
        });

        terrain.push({
            left: {x: 0, y: START_HEIGHT},
            right: {x: x, y: y}
        });
        terrain.push({
            left: {x: x + lengthOfLandingPad, y: y},
            right: {x: COORD_SIZE_X, y: START_HEIGHT}
        });
    }

    for (let i = 0; i < NUM_DIVISIONS; i++) {
        let tempTerrain = [];
        for (let j = 0; j < terrain.length; j++) {
            let line = terrain[j];
            let newX = (line.right.x - line.left.x) / 2 + line.left.x;
            let newY = getRandomNumber(MIN_HEIGHT_TERRAIN, MAX_HEIGHT_TERRAIN);
            let lineHalf1 = {
                left: {x: line.left.x, y: line.left.y},
                right: {x: newX, y: newY}
            };
            tempTerrain.push(lineHalf1);
            let lineHalf2 = {
                left: {x: newX, y: newY},
                right: {x: line.right.x, y: line.right.y}
            };
            tempTerrain.push(lineHalf2);
        }
        terrain = tempTerrain;
    }
}


////////////////////////// RENDERING TERRAIN //////////////////////////

function fillBelowLine(line) {
    contextB.strokeStyle = 'rgb(0, 0, 0)';
    contextB.beginPath();
    contextB.moveTo(line.left.x, line.left.y);
    contextB.lineTo(line.right.x, line.right.y);
    contextB.lineTo(line.right.x, COORD_SIZE_Y);
    contextB.lineTo(line.left.x, COORD_SIZE_Y);
    contextB.closePath();
    contextB.fill();
}

function drawLine(line, color) {
    contextB.strokeStyle = color;
    contextB.lineWidth = 2;
    contextB.beginPath();
    contextB.moveTo(line.left.x, line.left.y);
    contextB.lineTo(line.right.x, line.right.y);
    contextB.stroke();
}

function renderTerrain() {
    for (let i = 0; i < terrain.length; i++) {
        let color = 'rgb(255, 255, 255)';
        fillBelowLine(terrain[i]);
        drawLine(terrain[i], color);
    }
    for (let i = 0; i < landingPads.length; i++) {
        let color = 'rgb(255,69,0)';
        fillBelowLine(landingPads[i]);
        drawLine(landingPads[i], color);
    }

    contextB.strokeStyle = 'rgb(0, 0, 0)';
    contextB.lineWidth = 6;
    contextB.beginPath();
    contextB.moveTo(0, 0);
    contextB.lineTo(COORD_SIZE_X - 1, 0);
    contextB.lineTo(COORD_SIZE_X - 1, COORD_SIZE_Y - 1);
    contextB.lineTo(0, COORD_SIZE_Y - 1);
    contextB.closePath();
    contextB.strokeStyle = 'rgb(0, 0, 0)';
    contextB.stroke();
}


////////////////////////// MAKING SPACESHIP w/ MOVEMENT FUNCTIONS //////////////////////////

function makeSpaceShip(spec) {
    let that = {};

    that.image = new Image();
    that.ready = false;

    that.image.onload = function() {
        if (that.image.width >= that.image.height) {
            let aspectRatio = that.image.width / that.image.height;
            that.width = spec.width * aspectRatio;
            that.height = spec.height;
        }
        else {
            let aspectRatio = that.image.height / that.image.width;
            that.width = spec.width;
            that.height = spec.height * aspectRatio;
        }

        that.exhaust = {x: 0, y:0};
        that.exhaust.x = spec.center.x;
        that.radius = that.height/2;
        that.exhaust.y = spec.center.y + that.radius;

        that.hitBox = {
            center: {x: spec.center.x, y: spec.center.y},
            radius: that.height/2
        };

        that.ready = true;
    };

    that.image.src = spec.imageSrc;
    that.center = spec.center;
    that.rotation = Math.PI / 2;
    that.speed = spec.speed;
    that.level = -that.rotation * 180 / Math.PI;
    that.fuel = spec.startingFuel;
    that.accelerationRate = 0;
    that.nose = {x: 0, y:0};
    that.tail = {x: 0, y:0};

    that.useJets = (elapsedTime) => {
        if (that.fuel > 0) {
            thrustSound1.play();
            thrustSound2.play();
            that.fuel -= (elapsedTime * spec.fuelConsumptionRate);
            if (that.accelerationRate > 0) {
                that.accelerationRate = 0;
            }
            that.center.x += that.level * 0.005 * that.accelerationRate;
            that.accelerationRate -= (elapsedTime**0.001);
            exhaustSystem.isCreateNewParticles = true;
        }
    };

    that.rotateLeft = (elapsedTime) => {
        if (that.rotation > -1 * Math.PI / 2 + 0.5) {
            that.rotation -= (elapsedTime * spec.rotateRate);
            that.level = -that.rotation * 180 / Math.PI;
        }
    };

    that.rotateRight = (elapsedTime) => {
        if (that.rotation <  Math.PI / 2 - 0.5) {
            that.rotation += (elapsedTime * spec.rotateRate);
            that.level = -that.rotation * 180 / Math.PI;
        }
    };

    return that;
}


////////////////////////// BEGINNING //////////////////////////

function initialize() {
    setGlobals();
    getShipSrc();
    generateTerrain();

    spaceShip = makeSpaceShip({
        imageSrc: spaceShipSrc,
        center: {x: startX, y:startY},
        width: 40,
        height: 40,
        startingFuel: startFuel,
        fuelConsumptionRate: fuelRate,
        rotation: 0,
        rotateRate: rotationRate,
        speed: startingSpeed,
        isThrusting: false
    });

    exhaustSystem = ParticleSystem({
        image: imageFire,
        center: {x: 0, y: 0},
        size: {mean: 10, stdev: 3},
        speed: { mean: 0, stdev: 0.2},
        lifetime: { mean: 1000, stdev: 250},
        range: {start: -Math.PI, end: Math.PI},
        isCreateNewParticles: false
    });

    document.getElementById("menu-page").style.display = "none";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("lunarLander-page").style.display = "block";
    document.getElementById("enterHighScore-page").style.display = "none";

    canvasB = document.getElementById('canvas-background');
    contextB = canvasB.getContext('2d');

    canvasF = document.getElementById('canvas-foreground');
    contextF = canvasF.getContext('2d');

    renderTerrain();
    getControls();
    menuClickSound.play();
    requestAnimationFrame(gameLoop);
}

function getShipSrc() {
    spaceShipSrc = "Images/redRocket.png";

    if (document.getElementById('redRocket').checked) {
        spaceShipSrc = "Images/redRocket.png";
    }
    else if (document.getElementById('blueRocket').checked) {
        spaceShipSrc = "Images/blueRocket.png";
    }
    else if (document.getElementById('yellowRocket').checked) {
        spaceShipSrc = "Images/yellowRocket.png";
    }
}

function start1() {
    launchSound.play();

    numLandingPads = 2;
    lengthOfLandingPad = 100;
    firstWin = true;
    initialize();
}

function start2() {
    contextB.clearRect(0, 0, canvasB.width, canvasB.height);
    numLandingPads = 1;
    lengthOfLandingPad = 70;
    initialize();
}

function setGlobals() {
    landedSafely = false;
    finishSequence = false;
}


////////////////////////// TRANSITION  //////////////////////////

function startCountdown() {
    timeLeft = 3;
    let downloadTimer = setInterval(function(){
        if(timeLeft <= 0){
            clearInterval(downloadTimer);
            finishCountdown = true;
        }
        else {
            currentNumber = timeLeft;
            transitionRender();
        }
        timeLeft -= 1;
    }, 1000);
}

function transitionRender() {
    contextF.clearRect(0, 0, canvasF.width, canvasF.height);

    contextF.fillText(currentNumber.toString(), COORD_SIZE_X/2-50, 150);
    contextF.strokeText(currentNumber.toString(), COORD_SIZE_X/2-50, 150);
    contextF.fill();
    contextF.stroke();
}

function transitionGameLoop() {
    if (!finishCountdown) {
        requestAnimationFrame(transitionGameLoop);
    }
    else {
        start2();
    }
}

function transitionSequence() {
    finishCountdown = false;
    contextF.font = "150px Arial";
    contextF.fillStyle = "black";
    contextF.strokeStyle = "white";
    startCountdown();
    transitionGameLoop();
}


////////////////////////// ENDING //////////////////////////

function finish() {
    contextB.clearRect(0, 0, canvasB.width, canvasB.height);
    contextF.clearRect(0, 0, canvasF.width, canvasF.height);

    let runReport = document.getElementById("runReport");
    runReport.innerHTML = "";
    runReport.innerHTML += ('<div id="finalScore" class="header">' + 'Score:' + score + '</div>');

    document.getElementById("menu-page").style.display = "none";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "block";
}

function addHighScore() {
    document.getElementById("menu-page").style.display = "block";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "none";

    let name = document.getElementById('initials').value;

    MyGame.persistence.add(name, score);
    MyGame.persistence.report();
}

let MyGame = {
    persistence : (function () {
        'use strict';
        let highScores = {};
        let previousScores = localStorage.getItem('MyGame.highScores');

        if (previousScores !== null) {
            highScores = JSON.parse(previousScores);
        }

        function add(key, value) {
            highScores[key] = value;
            localStorage['MyGame.highScores'] = JSON.stringify(highScores);
        }

        function report() {
            let htmlNode = document.getElementById('highScoreReport');

            htmlNode.innerHTML = '';

            highScores = sortHighScores(highScores);

            for (let key in highScores) {
                htmlNode.innerHTML += ('<div class="score">' + highScores[key] + '....................' + key + '</div>');
            }

            htmlNode.scrollTop = htmlNode.scrollHeight;
        }

        return {
            add : add,
            report : report
        };
    }())
};

function sortHighScores(highScores) {
    let sortedHighScores = {};

    let items = Object.keys(highScores).map(function(key) {
        return [key, highScores[key]];
    });

    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    let i = 0;
    for (let key in highScores) {
        sortedHighScores[items[i][0]] = items[i][1];
        i++;
    }

    return sortedHighScores;
}


////////////////////////// DEATH //////////////////////////

function deathUpdate(elapsedTime) {
    setTimeout(function() {
        deathSystem.isCreateNewParticles = false;
        contextF.font = "100px Arial";
        contextF.fillStyle = "black";
        contextF.strokeStyle = "white";
        contextF.fillText("GAME OVER", COORD_SIZE_X/2 - 150, 100);
        contextF.strokeText("GAME OVER", COORD_SIZE_X/2 - 150, 100);
        contextF.fill();
        contextF.stroke();
        setTimeout(function() {
            finishSequence = true;
        }, 1500);
    }, 200);
    deathSystem.update(elapsedTime);
}

function deathRender() {
    contextF.clearRect(0, 0, canvasF.width, canvasF.height);

    deathSystem.render();
}

function deathGameLoop(time) {
    let elapsedTime = time - previousTime;
    previousTime = time;
    deathUpdate(elapsedTime);
    deathRender();

    if (!finishSequence) {
        requestAnimationFrame(deathGameLoop);
    }
}

function deathSequence(spaceShip) {
    crashSound.play();
    deathSystem = ParticleSystem({
        image: imageDeath,
        center: {x: spaceShip.center.x, y: spaceShip.center.y},
        size: {mean: 10, stdev: 3},
        speed: { mean: 0, stdev: 0.2},
        lifetime: { mean: 1000, stdev: 250},
        range: {start: -Math.PI, end: Math.PI},
        isCreateNewParticles: true
    });
    finishSequence = false;
    deathGameLoop()
}


////////////////////////// GAME LOOP //////////////////////////

function update(elapsedTime) {
    for (let key in myKeyboard.keys) {
        if (myKeyboard.keys.hasOwnProperty(key)) {
            if (myKeyboard.handlers[key]) {
                myKeyboard.handlers[key](elapsedTime);
            }
        }
    }

    if (spaceShip.ready) {
        spaceShip.exhaust.x = (spaceShip.radius - 3) * Math.sin(-spaceShip.rotation) + spaceShip.center.x;
        spaceShip.exhaust.y = (spaceShip.radius - 3) * Math.cos(-spaceShip.rotation) + spaceShip.center.y;
        exhaustSystem.center.x = spaceShip.exhaust.x;
        exhaustSystem.center.y = spaceShip.exhaust.y;
        exhaustSystem.range.start = -spaceShip.rotation  - Math.PI/8;
        exhaustSystem.range.end = -spaceShip.rotation  + Math.PI/8;
        spaceShip.nose.x = spaceShip.radius * Math.sin(-spaceShip.rotation + Math.PI) + spaceShip.center.x;
        spaceShip.nose.y = spaceShip.radius * Math.cos(-spaceShip.rotation + Math.PI) + spaceShip.center.y;
        spaceShip.tail.x = spaceShip.radius * Math.sin(-spaceShip.rotation) + spaceShip.center.x;
        spaceShip.tail.y = spaceShip.radius * Math.cos(-spaceShip.rotation) + spaceShip.center.y;
        spaceShip.hitBox.center.x = spaceShip.center.x;
        spaceShip.hitBox.center.y = spaceShip.center.y;

        spaceShip.accelerationRate += 0.20;
        spaceShip.center.y += 0.1 * spaceShip.accelerationRate;
        spaceShip.speed = 0.1 * spaceShip.accelerationRate * 2;

        if(spaceShip.speed < tempSpeed) {
            spaceShip.center.x += -spaceShip.level * spaceShip.accelerationRate * 0.001;
        }
        else {
            spaceShip.center.x += spaceShip.level * spaceShip.accelerationRate * 0.001;
        }
        tempSpeed = spaceShip.speed;

        if(spaceShip.center.y < 0) {
            spaceShip.center.y = 0;
            spaceShip.accelerationRate = 0;
        }
        if (spaceShip.fuel < 0) {
            spaceShip.fuel = 0;
        }
    }

    window.addEventListener('keyup', function() {
        thrustSound1.pause();
        thrustSound2.pause();
        exhaustSystem.isCreateNewParticles = false;
    });
    exhaustSystem.update(elapsedTime);
}

// Reference for the following function only
// https://stackoverflow.com/questions/37224912/circle-line-segment-collision
function lineCircleIntersection(pt1, pt2, circle) {
    let v1 = { x: pt2.x - pt1.x, y: pt2.y - pt1.y };
    let v2 = { x: pt1.x - circle.center.x, y: pt1.y - circle.center.y };
    let b = -2 * (v1.x * v2.x + v1.y * v2.y);
    let c =  2 * (v1.x * v1.x + v1.y * v1.y);
    let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    if (isNaN(d)) { // no intercept
        return false;
    }
    // These represent the unit distance of point one and two on the line
    let u1 = (b - d) / c;
    let u2 = (b + d) / c;
    if (u1 <= 1 && u1 >= 0) {  // If point on the line segment
        return true;
    }
    if (u2 <= 1 && u2 >= 0) {  // If point on the line segment
        return true;
    }
    return false;
}

function isCrash() {
    if (spaceShip.ready) {
        // Crash if hit walls
        if (spaceShip.nose.x < 0 || spaceShip.nose.x > COORD_SIZE_X
        || spaceShip.tail.x < 0 || spaceShip.tail.x > COORD_SIZE_X) {
            return true;
        }
        // Crash if hit non-landing pad
        for (let i = 0; i < terrain.length; i++) {
            let line = terrain[i];
            let pt1 = line.left;
            let pt2 = line.right;
            if (lineCircleIntersection(pt1, pt2, spaceShip.hitBox)) {
                return true;
            }
        }
        // Crash on landing pad
        for (let i = 0; i < landingPads.length; i++) {
            let line = landingPads[i];
            let pt1 = line.left;
            let pt2 = line.right;
            if (lineCircleIntersection(pt1, pt2, spaceShip.hitBox)){
                if (spaceShip.speed >= 2 || spaceShip.level < -5 || spaceShip.level > 5) {
                    return true;
                }
                else {
                    landedSafely = true;
                    return false;
                }
            }
        }
        return false;
    }
}

function renderTexture(texture) {
    if (texture.ready) {
        contextF.save();
        contextF.translate(texture.center.x, texture.center.y);
        contextF.rotate(texture.rotation);
        contextF.translate(-texture.center.x, -texture.center.y);
        contextF.drawImage(
            texture.image,
            texture.center.x - texture.width / 2,
            texture.center.y - texture.height / 2,
            texture.width, texture.height);
        contextF.restore();

        // TODO These lines draw some of the important points on the spaceship
        //  used for calculating crashes/landings

        // contextF.beginPath();
        // contextF.arc(spaceShip.exhaust.x, spaceShip.exhaust.y, 2, 0, 2 * Math.PI, false);
        // contextF.fillStyle = 'black';
        // contextF.fill();
        // contextF.lineWidth = 1;
        // contextF.strokeStyle = 'black';
        // contextF.stroke();
        //
        // contextF.beginPath();
        // contextF.arc(spaceShip.nose.x, spaceShip.nose.y, 2, 0, 2 * Math.PI, false);
        // contextF.fillStyle = 'black';
        // contextF.fill();
        // contextF.lineWidth = 1;
        // contextF.strokeStyle = 'black';
        // contextF.stroke();

        // contextF.beginPath();
        // contextF.arc(spaceShip.hitBox.center.x, spaceShip.hitBox.center.y, spaceShip.hitBox.radius, 0, 2 * Math.PI);
        // contextF.lineWidth = 1;
        // contextF.strokeStyle = 'black';
        // contextF.stroke();
    }
}

function renderStats(spaceShip) {
    contextF.font = "15px Arial";
    if (spaceShip.fuel >= 0) {
        contextF.fillStyle = "green";
    }
    else {
        contextF.fillStyle = "white";
    }
    let fuelRemaining = Math.round(spaceShip.fuel * 100)/100;
    let fuelText = "Fuel Remaining (liters): ".concat(fuelRemaining.toString());
    contextF.fillText(fuelText, COORD_SIZE_X - TEXT_DISTANCE_FROM_EDGE, 20);

    if (spaceShip.speed <= 2) {
        contextF.fillStyle = "green";
    }
    else {
        contextF.fillStyle = "white";
    }
    let currentSpeed = Math.round(spaceShip.speed * 100)/100;
    let speedText = "Speed (m/s): ".concat(currentSpeed.toString());
    contextF.fillText(speedText, COORD_SIZE_X - TEXT_DISTANCE_FROM_EDGE, 35);

    if (spaceShip.level > -5 && spaceShip.level < 5) {
        contextF.fillStyle = "green";
    }
    else {
        contextF.fillStyle = "white";
    }
    let currentLevel = Math.round(spaceShip.level * 100)/100;
    let levelText = "Level (degrees): ".concat(currentLevel.toString());
    contextF.fillText(levelText, COORD_SIZE_X - TEXT_DISTANCE_FROM_EDGE, 50);
}

function render() {
    contextF.clearRect(0, 0, canvasF.width, canvasF.height);
    exhaustSystem.render();
    renderTexture(spaceShip);
    renderStats(spaceShip);

}

function gameLoop(time) {
    let elapsedTime = time - previousTime;
    previousTime = time;
    update(elapsedTime);
    render();

    if (!isCrash() && !landedSafely) {
        requestAnimationFrame(gameLoop);
    }
    else if (landedSafely) {
        thrustSound1.pause();
        thrustSound2.pause();
        landingSound.play();
        if (firstWin) {
            transitionSequence();
            firstWin = false;
        }
        else {
            score = Math.round(spaceShip.fuel);
            finish();
        }
    }
    else {
        contextF.clearRect(0, 0, canvasF.width, canvasF.height);
        deathSequence(spaceShip);
    }
}


////////////////////////// CUSTOMIZING CONTROLS //////////////////////////

function getControls() {
    myKeyboard.registerCommand(MyGame1.persistence.getUseJets(), spaceShip.useJets);
    myKeyboard.registerCommand(MyGame1.persistence.getRotateLeft(), spaceShip.rotateLeft);
    myKeyboard.registerCommand(MyGame1.persistence.getRotateRight(), spaceShip.rotateRight);
}

function changeThrust() {
    document.getElementById("newThrustControl").value = "";
    document.getElementById("thrustDisplay").style.display = "none";
    document.getElementById("newThrustControl").style.display = "inline-block";
    document.getElementById("enterNewThrustControl").style.display = "inline-block";
}
function setThrust() {
    let keyBind = document.getElementById("newThrustControl").value;
    if (keyBind === "ArrowLeft" || keyBind === "ArrowRight" || keyBind === "ArrowUp" || keyBind === "ArrowDown") {
        MyGame1.persistence.add('useJets', keyBind);
    }
    else {
        MyGame1.persistence.add('useJets', keyBind.charAt(0));
    }

    MyGame1.persistence.report();
    document.getElementById("thrustDisplay").style.display = "inline-block";
    document.getElementById("newThrustControl").style.display = "none";
    document.getElementById("enterNewThrustControl").style.display = "none";
}

function changeRotateLeft() {
    document.getElementById("newRotateLeftControl").value = "";
    document.getElementById("rotateLeftDisplay").style.display = "none";
    document.getElementById("newRotateLeftControl").style.display = "inline-block";
    document.getElementById("enterNewRotateLeftControl").style.display = "inline-block";
}
function setRotateLeft() {
    let keyBind = document.getElementById("newRotateLeftControl").value;
    if (keyBind === "ArrowLeft" || keyBind === "ArrowRight" || keyBind === "ArrowUp" || keyBind === "ArrowDown") {
        MyGame1.persistence.add('rotateLeft', keyBind);
    }
    else {
        MyGame1.persistence.add('rotateLeft', keyBind.charAt(0));
    }
    MyGame1.persistence.report();
    document.getElementById("rotateLeftDisplay").style.display = "inline-block";
    document.getElementById("newRotateLeftControl").style.display = "none";
    document.getElementById("enterNewRotateLeftControl").style.display = "none";
}

function changeRotateRight() {
    document.getElementById("newRotateRightControl").value = "";
    document.getElementById("rotateRightDisplay").style.display = "none";
    document.getElementById("newRotateRightControl").style.display = "inline-block";
    document.getElementById("enterNewRotateRightControl").style.display = "inline-block";
}
function setRotateRight() {
    let keyBind = document.getElementById("newRotateRightControl").value;
    if (keyBind === "ArrowLeft" || keyBind === "ArrowRight" || keyBind === "ArrowUp" || keyBind === "ArrowDown") {
        MyGame1.persistence.add('rotateRight', keyBind);
    }
    else {
        MyGame1.persistence.add('rotateRight', keyBind.charAt(0));
    }
    MyGame1.persistence.report();
    document.getElementById("rotateRightDisplay").style.display = "inline-block";
    document.getElementById("newRotateRightControl").style.display = "none";
    document.getElementById("enterNewRotateRightControl").style.display = "none";
}

let MyGame1 = {
    persistence : (function () {
        'use strict';
        let controls = {};
        let previousControls = localStorage.getItem('MyGame1.controls');

        if (previousControls !== null) {
            controls = JSON.parse(previousControls);
        }
        else {
            controls['useJets'] = 'ArrowUp';
            controls['rotateLeft'] = 'ArrowLeft';
            controls['rotateRight'] = 'ArrowRight';
        }

        function add(key, value) {
            controls[key] = value;
            localStorage['MyGame1.controls'] = JSON.stringify(controls);
        }

        function getUseJets() {
            return controls['useJets'];
        }
        function getRotateLeft() {
            return controls['rotateLeft'];
        }
        function getRotateRight() {
            return controls['rotateRight'];
        }

        function report() {
            let htmlNodeThrust = document.getElementById('thrustDisplay');
            htmlNodeThrust.innerHTML = controls['useJets'];

            let htmlNodeRotateLeft = document.getElementById('rotateLeftDisplay');
            htmlNodeRotateLeft.innerHTML = controls['rotateLeft'];

            let htmlNodeRotateRight = document.getElementById('rotateRightDisplay');
            htmlNodeRotateRight.innerHTML = controls['rotateRight'];
        }

        return {
            add : add,
            getUseJets : getUseJets,
            getRotateLeft : getRotateLeft,
            getRotateRight: getRotateRight,
            report : report
        };
    }())
};

function viewControls() {
    menuClickSound.play();
    MyGame1.persistence.report();
    document.getElementById("menu-page").style.display = "none";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "none";
    document.getElementById("controls-page").style.display = "block";
}


////////////////////////// MENU FUNCTIONS //////////////////////////

function viewHighScores() {
    menuClickSound.play();
    document.getElementById("menu-page").style.display = "none";
    document.getElementById("highScore-page").style.display = "block";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "none";

    MyGame.persistence.report();
}

function viewCredits() {
    menuClickSound.play();
    document.getElementById("menu-page").style.display = "none";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("credits-page").style.display = "block";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "none";
}

function goBackToMenu() {
    menuClickSound.play();
    document.getElementById("menu-page").style.display = "block";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("credits-page").style.display = "none";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "none";
    document.getElementById("controls-page").style.display = "none";
}

function goBackToMenu1() {
    contextB.clearRect(0, 0, canvasB.width, canvasB.height);
    contextF.clearRect(0, 0, canvasF.width, canvasF.height);
    menuClickSound.play();
    document.getElementById("menu-page").style.display = "block";
    document.getElementById("highScore-page").style.display = "none";
    document.getElementById("credits-page").style.display = "none";
    document.getElementById("lunarLander-page").style.display = "none";
    document.getElementById("enterHighScore-page").style.display = "none";
}

function playGameMusic() {
    gameMusic.play();
}

