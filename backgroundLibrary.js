class FixedPlanet {
  constructor(x, y, d, color) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.color = color;
  }

  draw() {
    fill("grey");
    circle(this.x, this.y, this.d);
  }

  onPlanet(xF, yF) {
    let posX = map(this.d / 2, 0, 200, 0, 2000);
    let posY = map(this.d / 2, 0, 200, 0, 2000);

    let distance = dist(xF, yF, posX, posY);
    let dMapped = map(this.d, 0, 200, 0, 2000);
    return distance < dMapped / 2;  // Return true if the point is inside the planet        
  }

  drawFlight(flight) {
    fill(flight.color);
    // Use only globalX/Y coordinates for positioning on fixedPlanet

    //    let posX = map(flight.globalX + flight.x,0,2000, 0, 200) + this.x - this.size / 2;
    //    let posY = map(flight.globalY + flight.y,0,2000, 0, 200) + this.y - this.size / 2;
    let posX = map(flight.globalX + flight.x, 0, 2000, 0, 200) + this.x - this.d / 2 + solarSystem.x;
    let posY = map(flight.globalY + flight.y, 0, 2000, 0, 200) + this.y - this.d / 2 + solarSystem.y;

    circle(posX, posY, 8);
  }
}

class CelestialObject {
  constructor(angle, distance, tiltEffect) {
    this.angle = angle;
    this.distance = distance;
    this.tiltEffect = tiltEffect;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  drawOrbit() {
    stroke(100);
    noFill();
    beginShape();
    for (let a = 0; a < 360; a++) {
      let x = cos(a) * this.distance;
      let y = sin(a) * this.distance * this.tiltEffect;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

class Planet extends CelestialObject {
  constructor(angle, baseSpeed, distance, tiltEffect, baseSize, color) {
    super(angle, distance, tiltEffect);
    this.baseSpeed = baseSpeed;
    this.baseSize = baseSize;
    this.color = color;
    this.size = baseSize;
  }

  update(speedMultiplier, planetSpeed) {
    this.angle += this.baseSpeed * speedMultiplier * planetSpeed;
  }

  draw() {
    fill(this.color[0], this.color[1], this.color[2]);
    noStroke();
    circle(this.x, this.y, this.size);
//    fill('yellow');
//    circle(this.x, this.y, this.baseSize);
  }
  onPlanet(xF, yF) {
    let posX = map(this.size / 2, 0, 200, 0, 2000);
    let posY = map(this.size / 2, 0, 200, 0, 2000);

    let distance = dist(xF, yF, posX, posY);
    //    console.log(int(distance));
    //    mainCanvas.fill(255)
    //    mainCanvas.text("Distance: " + distance, mouseX, mouseY + 40);
    let dMapped = map(this.size, 0, 200, 0, 2000);
    //console.log(int(dMapped));
    return distance < dMapped / 2;  // Return true if the point is inside the planet        
  }

  drawFlight(flight) {
  fill('yellow')
  circle(this.x + solarSystem.x, this.y + solarSystem.y, 6);
    //    fill(flight.color);
    fill('white');
    // Use only globalX/Y coordinates for positioning on fixedPlanet

    //    let posX = map(flight.globalX + flight.x,0,2000, 0, 200) + this.x - this.size / 2;
    //    let posY = map(flight.globalY + flight.y,0,2000, 0, 200) + this.y - this.size / 2;
//    let posX = map(flight.globalX + flight.x, 0, 2000, 0, 200) + this.x - this.d / 2 + solarSystem.x;
//    let posY = map(flight.globalY + flight.y, 0, 2000, 0, 200) + this.y - this.d / 2 + solarSystem.y;

   // posX = solarSystem.x + this.x + map(flight.globalX + flight.x, 0, 2000, 0, 200) - 40
   // posY = solarSystem.y + this.y + map(flight.globalY + flight.y, 0, 2000, 0, 200) - 40
 
//   let posX = map(flight.globalX + flight.x, 0, 2000, 0, 200) + this.x - this.size / 2 + solarSystem.x;
//   let posY = map(flight.globalY + flight.y, 0, 2000, 0, 200) + this.y - this.size / 2 + solarSystem.y;
   let posX = map(flight.globalX + flight.x, 0, 2000, 0, this.size) + this.x - this.size / 2 + solarSystem.x;
   let posY = map(flight.globalY + flight.y, 0, 2000, 0, this.size) + this.y - this.size / 2 + solarSystem.y;

   
    circle(posX, posY, 8);
    fill('purple');
    circle(this.x + solarSystem.x, this.y + solarSystem.y, 6);
    circle(this.size, posY - this.size, 8);
  }
}

class Star extends CelestialObject {
  constructor(orbit, mass) {
    super(0, orbit, 0.15);
    this.mass = mass;
  }

  drawStarEffect(x, y, hsb2, hsb3, hsb4, hsb5, fill1, fill2, fill3, fill4, cr, coronaEffect) {
    push();
    blendMode(BLEND);
    colorMode(HSB, hsb2, hsb3, hsb4, hsb5);
    blendMode(ADD);
    for (let d = 0; d < 1; d += 0.01) {
      fill(fill1, fill2, fill3, (1.1 - d * 1.2) * fill4);
      circle(x, y, cr * d + random(0, coronaEffect));
    }
    pop();
  }
}

class BlackHole extends Star {
  draw() {
    this.drawStarEffect(this.x, this.y, 1000, 100, 100, 710, 50, 100, 100, 30, 150, 10);
    fill(0);
    circle(this.x, this.y, 30);
  }
}

class YellowStar extends Star {
  draw() {
    fill(0);
    circle(this.x, this.y, 110);
    this.drawStarEffect(this.x, this.y, 430, 800, 1500, 1010, 50, 550, 300, 400, 300, 0);
  }
}

class SolarSystem {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.angleStars = 0;
    this.starSpeed = 0.5;
    this.planetSpeed = 0.2; // Add global planet speed control
    this.fixedPlanet = new FixedPlanet(300, 0, 200, [0, 0, 255]);
    this.planets = [
//      new Planet(10, 0.7, 400, 0.05, 40, [0, 102, 204]),
      new Planet(10, 0.7, 400, 0.05, 40, [0, 102, 204]),
      new Planet(90, 0.5, 700, 0.08, 50, [0, 122, 174]),
      new Planet(190, 0.4, 1100, 0.04, 45, [0, 142, 144]),
      new Planet(270, 0.3, 1400, 0.06, 55, [0, 162, 114]),
      new Planet(350, 0.25, 1800, 0.03, 60, [0, 182, 84])
    ];

    this.blackHole = new BlackHole(75, 5);
    this.yellowStar = new YellowStar(300, 1);
  }

  update() {
    this.angleStars += this.starSpeed;
    let totalMass = this.blackHole.mass + this.yellowStar.mass;

    // Update stars
    this.blackHole.updatePosition(
      cos(this.angleStars) * this.blackHole.distance * (this.yellowStar.mass / totalMass),
      sin(this.angleStars) * this.blackHole.distance * this.blackHole.tiltEffect
    );

    this.yellowStar.updatePosition(
      -cos(this.angleStars) * this.yellowStar.distance * (this.blackHole.mass / totalMass),
      -sin(this.angleStars) * this.yellowStar.distance * this.yellowStar.tiltEffect
    );

    // Update planets
    this.planets.forEach(planet => {
      let planetX = cos(planet.angle) * planet.distance;
      let planetY = sin(planet.angle) * planet.distance * planet.tiltEffect;

      let distanceFactor = map(planetY, 0, planet.distance * planet.tiltEffect, 1.5, 0.5);
      //distanceFactor= 3
      planet.size = planet.baseSize * (4 - distanceFactor);
      let speedMultiplier = map(distanceFactor, 0.5, 1.5, 1.5, 0.8);

      planet.update(speedMultiplier, this.planetSpeed);
      planet.updatePosition(planetX, planetY);
    });
  }

  draw() {
    // background(20);
    //      translate(width / 2 - 600, height / 2);
    translate(this.x, this.y);

    // Draw orbits
    //    this.planets.forEach(planet => planet.drawOrbit());

    // Sort and draw planets based on y position
    const frontPlanets = this.planets.filter(p => p.y >= 0);
    const backPlanets = this.planets.filter(p => p.y < 0);

    backPlanets.forEach(planet => planet.draw());

    if (this.yellowStar.y > 0) {
      this.blackHole.draw();
      this.yellowStar.draw();
    } else {
      this.yellowStar.draw();
      this.blackHole.draw();
    }

    frontPlanets.forEach(planet => planet.draw());
    this.fixedPlanet.draw();
  }
}

class BackgroundStar {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(0, 0.2);
    this.alpha = map(this.speed, 0, 0.2, 0, 200);
  }
  move() {
    this.x -= this.speed;

    if (this.x < 0) {
      this.x += width;
      this.y = random(height);
    }
  }

  show() {
    stroke(255, this.alpha);
    fill(255, this.alpha);

    if (this.speed > 0.25) {
      strokeWeight(2);
    } else {
      strokeWeight(1);
    }
    ellipse(this.x, this.y, 1, 1);
  }
}