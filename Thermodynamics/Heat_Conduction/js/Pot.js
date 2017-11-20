/*
 * File: Pot.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

var METAL_COLOR = 52;
var INSIDE_COLOR = 128;
var WATER_COLOR = 'rgba(63, 191, 189, 0.62)';

var QUARTS_WATER_IN_POT = 10;
var WEIGHT_1_QUART_WATER_IN_POUNDS = 2;

class Pot{
  constructor(pos) {
    Pot.weightOfWater = QUARTS_WATER_IN_POT * WEIGHT_1_QUART_WATER_IN_POUNDS;
    Pot.width = 300; // Width for mathematical calculations

    this.pos = pos;
    this.metalColor = METAL_COLOR;
    this.insideColor = INSIDE_COLOR;
    this.waterColor = WATER_COLOR;
    this.potHeight = 0.34 * windowHeight;
    this.potWidth = this.potHeight;
    this.potThickness = 20;
    this.anchorPointDiameter = 75;//this.potHeight / 3.5;
    this.steam = new Steam();
    this.hasWater = false;
    
    this.waterLevelFromTop = 0.05 * windowHeight;
    // Calculate position of anchorpoint relative to pot pos
    this.anchorPoint = {x:0, y:0};
    this.locateAnchorPoint();
  }

  draw() {
  	noStroke();
  	strokeWeight(3);
    fill(this.metalColor);
  	rect(this.pos.x,this.pos.y,this.potWidth,this.potHeight); // Pot body
  	ellipse(this.anchorPoint.x,this.anchorPoint.y, this.anchorPointDiameter); // Handle joints
    fill(this.insideColor);
    rect(this.pos.x + this.potThickness, this.pos.y, this.potWidth - 
      this.potThickness * 2, this.potHeight - this.potThickness); // Inside of pot

    // Draw water inside pot
    if (this.hasWater) {
      fill(this.waterColor);
      rect(this.pos.x + this.potThickness, this.pos.y + this.waterLevelFromTop, this.potWidth - this.potThickness * 2,
        this.potHeight - this.potThickness - this.waterLevelFromTop);
      fill(this.insideColor);
    }
  }

  getHandleAnchorPoint(){
    return this.anchorPoint;
  }

  locateAnchorPoint(){
    this.anchorPoint.y = this.pos.y + this.anchorPointDiameter / 2;
    this.anchorPoint.x = this.pos.x;
  }
  setPosRelativeToHandle(pos){
  }
}
