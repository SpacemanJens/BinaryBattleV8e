
  
  class Flight {
    constructor(config) {
      this.playerNumber = config.playerNumber;
      this.playerName = config.playerName;
      this.x = config.x;
      this.y = config.y;
      this.globalX = config.globalX;
      this.globalY = config.globalY;
      this.d = config.d;
      this.xMouse = config.xMouse;
      this.yMouse = config.yMouse;
      this.spawnX = config.spawnX;
      this.spawnY = config.spawnY;
      this.spawnGlobalX = config.spawnGlobalX;
      this.spawnGlobalY = config.spawnGlobalY;
      this.color = config.color;
      // Set buls to an empty array by default
      this.buls = config.buls || [];
      // Initialize hits array with 15 elements, all set to 0
      this.hits = config.hits || Array(15).fill(0);
      this.rotation = config.rotation;
      this.planetIndex = config.planetIndex;
    }
  
    draw() {
      this.drawFlight();
      this.drawBullets();
      this.drawScore();
    }
  
    drawFlight() {
        gameCanvas.fill(this.color);
        gameCanvas.push();
        gameCanvas.imageMode(CENTER);
        gameCanvas.translate(this.x, this.y);
      let head = createVector(
        this.xMouse - this.x,
        this.yMouse - this.y,
      ).normalize().heading();
      gameCanvas.rotate(head + 1.555);
      gameCanvas.rect(-10, -10, 30, 30);
      gameCanvas.rect(0, -15, 10, 15);
      gameCanvas.text("x: " + int(this.x) + ", y: " + int(this.y) + " globalX: " + int(this.globalX) + " globalY: " + int(this.globalY), 50, 0);
      gameCanvas.text("RealX: " + int(this.x + this.globalX) + ", RealY: " + int(this.y + this.globalY), 50, 30);
      gameCanvas.pop();
    }
  
    drawBullets() {
      if (this.buls) {
        this.buls.forEach(bullet => {
          this.drawBullet(bullet);
        });
      }
    }
  
    drawBullet(bullet) {
      gameCanvas.fill('yellow');
      gameCanvas.push();
      gameCanvas.imageMode(CENTER);
      gameCanvas.translate(bullet.x, bullet.y);
      let head = createVector(
        bullet.xMouseStart - bullet.xStart,
        bullet.yMouseStart - bullet.yStart,
      ).normalize().heading();
      gameCanvas.rotate(head + 1.555);
      gameCanvas.rect(-3, -3, 10, 10);
      gameCanvas.pop();
    }
  
    drawScore() {
      gameCanvas.fill(this.color);
      xText += 30;
      let playerHits = 0;
      for (let i = 0; i < this.hits.length; i++) {
        if (i != this.playerNumber) {
          playerHits += this.hits[i];
        }
      }
      let canonHits = 0;
      if (shared.canonTowerHits && this.playerName !== "observer") {
        canonHits = shared.canonTowerHits ? -shared.canonTowerHits[this.playerNumber] : 0;
      }
      gameCanvas.text(this.playerName + " (" + playerHits + ", " + canonHits + ")", 1040, xText);
    }
  
    shoot() {
      let bullet = {
        x: this.x,
        y: this.y,
        xStart: this.x,
        yStart: this.y,
        xMouseStart: this.xMouse,
        yMouseStart: this.yMouse
      };
      this.buls.push(bullet);
    }
  
    moveBullets() {
      for (let i = this.buls.length - 1; i >= 0; i--) {
        let bullet = this.buls[i];
        let bulletVector = createVector(
          int(bullet.xMouseStart) - bullet.xStart,
          int(bullet.yMouseStart) - bullet.yStart,
        ).normalize();
        bullet.x += bulletVector.x * parseInt(shared.bulletSpeed);
        bullet.y += bulletVector.y * parseInt(shared.bulletSpeed);
  
        if (!onScreen(bullet.x, bullet.y)) {
          this.buls.splice(i, 1);
        }
      }
    }
  
    syncFromShared(sharedFlight) {
      //        Object.assign(this, sharedFlight);
      this.x = sharedFlight.x;
      this.y = sharedFlight.y;
      this.globalX = sharedFlight.globalX;
      this.globalY = sharedFlight.globalY;
      this.xMouse = sharedFlight.xMouse;
      this.yMouse = sharedFlight.yMouse;
      // Update buls to be an empty array if not provided
      this.buls = sharedFlight.buls || [];
      this.hits = sharedFlight.hits || Array(15).fill(0);
      this.rotation = sharedFlight.rotation;
      this.planetIndex = sharedFlight.planetIndex;
    }
  }
  
  class Canon {
    constructor(config) {
      this.objectNumber = config.objectNumber;
      this.objectName = config.objectName;
      this.x = config.x;
      this.y = config.y;
      this.globalX = config.globalX;
      this.globalY = config.globalY;
      this.d = config.d;
      this.spawnX = config.spawnX;
      this.spawnY = config.spawnY;
      this.color = config.color;
      this.buls = config.buls || [];
      this.hits = config.hits || Array(15).fill(0);
      this.rotation = config.rotation;
      this.planetIndex = config.planetIndex;
      this.angle = 0; // Add angle for movement
      this.amplitude = 50; // Movement range
      this.speed = 0.02; // Movement speed
      this.lastShotTime = 0;  // Add this line
    }
  
    draw() {
      this.drawCanonTower();
      this.drawBullets();
      this.drawScore();
    }
  
    move() {
      this.angle += this.speed;
      this.x = this.spawnX + sin(this.angle) * this.amplitude;
      this.y = this.spawnY + cos(this.angle * 0.7) * this.amplitude; // Different speed for y
    }
  
    drawCanonTower() {
      gameCanvas.fill(this.color);
      gameCanvas.push();
      gameCanvas.imageMode(CENTER);
      gameCanvas.translate(this.x, this.y);
      // Fixed: use circle with correct parameters instead of extra argument
      gameCanvas.circle(0, 0, 30);
      gameCanvas.rect(0, -15, 10, 15);
      gameCanvas.pop();
    }
  
    drawBullets() {
      if (this.buls) {
        this.buls.forEach(bullet => {
          this.drawBullet(bullet);
        });
      }
    }
  
    drawBullet(bullet) {
      gameCanvas.fill('yellow');
      gameCanvas.push();
      gameCanvas.imageMode(CENTER);
      gameCanvas.translate(bullet.x, bullet.y);
      let head = createVector(
        bullet.xMouseStart - bullet.xStart,
        bullet.yMouseStart - bullet.yStart,
      ).normalize().heading();
      gameCanvas.rotate(head + 1.555);
      gameCanvas.rect(-3, -3, 10, 10);
      gameCanvas.pop();
    }
  
    drawScore() {
      gameCanvas.fill(0);
      xText += 30;
      const totalHits = this.hits.reduce((a, b) => a + b, 0);
      gameCanvas.text(this.objectName + " (" + totalHits + ")", 960, xText);
    }
  
    findNearestFlight(flights) {
      let nearestFlight = null;
      let minDistance = Infinity;
  
      flights.forEach(flight => {
        const distance = dist(this.x, this.y, flight.x, flight.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestFlight = flight;
        }
      });
  
      return nearestFlight;
    }
  
    shoot(nearestFlight) {
      if (!nearestFlight) return;
  
      let bullet = {
        x: this.x,
        y: this.y,
        xStart: this.x,
        yStart: this.y,
        xMouseStart: nearestFlight.x,
        yMouseStart: nearestFlight.y
      };
      this.buls.push(bullet);
    }
  
    moveBullets() {
      for (let i = this.buls.length - 1; i >= 0; i--) {
        let bullet = this.buls[i];
        let bulletVector = createVector(
          int(bullet.xMouseStart) - bullet.xStart,
          int(bullet.yMouseStart) - bullet.yStart,
        ).normalize();
        bullet.x += bulletVector.x * (parseInt(shared.bulletSpeed) * 2);
        bullet.y += bulletVector.y * (parseInt(shared.bulletSpeed) * 2);
  
        if (!onScreen(bullet.x, bullet.y)) {
          this.buls.splice(i, 1);
        }
      }
    }
  
    checkCollisionsWithFlights(flights) {
      for (let i = this.buls.length - 1; i >= 0; i--) {
        let bullet = this.buls[i];
  
        flights.forEach((flight) => {
          if (flight.x >= 0) {  // Only check visible flights
            let d = dist(flight.x, flight.y, bullet.x, bullet.y);
            if (d < (flight.d + gameConstants.bulletDiameter) / 2) {
              this.hits[flight.playerNumber]++;
              this.buls.splice(i, 1);
            }
          }
        });
      }
    }
  
    syncFromShared(sharedFlight) {
      Object.assign(this, sharedFlight);
    }
  }

  /*
  function setup() {
    createCanvas(1200, 1000);
  
    // Create headline and dropdown for tower count
    fill(0);
    text('Number of Towers:', 10, 55);
    towerCountSelect = createSelect();
    towerCountSelect.position(20, 70);
    towerCountSelect.option('3');
    towerCountSelect.option('6');
    towerCountSelect.option('9');
    towerCountSelect.option('12');
    towerCountSelect.option('15');
    towerCountSelect.option('18');
  
    if (partyIsHost()) {
      towerCountSelect.changed(updateTowerCount);
    }
  
    // Create headline and dropdown for shooting interval
    text('Shooting Interval:', 10, 115);
    shootingIntervalSelect = createSelect();
    shootingIntervalSelect.position(20, 130);
    Object.keys(gameConstants.shootingIntervals).forEach(key => {
      shootingIntervalSelect.option(key);
    });
    shootingIntervalSelect.selected('Normal (1s)');
  
    // Create headline and dropdown for bullet speed
    text('Bullet Speed:', 10, 175);
    bulletSpeedSelect = createSelect();
    bulletSpeedSelect.position(20, 190);
    bulletSpeedSelect.option('1');   // slow
    bulletSpeedSelect.option('2');   // normal
    bulletSpeedSelect.option('3');   // fast
    bulletSpeedSelect.option('4');   // very fast
    bulletSpeedSelect.selected('2');
  
    if (me.playerName === "observer") {
      joinGame();
      return;
    }
  
    // Initial tower generation
    if (partyIsHost()) {
      updateTowerCount();
    }
    previousTowerCount = parseInt(towerCountSelect.value()); // Initialize here, after dropdown is created
  }
  
  function updateTowerCount() {
    const count = parseInt(towerCountSelect.value());
    gameObjects = generateTowers(count);
    shared.gameObjects = gameObjects.map(tower => ({
      x: tower.x,
      y: tower.y,
      buls: [],
      angle: 0,
      hits: Array(15).fill(0),
      lastShotTime: 0
    }));
  }
  
  function generateTowers(count) {
    const towers = [];
    const radius = 200; // Distance from center
    const angleStep = (2 * PI) / count;
  
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const x = gameConstants.centerX + radius * cos(angle);
      const y = gameConstants.centerY + radius * sin(angle);
  
      towers.push(new Canon({
        objectNumber: i,
        objectName: `canon${i}`,
        x: x,
        y: y,
        r: 30,
        xMouse: 0,
        yMouse: 0,
        spawnX: x,
        spawnY: y,
        color: 'grey',
      }));
    }
    return towers;
  }
  */