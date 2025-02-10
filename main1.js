const sketchContainer = document.getElementById("sketch-container");


let solarSystem;
//let fixedPlanet;
let stars = [];

let me;
let guests;
let gameState = "PLAYING"; // TITLE, PLAYING
let shared;
let shootingIntervalValue = 1000
let bulletSpeedValue = 1
let canonTowerCount = 0;
let counter1 = 1;
let xGameCanvas = 650;
let yGameCanvas = 30;


const gameConstants = {
  planetDiameter: 900,
  bulletSpeed: 2,
  bulletDiameter: 10,
  centerX: 500,  // Add center coordinates
  centerY: 500,
  shootingIntervals: {
    'Extreem (0.1s)': 100,
    'Very fast (0.3s)': 300,
    'Fast (0.5s)': 500,
    'Normal (1s)': 1000,
    'Slow (2s)': 2000,
    'Very Slow (3s)': 3000
  }
}

let counter = 0
let xText = 0;

let towerCountSelect; // Add dropdown variable
let shootingIntervalSelect; // Add new dropdown variable
let bulletSpeedSelect;  // <-- new dropdown
let gameObjects = []; // Initialize as empty array
// Convert initial flight configs to Flight instances
let flights = [];
const playerColors = ['green', 'blue', 'red', 'yellow', 'purple', 'orange', 'pink', 'brown', 'cyan', 'magenta', 'lime', 'teal', 'lavender', 'maroon', 'olive']

let previousTowerCount; // Store the previous tower count - Declare here 

function preload() {
  partyConnect("wss://p5js-spaceman-server-29f6636dfb6c.herokuapp.com", "jkv-BinaryBattleV8e");

  shared = partyLoadShared("shared", {
    gameObjects: [],  // Start with empty array
    canonTowerHits: Array(15).fill(0),
    bulletSpeed: 2  // Add default bullet speed
  });

  me = partyLoadMyShared({ playerName: "observer" });
  guests = partyLoadGuestShareds();
}

function createCanonTowers() {
  for (let i = 0; i < canonTowerCount; i++) {
    const canon = new Canon({
      objectNumber: i,
      objectName: `canon${i}`,
      x: 200 + (i * 200), // Space them evenly
      y: 500,             // Position near bottom
      r: 30,
      color: 'grey',
      spawnX: 50 + random(1100),
      spawnY: 50 + random(500),
      spawnGlobalX: 50,
      spawnGlobalY: 50
    });
    gameObjects.push(canon);
  }
  // Initialize shared state with canon towers
  if (partyIsHost()) {
    shared.gameObjects = gameObjects.map(canon => ({
      x: canon.x,
      y: canon.y,
      buls: [],
      angle: canon.angle,
      lastShotTime: 0,
      hits: Array(15).fill(0)
    }));
  }
}

function setup() {
  //  createCanvas(2500, 1200);
  solarSystem = new SolarSystem(xSolarSystemCenter = 1250, ySolarSystemCenter = 900);

  //fixedPlanet = new FixedPlanet(x = 300, y = 300, d = 200, color = [0, 0, 255]);

  for (let i = 0; i < 300; i++) {
    stars.push(new BackgroundStar(random(2500), random(1200)));
  }

  createFlights();
  createCanonTowers(); // Add this line after createFlights()

  mainCanvas = createCanvas(2500, 1200);
  gameCanvas = createGraphics(1200, 600);

  if (me.playerName === "observer") {
    joinGame();
    return;
  }
}

function draw() {

  background(0);
  push();
  angleMode(DEGREES);

  for (let s of stars) {
    s.move();
    s.show();
  }

  solarSystem.update();
  solarSystem.draw();
  pop()
  //  fixedPlanet.draw();

  angleMode(RADIANS);
  drawGameCanvas();
  //  image(gameCanvas, 650, 30);
  image(gameCanvas, xGameCanvas, yGameCanvas);
}

function drawGameCanvas() {
  gameCanvas.background(30);

  //  gameCanvas.stroke(80);
  gameCanvas.strokeWeight(1500);
  gameCanvas.noFill();
  gameCanvas.ellipse(-me.globalX + 1000, -me.globalY + 1000, 2000 + 1500);
  gameCanvas.strokeWeight(0);

  gameCanvas.fill(me.color);
  gameCanvas.textSize(18)
  gameCanvas.text(me.playerName, 20, 30);
  if (partyIsHost()) {
    gameCanvas.text(me.playerName + " (Host)", 20, 30);
  } else {
    gameCanvas.text(me.playerName, 20, 30);
  }

  //  if (gameState === "PLAYING") {
  stepLocal();

  if (me.playerName != "observer") {
    moveMe();
    checkCollisions();

  }

  drawGame();

  if (partyIsHost()) {
    gameObjects.forEach((canon, index) => {

      canon.move();

      const currentTime = millis();
      const selectedInterval = shootingIntervalValue;

      // Check if selectedInterval is a valid number
      if (typeof selectedInterval === 'number') {
        if (currentTime - canon.lastShotTime > selectedInterval) {
          const activeFlights = flights.filter(f => f.x >= 0); // Only target visible flights - changed filter

          if (activeFlights.length > 0) {
            const nearestFlight = canon.findNearestFlight(activeFlights);

            if (nearestFlight) {
              canon.shoot(nearestFlight);
              canon.lastShotTime = currentTime;
            }
          }
        }
      } else {
        console.warn("Invalid shooting interval:", shootingIntervalSelect.value());
      }

      canon.moveBullets(); // Move bullets before drawing
      canon.checkCollisionsWithFlights(flights);  // Add this line

      // Sync to shared state
      shared.gameObjects[index] = {
        ...shared.gameObjects[index],
        x: canon.x,
        y: canon.y,
        //          buls: JSON.parse(JSON.stringify(canon.buls)), // Deep copy
        buls: canon.buls, // Deep copyfhg
        angle: canon.angle,
        lastShotTime: canon.lastShotTime,
        hits: canon.hits, // Update shared state to include hits
      };
    });

    // Calculate total hits from canon towers for each player
    let totalCanonHits = Array(15).fill(0);
    gameObjects.forEach(canon => {
      for (let i = 0; i < totalCanonHits.length; i++) {
        totalCanonHits[i] += canon.hits[i];
      }
    });
    shared.canonTowerHits = totalCanonHits;
  }
  // Clients sync from shared state
  else {
    // Ensure client has same number of towers as host
    while (gameObjects.length < shared.gameObjects.length) {
      const i = gameObjects.length;
      gameObjects.push(new Canon({
        objectNumber: i,
        objectName: `canon${i}`,
        x: shared.gameObjects[i].x,
        y: shared.gameObjects[i].y,
        r: 30,
        color: 'grey',
        spawnX: shared.gameObjects[i].x,
        spawnY: shared.gameObjects[i].y,
        spawnGlobalX: 0,
        spawnGlobalY: 0
      }));
    }
    // Remove extra towers if host has fewer
    while (gameObjects.length > shared.gameObjects.length) {
      gameObjects.pop();
    }
    // Update existing towers
    gameObjects.forEach((canon, index) => {
      canon.x = shared.gameObjects[index].x;
      canon.y = shared.gameObjects[index].y;
      canon.buls = shared.gameObjects[index].buls;
      canon.angle = shared.gameObjects[index].angle;
      canon.lastShotTime = shared.gameObjects[index].lastShotTime; // Sync lastShotTime
      canon.hits = shared.gameObjects[index].hits || Array(15).fill(0);
    });
  }

  // Draw Canon Towers for all players
  gameObjects.forEach(canon => {
    canon.drawCanonTower();
    canon.drawBullets();
    canon.drawScore();
  });
}


function stepHost() {
}
function moveMe() {
  // Local movement (game canvas)
  let localOffX = 0;
  let localOffY = 0;
  if (keyIsDown(70)) { localOffX = -3 } // F
  if (keyIsDown(72)) { localOffX = 3 }  // H
  if (keyIsDown(84)) { localOffY = -3 } // T
  if (keyIsDown(71)) { localOffY = 3 }  // G

  // Global movement (fixedPlanet)
  const globalSpeed = 3;
  let gOffX = 0, gOffY = 0;
  if (keyIsDown(65)) { gOffX = -globalSpeed } // A
  if (keyIsDown(68)) { gOffX = globalSpeed }  // D
  if (keyIsDown(87)) { gOffY = -globalSpeed } // W
  if (keyIsDown(83)) { gOffY = globalSpeed }  // S

  if (me.x <= 3 && me.globalX > 0 && localOffX < 0) {
    gOffX = -globalSpeed;
  }
  if (me.y <= 3 && me.globalY > 0 && localOffY < 0) {
    gOffY = -globalSpeed;
  }
  if (me.x >= 1197 && me.globalX < 2000 && localOffX > 0) {
    gOffX = +globalSpeed;
  }
  if (me.y >= 597 && me.globalY < 2000 && localOffY > 0) {
    gOffY = +globalSpeed;
  }

  let xTemp = me.x;
  let yTemp = me.y;

  if (me.x + localOffX > 0 && me.x + localOffX < 1200) {
    xTemp = me.x + localOffX;
  }
  if (me.y + localOffY > 0 && me.y + localOffY < 600) {
    yTemp = me.y + localOffY;
  }

  let newGlobalX = me.globalX
  let newGlobalY = me.globalY
  if (me.globalX + gOffX > 0 && me.globalX + gOffX < 2000) {
    newGlobalX = me.globalX + gOffX;
  }
  if (me.globalY + gOffY > 0 && me.globalY + gOffY < 2000) {
    newGlobalY = me.globalY + gOffY;
  }

  if (solarSystem.fixedPlanet.onPlanet(xTemp + newGlobalX, yTemp + newGlobalY)) {
    me.globalX = newGlobalX;
    me.globalY = newGlobalY;
    me.x = xTemp;
    me.y = yTemp;
  }

  fill('blue')
  mainCanvas.text("mX: " + int(mouseX) + " ,mY: " + int(mouseY) + ", x:" + int(me.x) + ", y: " + int(me.y) + " globalX: " + int(me.globalX) + " globalY: " + int(me.globalY), mouseX, mouseY);

  me.xMouse = mouseX - 650;
  me.yMouse = mouseY - 30;

  // Update flight properties
  const myFlight = flights.find(f => f.playerName === me.playerName);
  if (myFlight) {
    myFlight.x = me.x;
    myFlight.y = me.y;
    myFlight.globalX = me.globalX;
    myFlight.globalY = me.globalY;
    myFlight.xMouse = me.xMouse;
    myFlight.yMouse = me.yMouse;
    myFlight.buls = [...me.buls];
    myFlight.moveBullets();
    me.buls = [...myFlight.buls];
  }
}

function onScreen(x, y) {
  return x > 0 && x < 1200 && y > 0 && y < 600;
}
function checkCollisions() {

  flights.forEach((flight) => {
    if (flight.playerName != me.playerName) {
      checkCollisionsWithFlight(flight);
    }
  });

}
function checkCollisionsWithFlight(flight) {

  for (let i = me.buls.length - 1; i >= 0; i--) {

    let bullet = me.buls[i];

    let d = dist(flight.x, flight.y, bullet.x, bullet.y);

    if (d < (flight.r + gameConstants.bulletDiameter) / 2) {
      me.hits[flight.playerNumber]++;
      me.buls.splice(i, 1);
    }
  }
}

function stepLocal() {

  flights.forEach(flight => {
    const guest = guests.find((p) => p.playerName === flight.playerName);
    if (guest) {
      flight.syncFromShared(guest);
    } else {
      flight.x = -32;
    }
  });
}

function mousePressed() {

  if (me.playerName === "observer")
    return

  const myFlight = flights.find(f => f.playerName === me.playerName);
  if (myFlight) {
    myFlight.shoot();
    me.buls = myFlight.buls;
  }
}

function drawGame() {

  xText = 0
  flights.forEach((flight) => {

    if (flight.x >= 0) {
      flight.draw();
      solarSystem.fixedPlanet.drawFlight(flight);

            console.log({flight})
            console.log({solarSystem})
            let planet = solarSystem.planets[flight.planetIndex];
            console.log({planet})
            planet.drawFlight(flight);
//        */
    }
  });
}

function createFlights() {
  for (let i = 0; i < 15; i++) {
    flights.push(new Flight({
      playerNumber: i,
      playerName: "player" + i,
      x: -1,
      y: -1,
      globalX: 0,
      globalY: 0,
      r: 30,
      xMouse: 0,
      yMouse: 0,
      //      spawnX: 50 + random(1000),
      //      spawnY: 50 + random(500),
      spawnX: 100 + random(1000),
      spawnY: 100 + random(400),
      spawnGlobalX: 300,
      spawnGlobalY: 300,
      color: playerColors[i % playerColors.length],
      buls: [],
      hits: Array(15).fill(0),
      rotation: 0,  
      planetIndex: 0
    }));
  }
}

function joinGame() {

  // don't let current players double join
  if (me.playerName.startsWith("player")) return;

  for (let flight of flights) {
    if (!guests.find((p) => p.playerName === flight.playerName)) {
      spawn(flight);
      me.playerName = flight.playerName;
      return;
    }
  }
}

function watchGame() {
  me.playerName = "observer";
}

function spawn(flight) {
  me.playerNumber = flight.playerNumber;
  me.playerName = flight.playerName;
  me.x = flight.spawnX;
  me.y = flight.spawnY;
  me.x = flight.spawnGlobalX;
  me.y = flight.spawnGlobalY;
  me.globalX = 0; // Start at fixedPlanet center
  me.globalY = 0;
  me.r = flight.r;
  me.rotation = flight.rotation;
  me.planetIndex = flight.planetIndex;
  me.color = flight.color;
  me.buls = [];
  me.hits = Array(15).fill(0);
}