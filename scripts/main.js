import treeQueue from "./tree.js";

// TODO:
// Replace onClicks with ontouchstart, apparently this will work with mobile devices to provide instant effects.
// Use a queue for the tree. Add new logs to the back, remove ones from the front.
// Make it so the bottom of the tree always begins as being a log with no branches.
// Use window.innerHeight and innerWidth to size the segments according to the screen size.

document.addEventListener("click", begin);

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

function chop(theTree, screenCenter, body) {

    // Check if they are going into a branch at the ground level.
    if ((event.target.id == "screen-left" && theTree.getFront() == 0) || (event.target.id == "screen-right" && theTree.getFront() == 2)) {
        body.innerHTML = '';
        body.style.background = 'linear-gradient(#9e2424, #701212)';
        body.style.display = 'block';
        
        var gameOver = document.createElement("p");
        gameOver.id = "game-over";
        gameOver.innerText = "GAME OVER!\nSCORE: " + theTree.getScore();
        body.appendChild(gameOver);
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
        body.innerHTML = '';
        body.style.background = 'linear-gradient(#9e2424, #701212)';
        body.style.display = 'block';
        
        var gameOver = document.createElement("p");
        gameOver.id = "game-over";
        gameOver.innerText = "GAME OVER!\nSCORE: " + theTree.getScore();
        body.appendChild(gameOver);
        return;
    }
    
    // Increase and update the score.
    theTree.score++;
    document.getElementById("score").innerText = theTree.getScore();

}

// An initializer function, but only on the first click.
function begin() {

    // Prevent multiple clicks and remove the start screen.
    document.removeEventListener("click", begin);

    // Remove the loading prompt.
    document.getElementById('click-prompt').remove();
    
    // Create the tree queue.
    const theTree = new treeQueue();

    // Get the left, center, and right parts of the screen.
    var screenLeft = document.getElementById('screen-left');
    var screenCenter = document.getElementById("screen-center");
    var screenRight = document.getElementById('screen-right');
    var body = document.getElementById("body");
    
    buildTree(theTree, screenCenter);
    screenLeft.addEventListener("click", () => chop(theTree, screenCenter, body));
    screenRight.addEventListener("click", () => chop(theTree, screenCenter, body));


}