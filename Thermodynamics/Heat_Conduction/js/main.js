/*
 * File: main.js
 * Authors: Daniel Vasquez & Brooke Bullek (2017)
 *          Under the supervision of Margot Vigeant, Bucknell University
 */

// Images
var CAT_ALIVE_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-alive.png?raw=true";
var CAT_DEAD_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-dead.png?raw=true";
var CAT_FAINTED_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-fainted.png?raw=true";
var CAT_ALIVE_TRANSPARENT_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-alive-transparent.png?raw=true";
var CAT_DEAD_TRANSPARENT_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/cat-dead-transparent.png?raw=true";
var KITCHEN_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/kitchen-bg.jpg?raw=true";
var STOVETOP_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/stovetop-bg.jpg?raw=true";
var ARM_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/arm.png?raw=true";
var SWEAT_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/sweat.png?raw=true";
var LIFE_TEXT_URL = "https://github.com/DTV96Calibre/InquiryActivities/blob/master/Thermodynamics/Heat_Conduction/images/remaining-lives-text.png?raw=true";

// Global var that holds references to any images loaded into the project
var images;

/**
 * Initialize the simulation by setting the canvas size, loading images, and
 * creating scenes for the p5 Scene Manager library.
 * @return none
 */
function setup() {
  createCanvas(displayWidth, displayHeight);
  initImages();
  mgr = new SceneManager();
      // Wire links supported p5 functions to sceneManager
      mgr.wire();
      // Preload scenes. Preloading is normally optional
      // ... but needed if showNextScene() is used.
      mgr.addScene (Intro);
      mgr.addScene (Editor);
      mgr.showNextScene();
}

/**
 * Initializes the image elements that will be rendered on the p5 canvas.
 * @return none
 */
function initImages() {
  images = {
    cat_alive: createImg(CAT_ALIVE_URL),
    cat_dead: createImg(CAT_DEAD_URL),
    cat_fainted: createImg(CAT_FAINTED_URL),
    cat_alive_transparent: createImg(CAT_ALIVE_TRANSPARENT_URL),
    cat_dead_transparent: createImg(CAT_DEAD_TRANSPARENT_URL),
    arm: createImg(ARM_URL),
    sweat: createImg(SWEAT_URL),
    lives_text: createImg(LIFE_TEXT_URL)
  }

  // Hide the images so they don't appear beneath the canvas when loaded
  for (x in images) {
    images[x].hide();
  }
}