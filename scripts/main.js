import treeQueue from "./tree.js";

// TODO:
// Replace onClicks with ontouchstart, apparently this will work with mobile devices to provide instant effects.
// Use a queue for the tree. Add new logs to the back, remove ones from the front.
// Make it so the bottom of the tree always begins as being a log with no branches.
// Use window.innerHeight and innerWidth to size the segments according to the screen size.

document.addEventListener("click", begin);

// Function used to setup the game.
function begin() {

    // Prevent multiple clicks and remove the start screen.
    document.removeEventListener("click", begin);

    // Remove the loading prompt.
    document.getElementById('click-prompt').remove()
    
    // Create the tree queue.
    const theTree = new treeQueue();

    // Get the left, center, and right parts of the screen.
    var screenLeft = document.getElementById('screen-left');
    var screenCenter = document.getElementById("screen-center");
    var screenRight = document.getElementById('screen-right');
    var body = document.getElementById("body");
    
    buildTree(theTree, screenCenter);
    
    var player = document.createElement("img");
    player.src = "./media/lumberjack-0.png";
    player.style.width = "20vh";
    player.style.display = "block";
    player.style.margin = "auto";
    screenLeft.appendChild(player);
    
    screenLeft.addEventListener("click", () => chop(theTree, screenLeft, screenCenter, screenRight, player, body));
    screenRight.addEventListener("click", () => chop(theTree, screenLeft, screenCenter, screenRight, player, body));

    handlePlayerSide(theTree, screenLeft, screenRight, player, 0);

}

// For the tree segment options, 0 is a left branch, 1 is neither, and 2 is a right branch.
// The first tree segment always has to be a 1 so the player does not die instantly.

function buildTree(theTree, screenCenter) {
    for (var i = 0; i < 6; i++) {
        var newLog = document.createElement("p");        
        i % 2 == 0 ? theTree.addLog(1) : theTree.addLog(Math.floor(Math.random() * 3));

        newLog.innerText = "LOG" + theTree.getRear();
        newLog.id = "log-" + i;

        var newSegment = document.createElement("img");

        switch (theTree.getRear()) {
            case 0:
                newSegment.src = "./media/goldenFrasier.jpg";
                break;
            case 1:
                newSegment.src = "./media/sleepyHollow.PNG";
                break;
            case 2:
                newSegment.src = "./media/frasier.jpg";
                break;
        }

        newSegment.style.width = "50vw";
        newSegment.style.height = "50px";
        newSegment.style.position = "relative";
        newSegment.style.pointerEvents = "none";
        newSegment.id = "log-" + i;
        newSegment.className = "log-segments";
        
        i == 0 ? screenCenter.appendChild(newSegment) : screenCenter.insertBefore(newSegment, document.getElementById("log-" + (i - 1)));
    }

    document.getElementById("score").innerText = "0";

}

function handlePlayerSide(theTree, screenLeft, screenRight, player, side) {

    // Evaluate which side of the tree the player should be on.
    switch (side) {
        // Place player on the left.
        case 0:
            screenRight.innerHTML = '';
            screenLeft.appendChild(player);
            break;
        
        // Place player on the right.
        case 1:
            screenLeft.innerHTML = '';
            screenRight.appendChild(player);
            break;
    }

}

function chop(theTree, screenLeft, screenCenter, screenRight, player, body) {

    // Flip sides.
    event.target.id == "screen-left" ? handlePlayerSide(theTree, screenLeft, screenRight, player, 0) : handlePlayerSide(theTree, screenLeft, screenRight, player, 1);

    // Check if they are going into a branch at the ground level.
    if ((event.target.id == "screen-left" && theTree.getFront() == 0) || (event.target.id == "screen-right" && theTree.getFront() == 2)) {
        gameOver(theTree);
        return;
    }
    
    theTree.removeLog();
    document.getElementById("log-" + theTree.getScore()).remove();

    // Make sure there is never a die-die situation where cutting either side kills you.
    (theTree.getScore() + 6) % 2 == 0 ? theTree.addLog(1) : theTree.addLog(Math.floor(Math.random() * 3));

        var newSegment = document.createElement("img");

        switch (theTree.getRear()) {
            case 0:
                newSegment.src = "./media/goldenFrasier.jpg";
                break;
            case 1:
                newSegment.src = "./media/sleepyHollow.PNG";
                break;
            case 2:
                newSegment.src = "./media/frasier.jpg";
                break;
        }

        newSegment.style.width = "50vw";
        newSegment.style.height = "50px";
        newSegment.style.position = "relative";
        newSegment.style.pointerEvents = "none";
        newSegment.id = "log-" + (theTree.getScore() + 6);
        newSegment.className = "log-segments";
        
    screenCenter.insertBefore(newSegment, document.getElementById("log-" + (theTree.getScore() + 5)));

    // Check if a branch has fallen on top of the player.
    if ((event.target.id == "screen-left" && theTree.getFront() == 0) || (event.target.id == "screen-right" && theTree.getFront() == 2)) {
        gameOver(theTree);
        return;
    }
    
    // Increase and update the score.
    theTree.score++;
    document.getElementById("score").innerText = theTree.getScore();

}

// Function called when the player loses.
function gameOver(theTree) {
    body.innerHTML = '';
    body.style.background = 'linear-gradient(#9e2424, #701212)';
    body.style.display = 'block';
    
    var gameOverTitle = document.createElement("p");
    gameOverTitle.id = "game-over";
    gameOverTitle.innerText = "GAME OVER!\nSCORE: " + theTree.getScore();
    body.appendChild(gameOverTitle);
    
    var restartButton = document.createElement("button");
    restartButton.id = "restart-button";
    restartButton.innerText = "RETRY";
    body.appendChild(restartButton);
    restartButton.addEventListener("click", restart);
}



// Function used to restart the game.
function restart() {
    body.innerHTML = '';
    body.style = '';
    
    var replaceLeft = document.createElement("div");
    var replaceCenter = document.createElement("div");
    var replaceRight = document.createElement("div");
    var replaceScore = document.createElement("div");
    var replacePrompt = document.createElement("div");

    replaceLeft.id = "screen-left";
    replaceCenter.id = "screen-center";
    replaceRight.id = "screen-right";
    replaceScore.id = "score";
    replacePrompt.id = "click-prompt";

    body.appendChild(replaceLeft);
    body.appendChild(replaceCenter);
    body.appendChild(replaceRight);
    replaceCenter.appendChild(replaceScore);
    replaceCenter.appendChild(replacePrompt);

    begin();
}