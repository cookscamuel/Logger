import treeQueue from './tree.js';

const IDLE = loadAsset('./media/textures/idle.png');
const CUT = loadAsset('./media/textures/cut.png');
const DEAD = loadAsset('./media/textures/dead.png');
IDLE.id = CUT.id = DEAD.id ='player';

const BRANCH = loadAsset('./media/textures/branch.svg');

document.addEventListener('click', startGame);
// TODO:
// Add comments.
// Revise readme.
// Reorganize function order.
// Replace onClicks with ontouchstart, apparently this will work with mobile devices to provide instant effects.
// Use window.innerHeight and innerWidth to size the segments according to the screen size.


// Make lumberjack-idle and lumberjack-cut gifs.
// Only need one branch texture, just flip it.

// A function to help load textures in memory ahead of time.
function loadAsset(url) {
    const img = new Image();
    img.src = url;
    return img;
}

function addNewTreeSegment(rear, score, i) {
    var segment = rear == 0 || rear == 2 ?
        document.createElement('img') :
        document.createElement('div');

    segment.id = i == -1 ? 'log-' + (score + 6) : 'log-' + i;

    segment.className = 'log-segments';

    if (rear == 1) return segment;

    segment.src = BRANCH.src;
    segment.style.translate = rear == 0 ? '-70%' : '5%';
    segment.style.transform = rear == 0 ? 'scaleX(1)' : 'scaleX(-1)';

    return segment;
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

    buildTree(theTree, screenCenter);

    var player = new Image();
    player.id = 'player';
    player = IDLE;

    screenLeft.appendChild(player);

    for (var side of [screenLeft, screenRight]) {
        side.addEventListener('click', () => chop(theTree, screenLeft, screenCenter, screenRight, player, body));
    }

    handlePlayerSide(theTree, screenLeft, screenRight, player, 0);

}

// For the tree segment options, 0 is a left branch, 1 is neither, and 2 is a right branch.
// The first tree segment always has to be a 1 so the player does not die instantly.

function buildTree(theTree, screenCenter) {
    for (var i = 0; i < 6; i++) {
        var newLog = document.createElement('p');
        i % 2 == 0 ? theTree.addLog(1) : theTree.addLog(Math.floor(Math.random() * 3));

        newLog.innerText = 'LOG' + theTree.getRear();
        newLog.id = 'log-' + i;

        var newSegment = addNewTreeSegment(theTree.getRear(), theTree.getScore(), i);

        i == 0 ? screenCenter.appendChild(newSegment) : screenCenter.insertBefore(newSegment, document.getElementById('log-' + (i - 1)));
    }

    document.getElementById('score').innerText = '0';

}

function handlePlayerSide(theTree, screenLeft, screenRight, player, side) {

    // Evaluate which side of the tree the player should be on.
    switch (side) {
        // Place player on the left.
        case 0:
            screenLeft.innerHTML = screenRight.innerHTML = '';
            player = CUT;
            player.style.transform = 'scaleX(1)';
            screenLeft.appendChild(player);
            setTimeout(function(){
                player = IDLE;
                screenLeft.innerHTML = '';
                player.style.transform = 'scaleX(1)';
                screenLeft.appendChild(player);
            }, 100);
            break;

        // Place player on the right.
        case 1:
            screenLeft.innerHTML = screenRight.innerHTML = '';
            player = CUT;
            player.style.transform = 'scaleX(-1)';
            screenRight.appendChild(player);
            setTimeout(function(){
                player = IDLE;
                screenRight.innerHTML = '';
                player.style.transform = 'scaleX(-1)';
                screenRight.appendChild(player);
            }, 100);
            break;
    }


}

function chop(theTree, screenLeft, screenCenter, screenRight, player, body) {

    var clickedSide = event.target.id;
    // Flip sides.
    clickedSide == 'screen-left' ? handlePlayerSide(theTree, screenLeft, screenRight, player, 0) : handlePlayerSide(theTree, screenLeft, screenRight, player, 1);

    setTimeout(function() {

        // Check if they are going into a branch at the ground level.
        if ((clickedSide == 'screen-left' && theTree.getFront() == 0) || (clickedSide == 'screen-right' && theTree.getFront() == 2)) {
            
            gameOver(player, screenLeft, screenRight, theTree.getScore());
            return;
        }
        
        theTree.removeLog();
        document.getElementById('log-' + theTree.getScore()).remove();
        
        // Make sure there is never a die-die situation where cutting either side kills you.
        (theTree.getScore() + 6) % 2 == 0 ? theTree.addLog(1) : theTree.addLog(Math.floor(Math.random() * 3));
        
        var newSegment = addNewTreeSegment(theTree.getRear(), theTree.getScore(), -1);
        
        
        screenCenter.insertBefore(newSegment, document.getElementById('log-' + (theTree.getScore() + 5)));
        
        // Check if a branch has fallen on top of the player.
        if ((clickedSide == 'screen-left' && theTree.getFront() == 0) || (clickedSide == 'screen-right' && theTree.getFront() == 2)) {
            gameOver(player, screenLeft, screenRight, theTree.getScore());
            return;
        }

        // Increase and update the score.
        theTree.score++;
        document.getElementById('score').innerText = theTree.getScore();
    }, 100);

}

// Function called when the player loses.
function gameOver(player, left, right, score) {

        var diedSide = player.parentElement;
        left.innerHTML = right.innerHTML = '';
        player = DEAD;
        diedSide.appendChild(player);

    left.style.pointerEvents = right.style.pointerEvents = 'none';

    setTimeout(function() {

        body.innerHTML = '';
        body.style.background = 'linear-gradient(#9e2424, #701212)';
        body.style.display = 'block';
        
        var gameOverTitle = document.createElement('p');
        gameOverTitle.id = 'game-over';
        gameOverTitle.innerText = 'GAME OVER!\nSCORE: ' + score;
        body.appendChild(gameOverTitle);
        
        var restartButton = document.createElement('button');
        restartButton.id = 'restart-button';
        restartButton.innerText = 'RETRY';
        body.appendChild(restartButton);
        restartButton.addEventListener('click', restart);

    }, 1000);
    
}

// Function used to restart the game.
function restart() {
    body.innerHTML = '';
    body.style = '';

    var replaceLeft = document.createElement('div');
    var replaceCenter = document.createElement('div');
    var replaceRight = document.createElement('div');
    var replaceScore = document.createElement('div');
    var replacePrompt = document.createElement('div');

    replaceLeft.id = 'screen-left';
    replaceCenter.id = 'screen-center';
    replaceRight.id = 'screen-right';
    replaceScore.id = 'score';
    replacePrompt.id = 'click-prompt';

    body.appendChild(replaceLeft);
    body.appendChild(replaceCenter);
    body.appendChild(replaceRight);
    body.appendChild(replaceScore);
    replaceCenter.appendChild(replacePrompt);

    startGame();
}