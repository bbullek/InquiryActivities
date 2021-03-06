/*
 * File:    pumpscript.js
 * Purpose: To provide the animations and interactivity for the Pump Reversibility simulation
 *          (pump-reversibility.html)
 * Authors: Emily Ehrenberger (April 2012),
 *          Modified by Daniel Vasquez and Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 * Note:    This file makes use of the jQuery libraries (http://jquery.com/)
 */

$(document).ready(init);

var simulationStarted = false;

// Constants
var minRate = 2.0;//0.062; // Min rates don't work as intended atm
var maxRate = 13.9; // Found from ITT website
var g = 9.8; // m/s^2
var height = 50; // m

var pipeRadius = .026251; // m (using a schedule 40 steel pipe with 2.067 inch diameter)
var volWater = 100; // L

// Physics of water draining (also constants)
var drainV = height / Math.sqrt(2 * g * height); // m / s. Avg Velocity = D / t where D = .5 * g * t^2 and so drainV = D / Sqrt(2 * D * g)
var drainFrictionCoeff = calcFrictionCoeff(drainV); // Finds friction coefficient for draining water
var drainRate = Math.PI * pipeRadius * pipeRadius * drainV; // m^3 / s
var drainRateLiters = drainRate * 1000; // L / s
var drainEfficiency = 35;

// W absorbed by pump from drain = (Wfriction + Wkinetic - Wpotential) / PumpEfficiency
var drainWork = volWater * ( (drainV * drainV * drainFrictionCoeff * height / pipeRadius) + (drainV * drainV / 2) - (g * height * (drainEfficiency / 100)) );
var drainPower = drainRateLiters * ( (drainV * drainV * drainFrictionCoeff * height / pipeRadius) + (drainV * drainV / 2) - (g * height * (drainEfficiency / 100)) );
var drainTime = volWater / drainRateLiters * 1000; // in milliseconds; used for animation purposes

// Variables to hold inputs and calculation results
var pumpRate; // L/s
var pumpEff; // efficiency of pump
var pumpWork; // work done by pump
var powerRecovery; // proportion of work recovered via draining to work done by pump
var pumpTime; // in milliseconds; used for animation purposes

/*
****************************************************************************************************
*                                        Initialization                                            *
****************************************************************************************************
*/

/*
 * Function: init
 * Sets up the page when it is loaded, hiding elements that aren't supposed to be visible right away, and
 * attaching event handlers. Also clears or initializes input/output fields
*/
function init() {
  $("#openValve").hide();
  $("#openSideValve").hide();
  $("#pumpWorkArrow").hide(); //TODO Replace these arrows with indicator of work at pump (power consumption vs generation)
  $("#drainWorkArrow").hide();

  // Clear input fields and set input to NaN to mark that no input has been received yet
  $("#pumpRate").val("2");
  pumpRate = 2;

  // Clear output fields
  $("#pumpEff").html("");
  $("#pumpWork").html("");
  $("#drainWork").html("");
  $("#powerRecovery").html("");

  // Set the value of volumeLabel (set here rather than in the html just for ease of revision)
  $("#volumeLabel").html("" + volWater + " L");

  // Make sure all input elements are enabled (in case the user refreshes the page while some elements are disabled)
  $("#runButton").removeAttr("disabled");
  $("#resetButton").removeAttr("disabled");
  $("#skipButton").removeAttr("disabled");
  $("#skipButton").hide(); //TODO: Remove entirely or implement skip
  $("#pumpRate").removeAttr("disabled");

  // Register event handlers
  $("#pumpRate").on('change', getPumpRate);
  $("#runButton").on('click', runPump);
  $("#resetButton").on('click', resetPump);
  $("#skipButton").on('click', skip);
  $("#about").on('click', displayAboutInfo);
  $("#helpButton").on('click', displayHelp);

  // Generate the LiquidFun assets (particles and rigid bodies)
  initTestbed(); // Found in liquidfun/testbed.js
  disableForceFields(world.particleSystems[0].forceFields);
}

/*
****************************************************************************************************
*                                        Event Handlers                                            *
****************************************************************************************************
*/

/*
 * Event Handler Function: getPumpRate
 * Called when the user inputs a new value into the pumpRate field
 *
 * Validates the input value, changing the input field's value appropriately if the value entered is invalid.
 * Also clears output fields.
*/
function getPumpRate() {
  var input = $("#pumpRate").val();

  // If the entered value is not a valid number, keep the current pump rate and display that number in the input field.
  // If no valid pump rate as been entered, clear the input field
  if(isNaN(input) || input == "") {
    if(!isNaN(pumpRate)) {
      $("#pumpRate").val(pumpRate);
    }
    else {
      $("#pumpRate").val("");
    }
  }

  // If the input is outside the valid range, set the pump rate to the highest/lowest valid value
  // and update the display accordingly
  else if (input > maxRate) {
    pumpRate = maxRate;
    $("#pumpRate").val(maxRate);
  }
  else if (input < minRate) {
    pumpRate = minRate;
    $("#pumpRate").val(minRate);
  }

  // If input is valid, set pumpRate
  else {
    pumpRate = input;
  }

  $("#pumpEff").val("");
  $("#pumpWork").val("");
  $("#drainWork").val("");
  $("#powerRecovery").val("");
}

/*
 * Event Handler Function: resetPump
 * Called when the user clicks the "Reset" button
 *
 * Stops all animations, returns animation pictures to their initial state, and clears all output fields
*/
function resetPump() {
  finishDrain();
  disableForceFields(world.particleSystems[0].forceFields);
  testSwitch("TestLiquidTimer");

  // Clear output fields
  $("#pumpEff").html("");
  $("#pumpWork").html("");
  $("#drainWork").html("");
  $("#powerRecovery").html("");
}

/*
 * Event Handler Function: runPump
 * Called when the user clicks the "Run Pump" button
 *
 * If a valid pumpRate has been entered, initiates the animation sequence
*/
function runPump() {
  if (isNaN(pumpRate) || simulationStarted) return;

  // Ensure that animation components are in their initial state
  resetPump();
  openTank1(); // Remove the barrier at the bottom of tank 1
  openLowerPipe();

  for (i=0; i < world.particleSystems[0].forceFields.length; i++){
    world.particleSystems[0].forceFields[i].fm = pumpRate;
    world.particleSystems[0].forceFields[i].fm = pumpRate;
  }
  displayStats();


  pumpTime = volWater / pumpRate * 1000; // pump time in milliseconds

  // disable pumpRate input field and "Run Pump" button while animation is running
  // (leave "Reset" button enabled so users have a way to cancel the animation)
  $("#runButton").attr("disabled", "disabled");
  $("#pumpRate").attr("disabled", "disabled");
  simulationStarted = true;

  // begin the animation
  pumpWater();
  finishedPumpingID = startCheckingFinishedPumping(); //Declared globally
}

/*
 * Event Handler Method: displayAboutInfo
 * Displays a dialog box containing information about the program when the user clicks the "i" glyphicon button.
*/
function displayAboutInfo() {
  alert("This program was created by Emily Ehrenberger and Daniel Vasquez under the direction of Dr. " +
      "Margot Vigeant, Bucknell University Department of Chemical Engineering in 2012 and 2017-18 respectively.\n\n" +
      "The development of this program was funded by the National Science " +
      "Foundation Grant DUE-0717536 (2011).\n\n" +
      "The simulated pump was based on data from Gould Pumps Industrial Products.\n\n" +
      "Address any questions or comments to mvigeant@bucknell.edu.");
  return false;
}

/*
 * Event Handler Method: displayHelp
 * Displays a dialog box containing information about how to use the program when the user clicks the "?" glyphicon
 * button.
 */
function displayHelp() {
  alert("Enter a pump rate within the specified range and hit \"Run Pump\" to begin pumping the water " +
    "through the chamber.\n\nOnce the topmost tank has been filled, it will begin draining. " +
    "\n\nOnce the simulation has finished, results will be displayed in the box in the upper left."+
    " Click the \"Reset\" button to restart the simulation." + "Please report any bugs.");
}

/*
****************************************************************************************************
*                                      Animation Functions                                         *
****************************************************************************************************
*/

/*
 * Function: pumpWater
 * Runs the portion of the animation for pumping the water into the upper tank
*/
function pumpWater() {
  // Move the valves into their proper positions (open vs. closed) and show the image of water filling the pipe
  $("#closedValve").hide();
  $("#openValve").show();
  $("#drainWorkArrow").show();
}

/*
 * Function: pause
 * Runs the portion of the animation for pumping the water into the upper tank
*/
function pause() {
  // Move the valves into their proper positions (open vs. closed) and replace the image of water filling the pipe with the one appropriate
  // to the second tank only being full
  $("#closedValve").show();
  $("#openValve").hide();
  $("#drainWorkArrow").hide();
}

/*
 * Function: drainWater
 * Runs the portion of the animation for draining the water from the upper tank out of the system
*/
function drainWater() {
  //TODO: This pause temporarily fixes animation bugs with arrows
  pause();
  // Move the valves into their proper positions (open vs. closed) and show the images of water draining through the pipe
  $("#closedSideValve").hide();
  $("#openSideValve").show();
  $("#pumpWorkArrow").show();
  destroyForceFields();
  openDrainValve();
  finishedDrainingID = startCheckingFinishedDraining();
}

/*
 * Function: finishDrain
 * Cleans up after the draining animation, re-enables inputs, and displays outputs
*/
function finishDrain() {
  $("#runButton").removeAttr("disabled");
  $("#resetButton").removeAttr("disabled");
  $("#pumpRate").removeAttr("disabled");
  $("#skipButton").removeAttr("disabled");
  $("#drainWorkArrow").hide();
  $("#pumpWorkArrow").hide();

  simulationStarted = false;
  // displayStats(); // Moved to runPump
}

/*
 * Function: skip
 * Skips the current animation and removes the animation from the queue
*/
function skip() {
  // $("#tank1Water").stop(true,true);
  // $("#tank2Water").stop(true,true);
}

/*
****************************************************************************************************
*                                         Calculations                                             *
****************************************************************************************************
*/

/*
 * Function: displayStats
 * Calculates the pump efficiency, work done by the pump, and percentage of work recovered during drain. Displays these
 * stats, as well as the work done by the water on the pump when it drained
*/
function displayStats() {
  var pumpV = (pumpRate * .001) / (Math.PI * pipeRadius * pipeRadius);
  // In m/s. pumpV is AVERAGE velocity of the water being pumped, 1 L/s = .001 m^3/s

  var mDot = volWater / (volWater / pumpRate);

  var pumpFrictionCoeff = calcFrictionCoeff(pumpV);

  // calculate pump efficiency
  pumpEff = findEfficiency(pumpRate);

  pumpWork = (volWater * (g * height + pumpV * pumpV / 2 + pumpFrictionCoeff * pumpV * pumpV * height / pipeRadius)) / (pumpEff / 100); // Work * pumpEfficiency = m*2*f*v^2*L/D+mv^2/2+mgh

  //pumpPower = pumpWork / (volWater / pumpRate);

  pumpPower = (pumpRate * (g * height + pumpV * pumpV / 2 + pumpFrictionCoeff * pumpV * pumpV * height / pipeRadius)) / (pumpEff / 100);

  powerRecovery = Math.abs(drainPower / pumpPower * 100);

  // display outputs
  $("#pumpWork").html(Math.round(pumpPower*100)/100 + " W");
  $("#drainWork").html(Math.round(drainPower*100)/100 + " W");
  $("#pumpEff").html(Math.round(pumpEff*100)/100 + "%");
  $("#powerRecovery").html(powerRecovery.toFixed(4) + "%");
}

/*
 * Function: findEfficiency
 * Calculates the pump efficiency with a given flow rate (in L/s)
*/
function findEfficiency(flowRate) {
  // in %, equation found in excel sheet that took data from ITT website
  return (-0.0009 * Math.pow(flowRate, 4) + 0.0201 * Math.pow(flowRate, 3) - 0.3106 * Math.pow(flowRate, 2) + 5.2603 * flowRate);
}


/*
 * Function: toKiloJoules
 * Purpose: Converts work values from J to kJ
 */
function toKiloJoules(energy) {
  return energy / 1000;
}

/*
 * Function: calcFrictionCoeff
 * Purpose: Finds the friction coefficient
 */
function calcFrictionCoeff(flowrate) {
  var reynoldsNum = 4 * 1000000 * flowrate / (Math.PI * pipeRadius);
  // Finds fanning coefficient using Haalands equation assuming smooth surface
  var frictionCoeff = Math.pow((1 / (1.8 * Math.log(6.9 / reynoldsNum))), 2) / 4;
  return frictionCoeff;
}


function finishedPumping(minY, minN){
  pbuffer = world.particleSystems[0].GetPositionBuffer();
  count = 0;
  for (pIndex = 0; pIndex < pbuffer.length; pIndex+=2){
    // For each particle, check if it's y value is greater than minY
    if (minY<=pbuffer[pIndex+1]){
      count+=1;
    }
  }
  //console.log(count);
  if (count >= minN){
    return true;
  }
  else return false;
}

function checkFinishedPumping(){
  if (finishedPumping(upperPipeTopPos, particlesFromTank1)){
    clearInterval(finishedPumpingID);
    console.log("Draining water");
    drainWater();
  }
}

function startCheckingFinishedPumping(){
  particlesFromTank1 = 2*world.particleSystems[0].particleGroups[0].GetParticleCount(); //Global declaration of particles in tank1
  var n = particlesFromTank1;
  console.log("Checking for " + n +" particles");
  var intervalID = setInterval(checkFinishedPumping,16);
  return intervalID;
}

function finishedDraining(maxY, minN){
  pbuffer = world.particleSystems[0].GetPositionBuffer();
  count = 0;
  for (pIndex = 0; pIndex < pbuffer.length; pIndex+=2){
    // For each particle, check if it's y value is greater than minY
    if (maxY>=pbuffer[pIndex+1]){
      count+=1;
    }
  }
  if (count >= minN){
    return true;
  }
  else return false;
}

function checkFinishedDraining(n){
  if (finishedDraining(lowerPipeBottomPos2, particlesFromTank1)){
    clearInterval(finishedDrainingID);
    console.log("Finished draining water");
    finishDrain();
  }
}

function startCheckingFinishedDraining(){
  n = particlesFromTank1;
  console.log("Checking for " + n +" particles");
  var intervalID = setInterval(checkFinishedDraining,16);
  return intervalID;
}
