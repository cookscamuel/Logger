import treeQueue from './tree.js';

// Determine whether or not the device uses touchscreen.
// An attempt at making input more snappy on mobile.
// const IS_TOUCH_DEVICE = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// const INPUT_TYPE = IS_TOUCH_DEVICE ? 'touchstart' : 'click';

// Constants that can be referenced to update different parts of the game.
// These shouldn't be just hanging out here loose like this. It's fine for now though.
const PLAYER_IDLE = loadImage('./media/textures/idle.gif');
const PLAYER_CUT = loadImage('./media/textures/cut.png');
const PLAYER_DEAD = loadImage('./media/textures/dead.png');
PLAYER_IDLE.id = PLAYER_CUT.id = PLAYER_DEAD.id = 'player';

const TREE_TRUNK = [
    loadImage('./media/textures/bark_0.png'),
    loadImage('./media/textures/bark_1.png')
];

const TREE_BRANCH = loadImage('./media/textures/branch.png');

const MEDALS_MILESTONES = [
    [25, "BRONZE", "#824601"],
    [50, "SILVER", "#cccccc"],
    [100, "GOLD", "gold"],
    [150, "PLATINUM", "#00b5ac"],
    [200, "DIAMOND", "#148aff"],
    [300, "IRIDESCENT", "#e175ff"]
];

const MEDALS = [];

for (var i = 0; i <= MEDALS_MILESTONES.length; i++) {
    MEDALS[i] = loadImage("./media/textures/medal_" + i + ".png");
}

const AUDIO_THEME = new Audio('../media/sounds/music.mp3');
const AUDIO_GAMEOVER = new Audio('../media/sounds/gameOver.mp3');
AUDIO_THEME.loop = AUDIO_GAMEOVER.loop = true;

const AUDIO_CUT = new Audio('../media/sounds/chop.mp3');
const AUDIO_KILLED = new Audio('../media/sounds/dead.mp3');
const AUDIO_REWARD = new Audio('../media/sounds/reward.mp3');
const AUDIO_FINISH = new Audio('../media/sounds/finish.mp3')

document.addEventListener('click', startGame);

// A function to help load textures in memory ahead of time. 
// I don't know if this is even doing what I want, but it was an attempt.
function loadImage(url) {
    const img = new Image();
    img.src = url;
    return img;
}

// Function used to keep the tree segments coming.
function addNewTreeSegment(rear, score, center, i) {

    // Images are branches, divs are bare logs.
    var segment = rear == 0 || rear == 2 ?
        document.createElement('img') :
        document.createElement('div');

    // Set the appropriate ID of the next log.
    segment.id = i == -1 ? 'log-' + (score + 6) : 'log-' + i;

    segment.className = 'log-segments';

    // If it is a bare log, it does not need to be assigned the branch texture.
    if (rear == 1) return segment;

    // Assign the branch texture to the segment.
    segment.src = TREE_BRANCH.src;
    segment.style.translate = rear == 0 ? '-99%' : (center.getBoundingClientRect().width - 1) + 'px';
    segment.style.transform = rear == 0 ? 'scaleX(1)' : 'scaleX(-1)';

    return segment;
}

// For the tree segment options, 0 is a left branch, 1 is neither, and 2 is a right branch.
// The first tree segment is always a 1 so the player does not die instantly.
// Segments are randomly chosen.
function buildTree(theTree, screenCenter) {
    for (var i = 0; i < 6; i++) {
        var newLog = document.createElement('p');
        i % 2 == 0 ? theTree.addLog(1) : theTree.addLog(Math.floor(Math.random() * 3));

        newLog.innerText = 'LOG' + theTree.getRear();
        newLog.id = 'log-' + i;

        var newSegment = addNewTreeSegment(theTree.getRear(), theTree.getScore(), screenCenter, i);

        i == 0 ? screenCenter.appendChild(newSegment) : screenCenter.insertBefore(newSegment, document.getElementById('log-' + (i - 1)));
    }

    document.getElementById('score').innerText = '0';

}

// Function used to manage the tree segments, check for game-overs, and keep the game moving.
function chop(theTree, screenLeft, screenCenter, screenRight, player, body) {

    // Get the side that the player tapped on.
    var clickedSide = event.target.id;

    // Flip sides, if need be.
    clickedSide == 'screen-left' ? handlePlayerSide(theTree, player, screenCenter, 0) : handlePlayerSide(theTree, player, screenCenter, 1);

    // CHOP.
    AUDIO_CUT.cloneNode(true).play();

    // Slight delay so that the player can visibly react to player input.
    setTimeout(function () {

        // Check if they are going into a branch at the ground level.
        if ((clickedSide == 'screen-left' && theTree.getFront() == 0) || (clickedSide == 'screen-right' && theTree.getFront() == 2)) {
            gameOver(player, screenLeft, screenRight, screenCenter, theTree.getScore());
            return;
        }

        // Tim-ber!
        theTree.removeLog();
        document.getElementById('log-' + theTree.getScore()).remove();

        // Not currently updating gracefully on mobile devices.
        // Give the effect that the trunk is losing a segment by switching between regular and an offset texture.
        // screenCenter.style.backgroundImage = 'url(' + TREE_TRUNK[theTree.score % 2].src + ')';

        // Make sure there is never a die-die situation where cutting either side kills you.
        (theTree.getScore() + 6) % 2 == 0 ? theTree.addLog(1) : theTree.addLog(Math.floor(Math.random() * 3));

        // Create and add the new segment.
        var newSegment = addNewTreeSegment(theTree.getRear(), theTree.getScore(), screenCenter, -1);
        screenCenter.insertBefore(newSegment, document.getElementById('log-' + (theTree.getScore() + 5)));

        // Check if a branch has fallen on top of the player.
        if ((clickedSide == 'screen-left' && theTree.getFront() == 0) || (clickedSide == 'screen-right' && theTree.getFront() == 2)) {
            gameOver(player, screenLeft, screenRight, screenCenter, theTree.getScore());
            return;
        }

        // Increase and update the score.
        theTree.score++;
        document.getElementById('score').innerText = theTree.getScore();

        // Play a sound when a score milestone is hit.
        for (var i = 0; i < MEDALS_MILESTONES.length; i++) {
            if (theTree.score == MEDALS_MILESTONES[i][0]) {
                if (theTree.score == MEDALS_MILESTONES[5][0]) {
                    AUDIO_FINISH.cloneNode(true).play();
                }
                else {
                    AUDIO_REWARD.cloneNode(true).play();
                }
            }
        }

    }, 100);

}

// Function to manage where the player is being displayed with every input.
function handlePlayerSide(theTree, player, center, side) {

    // Removing, updating, and adding the player back seems to work fine.
    player.remove();
    player = PLAYER_CUT;

    // Flip them if needed.
    player.style.transform = side == 0 ? 'scaleX(-1)' : 'scaleX(1)';
    player.style.translate = side == 0 ? '-100%' : center.getBoundingClientRect().width + 'px';

    center.appendChild(player);

    // This will return the player to the idle position after the cut animation has had a turn.
    setTimeout(function () {
        player.remove();
        player = PLAYER_IDLE;
        player.style.transform = side == 0 ? 'scaleX(-1)' : 'scaleX(1)';
        player.style.translate = side == 0 ? '-100%' : center.getBoundingClientRect().width + 'px';
        center.appendChild(player);
    }, 100);

}

// Function called when the player loses.
function gameOver(player, left, right, center, score) {

    // Stop that infernal galop.
    AUDIO_THEME.pause();
    AUDIO_THEME.currentTime = 0;

    // Ouch!
    AUDIO_KILLED.play();

    // Update the player model to be of the dead variety.
    var diedSide = player.style.translate;
    player.remove();
    player = PLAYER_DEAD;
    player.style.translate = diedSide;
    center.appendChild(player);

    // It's no fun being dead.
    left.style.pointerEvents = right.style.pointerEvents = 'none';

    // Let that sink in before accepting your fate.
    setTimeout(function () {

        body.innerHTML = '';
        body.style.display = 'block';

        var gameOverTitle = document.createElement('p');
        gameOverTitle.id = 'game-over';
        gameOverTitle.innerText = 'GAME OVER!\nSCORE: ' + score;
        body.appendChild(gameOverTitle);

        // Determine the medal awarded based on the score.
        var reward = 0;

        while (reward <= 5) {
            if (score >= MEDALS_MILESTONES[reward][0]) {
                reward++;
            }
            else {
                break;
            }
        };

        var medal = document.createElement('img');
        medal = MEDALS[reward];
        medal.id = 'medal';
        body.appendChild(medal);

        var medalTitle = document.createElement('p');
        medalTitle.innerText = reward == 0 ? "NO MEDAL" : MEDALS_MILESTONES[reward - 1][1];
        medalTitle.id = 'medal-title';
        medalTitle.style.color = reward == 0 ? "black" : MEDALS_MILESTONES[reward - 1][2];
        body.appendChild(medalTitle);

        var restartButton = document.createElement('button');
        restartButton.id = 'restart-button';
        restartButton.innerText = 'KEEP CHOPPIN\'';
        body.appendChild(restartButton);
        restartButton.addEventListener('click', restart);

        // :O
        AUDIO_GAMEOVER.play();

    }, 2500);
}

// Function used to restart the game.
function restart() {
    body.innerHTML = '';
    body.style = '';

    AUDIO_GAMEOVER.pause();
    AUDIO_GAMEOVER.currentTime = AUDIO_KILLED.currentTime = 0;

    var replaceBounds = document.createElement('div');
    var replaceLeft = document.createElement('div');
    var replaceCenter = document.createElement('div');
    var replaceRight = document.createElement('div');
    var replaceScore = document.createElement('div');
    var replacePrompt = document.createElement('div');

    replaceBounds.id = 'screen-bounds';
    replaceLeft.id = 'screen-left';
    replaceCenter.id = 'screen-center';
    replaceRight.id = 'screen-right';
    replaceScore.id = 'score';
    replacePrompt.id = 'click-prompt';

    body.appendChild(replaceBounds);
    replaceBounds.appendChild(replaceLeft);
    replaceBounds.appendChild(replaceCenter);
    replaceBounds.appendChild(replaceRight);
    replaceBounds.appendChild(replaceScore);
    replaceCenter.appendChild(replacePrompt);

    startGame();
}

// Function used to setup the game.
function startGame() {

    // Prevent multiple clicks and remove the start screen.
    document.removeEventListener('click', startGame);

    // Remove the loading prompt.
    document.getElementById('click-prompt').remove()

    // Create the tree queue.
    const theTree = new treeQueue();

    // Get the left, center, and right parts of the screen.
    var screenLeft = document.getElementById('screen-left');
    var screenCenter = document.getElementById('screen-center');
    var screenRight = document.getElementById('screen-right');
    var body = document.getElementById('body');

    screenLeft.style.backgroundImage = screenRight.style.backgroundImage = "url('../media/textures/sky.png')";
    screenCenter.style.backgroundImage = "url('../media/textures/bark_1.png')";

    // Build the initial tree.
    buildTree(theTree, screenCenter);

    // Setup the player.
    var player = new Image();
    player.id = 'player';
    player = PLAYER_IDLE;
    player.style.transform = 'scaleX(-1)';
    player.style.translate = '-100%';
    screenCenter.appendChild(player);

    // Event listeners for tapping the left or right side of the tree.
    for (var side of [screenLeft, screenRight]) {
        side.addEventListener('click', () => chop(theTree, screenLeft, screenCenter, screenRight, player, body));
    }

    // Cause migraines probably.
    AUDIO_THEME.play();

}