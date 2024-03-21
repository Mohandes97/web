// Declaring needed variables
let started
var e = document.getElementById("selectGridSize");
let algo = "A* Search"
let startButton
let screen
let graph
let rows = e.value
let cols = e.value
let resolution
let openSet
let closedSet
let source;
let destination;
let shortestPath
// let w;
// let h;
let sourceSelected
let destinationSelected
// sourceColor = color(87, 50, 168)
// destColor = color(140, 68, 20)

function resetCanvas() {
    console.log(new Node(0, 0))
    // Initializing variables
    started = false
    resolution = 30
    openSet = []
    closedSet = []
    shortestPath = []
    sourceSelected = false
    destinationSelected = false

    rows = floor(height / resolution);
    cols = floor(width / resolution);
    // w = width / cols;
    // h = height / rows;
    graph = twoDArray(rows, cols);
    startButton = document.getElementById("startButton")
    startButton.disabled = false
    startButton.innerHTML = "Visualize"
    startButton.onclick = start;
    let message = document.getElementById('message')
    message.innerHTML = ""

    // creating the graph 
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            graph[i][j] = new Node(i, j);
        }
    }
    // determining neighbors of each vertices
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            graph[i][j].addNeighbor();
        }
    }
    // Initializing random source and destination if not chosen
    if (source === undefined || destination === undefined) {

        x = Math.floor(Math.random() * cols / 2)
        y = Math.floor(Math.random() * rows)

        source = graph[x][y];

        x = Math.floor(Math.random() * (cols - Math.floor((cols / 2 + 1)))) + Math.floor((cols / 2 + 1));
        y = Math.floor(Math.random() * rows)

        destination = graph[x][y];
    }
    // otherwise Reinitializing old source & destination from graph's new objects
    else {
        graph.forEach(row => {
            row.forEach((node) => {
                if (node.i === source.i && node.j === source.j) {
                    source = node
                }
                if (node.i === destination.i && node.j === destination.j) {
                    destination = node
                }
            })
        })
    }
    //making sure source and destination aren't obstacls;
    source.obstacle = false;
    destination.obstacle = false;

    background(255);
    // revealing the canvas on screen
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            graph[i][j].show(255);
        }
    }
    source.show(color(87, 50, 168));
    destination.show(color(140, 68, 20));
    noLoop();
    console.log(openSet)
}

function Node(i, j) {
    this.i = i;
    this.j = j;
    this.x = this.i * resolution;
    this.y = this.j * resolution;
    this.r = resolution - 1;

    // needed for A*
    this.f = 0;
    this.g = 0;
    this.h = 0;

    // // needed for Dijkstra
    // this.d = Infinity

    this.obstacle = false;
    this.parent = undefined;
    this.neighbors = []
    this.dragging = false

    this.show = (color) => {
        console.log(color)
        let x = this.x;
        let y = this.y;
        let r = this.r;
        if (this.obstacle) {
            fill(128, 128, 128);
        }
        else {
            fill(color);
        }
        // fill(color);
        stroke(66, 148, 255, 90);
        strokeWeight(1);
        rect(x, y, r, r);
    }
    this.addNeighbor = () => {

        let i = this.i;
        let j = this.j;
        //Orthogonal neighbors
        if (i > 0) this.neighbors.push(graph[i - 1][j]);
        if (i < cols - 1) this.neighbors.push(graph[i + 1][j]);
        if (j > 0) this.neighbors.push(graph[i][j - 1]);
        if (j < rows - 1) this.neighbors.push(graph[i][j + 1]);
        //Diagonal Neighbors
        // if (i > 0 && j > 0) this.neighbors.push(graph[i - 1][j - 1]);
        // if (i < cols - 1 && j < rows - 1) this.neighbors.push(graph[i + 1][j + 1]);
        // if (i > 0 && j < rows - 1) this.neighbors.push(graph[i - 1][j + 1]);
        // if (i < cols - 1 && j > 0) this.neighbors.push(graph[i + 1][j - 1]);
    }

    this.clicked = () => {
        if (sourceSelected) {
            // if(this == source){
            this.show(color(87, 50, 168))

            // source = this
            // srcORdstClicked = false
        }
        else if (destinationSelected) {
            this.show(color(140, 68, 20))
        }
        else if (!this.obstacle) {
            this.obstacle = true;
            this.show(color(128, 128, 128));
        }
        // else{
        //     this.obstacle = false;
        //     this.show(color(255,255,255));
        // }

    }
}

function twoDArray(rows, cols) {
    let arrays = new Array(cols);
    for (let i = 0; i < arrays.length; i++) {
        arrays[i] = new Array(rows)
    }
    return arrays;
}

function windowResized() {
    centerCanvas();
}

function centerCanvas() {
    var x = e.value;
    var y = e.value;
    screen.position(x, y);
}

function setup() {
    // making the canvas
    screen = createCanvas(windowWidth - (windowHeight * 0.05), windowHeight - (windowHeight * 0.20));
    screen.parent("sketch01");
    centerCanvas();
    // startButton.parent("sketch01");
    resetCanvas()
}

function initialize() {
    openSet.push(source);
}

function BFSorDFS_initialize() {
    openSet.push(source);
    closedSet.push(source)

}
function draw() {
    if (started) {
            if (openSet.length > 0) {
                current = lowestFscoreNode();
                if (current == destination) {
                    noLoop();
                    console.log("We're Done!")
                }

                //removing the "current" vertex from openSet and adding it to closedSet
                var removeIndex = openSet.map(function (item) { return item; }).indexOf(current);
                openSet.splice(removeIndex, 1);
                closedSet.push(current);

                for (neighbor of current.neighbors) {
                    // Checking to see if the node is valid
                    if (!closedSet.includes(neighbor) && !neighbor.obstacle) {
                        gScore = current.g + heuristic(neighbor, current);
                        let isGbetter = false;
                        if (openSet.includes(neighbor)) {
                            if (gScore < neighbor.g) {
                                neighbor.g = gScore;
                                isGbetter = true;
                            }
                        }
                        else {
                            neighbor.g = gScore;
                            isGbetter = true;
                            openSet.push(neighbor);
                        }
                        if (isGbetter) {
                            neighbor.h = heuristic(neighbor, destination);
                            neighbor.f = neighbor.g + neighbor.h;
                            neighbor.parent = current;
                        }
                    }
                }

            }
            else {
                console.log('no solution');
                noLoop();
                return;
            }

        background(255);

        // revealing the canvas on screen
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                graph[i][j].show(255);
            }
        }

        //Coloring the visited, unvisited vertices and the shortest path
        for (node of openSet) {
            if(algo === "Dijkstra"){
                if(node.d != Infinity){
                    node.show(color(45, 196, 129));    
                }
            }
            else{
                node.show(color(45, 196, 129));
            }
        }
        for (node of closedSet) {
            node.show(color(255, 0, 0, 50));
        }
        //initialize shortestPath array first
        shortestPath = [];
        let temp = current;
        shortestPath.push(temp);
        while (temp.parent) {
            shortestPath.push(temp.parent);
            temp = temp.parent;
        }
        // for (Node of shortestPath) {
        //     Node.show(color(246, 196, 76));
        // }
        noFill();
        stroke(255, 0, 200);
        strokeWeight(4);
        beginShape();
        for (path of shortestPath) {
            vertex(path.i * resolution + resolution / 2, path.j * resolution + resolution / 2);
        }
        endShape();
        source.show(color(87, 50, 168));
        destination.show(color(140, 68, 20));
    }

}



function start() {
    initialize()

    started = true;
    startButton.disabled = true
    loop();
}

function throwObstacles() {
  resetCanvas()
    // It maintains obstacle's distribution in the graph
    let weights = [
        ["Obstacle", 30],
        ["Non Obstacle", 70]
    ]
    console.log(weights[1][1])
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (graph[i][j] != source && graph[i][j] != destination) {
                // taking decision if we should make this node an obstacle or not
                let decision = weightedRandom(weights)
                if (decision === "Obstacle") {
                    graph[i][j].obstacle = true
                    graph[i][j].show()
                }
            }
        }
    }
}

function mouseDragged() {
    if(started){
        return
    }
    console.log("clicked");
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            //let d = dist(mouseX, mouseY, graph[i][j].x, graph[i][j].y);
            if (mouseX >= graph[i][j].x && mouseX <= graph[i][j].x + graph[i][j].r && mouseY >= graph[i][j].y && mouseY <= graph[i][j].y + graph[i][j].r) {
                console.log("in IF");
                if (graph[i][j] != source && graph[i][j] != destination) {
                    graph[i][j].clicked();
                }
                if (sourceSelected) {
                    console.log("HERE")
                    // srcORdstClicked = true
                    // change prev source's color
                    source.show(255)
                    source = graph[i][j]
                    // source.show(color(87, 50, 168))
                    graph[i][j].clicked();
                }
                if (destinationSelected) {
                    // change prev source's color
                    destination.show(255)
                    destination = graph[i][j]
                    // source.show(color(87, 50, 168))
                    graph[i][j].clicked();
                }
            }
        }
    }
}

function mousePressed() {
    if(started){
        return
    }
    console.log("clicked2");
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            //let d = dist(mouseX, mouseY, graph[i][j].x, graph[i][j].y);
            if (mouseX >= graph[i][j].x && mouseX <= graph[i][j].x + graph[i][j].r && mouseY >= graph[i][j].y && mouseY <= graph[i][j].y + graph[i][j].r) {
                if (graph[i][j] != source && graph[i][j] != destination) {
                    console.log("in IF");
                    console.log(graph[i][j])
                    console.log(source)
                    console.log(graph[i][j] === source)
                    graph[i][j].clicked();
                }
                else {
                    if (source === graph[i][j]) {
                        sourceSelected = true
                    }
                    if (destination === graph[i][j]) {
                        destinationSelected = true
                    }
                    // console.log("HERE")
                    // srcORdstClicked = true
                    // change prev source's color
                    // source.show(255)
                    // source = graph[i][j]
                    // source.show(color(87, 50, 168))
                    // graph[i][j].clicked();
                }
            }
        }
    }
}

function mouseReleased() {
    if (sourceSelected || destinationSelected) {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                //let d = dist(mouseX, mouseY, graph[i][j].x, graph[i][j].y);
                if (mouseX >= graph[i][j].x && mouseX <= graph[i][j].x + graph[i][j].r && mouseY >= graph[i][j].y && mouseY <= graph[i][j].y + graph[i][j].r) {
                    if (sourceSelected) {
                        if (graph[i][j] === destination) {
                            source = graph[i - 1][j]
                            source.obstacle = false
                            graph[i][j].show(color(140, 68, 20))
                            source.show(color(87, 50, 168))
                            sourceSelected = false
                        }
                        else {
                            source = graph[i][j]
                            source.obstacle = false
                            source.show(color(87, 50, 168))
                            sourceSelected = false
                        }
                    }
                    else {
                        if (graph[i][j] === source) {

                            destination = graph[i - 1][j]
                            destination.obstacle = false
                            source.show(color(87, 50, 168))
                            destination.show(color(140, 68, 20))
                            destinationSelected = false
                        }
                        else {
                            destination = graph[i][j]
                            destination.obstacle = false
                            destination.show(color(140, 68, 20))
                            destinationSelected = false
                        }
                    }
                }
            }
        }
    }
}

function heuristic(node, goal) {
    //euclidean distance
    // dx = abs(node.x - goal.x);
    // dy = abs(node.y - goal.y);
    // return 1 * sqrt(dx * dx + dy * dy);

    //Manhattan distance
    dx = abs(node.x - goal.x);
    dy = abs(node.y - goal.y);
    return 1 * (dx + dy);


    // let d = dist(a.i, a.j, b.i, b.j);
    // let d = abs(a.i - b.i) + abs(a.j - b.j);
    // return d;
}

function lowestFscoreNode() {
    let minNode = openSet[0];
    for (node of openSet) {
        if (node.f < minNode.f) {
            minNode = node;
        }
    }
    return minNode;
}

function lowestDscoreNode() {
    let minNode = openSet[0];
    for (node of openSet) {
        if (node.d < minNode.d) {
            minNode = node;
        }
    }
    return minNode;
}

function lowestHeuristicNode() {
    let minNode = openSet[0];
    for (node of openSet) {
        if (node.h < minNode.h) {
            minNode = node;
        }
    }
    return minNode;
}

function weightedRandom(data) {
    // First, we loop the main dataset to count up the total weight. We're starting the counter at one because the upper boundary of Math.random() is exclusive.
    let total = 1;
    for (let i = 0; i < data.length; ++i) {
        total += data[i][1];
    }

    // Total in hand, we can now pick a random value akin to our
    // random index from before.
    const threshold = Math.floor(Math.random() * total);

    // Now we just need to loop through the main data one more time
    // until we discover which value would live within this
    // particular threshold. We need to keep a running count of
    // weights as we go, so let's just reuse the "total" variable
    // since it was already declared.
    total = 0;
    for (let i = 0; i < data.length; ++i) {
        // Add the weight to our running total.
        total += data[i][1];

        // If this value falls within the threshold, we're done!
        if (total >= threshold) {
            return data[i][0];
        }
    }
}
