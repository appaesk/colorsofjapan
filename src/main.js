import scrollama from 'scrollama';
import { updateSnowCap, moveCameraX, rotateY } from './mountain.js';

// initialize the scrollama
const scroller = scrollama();
const wrapper = document.querySelector(".wrapper");
const sticky = document.querySelector(".sticky-thing");
const stickyText = document.getElementById("sticky-text");
const snowCap = sticky.querySelector(".snow-cap");
const sun = sticky.querySelector("#sun");
const i1 = sticky.querySelector("#i1");
const i2 = sticky.querySelector("#i2");
const i3 = sticky.querySelector("#i3");
const snowArea = [125, 128, 187, 206, 196, 121, 11, 0, 4, 24, 52, 97];
const monthHSL = [
  [0, 0, 88],     // January
  [300, 30, 75],  // February
  [120, 40, 90],  // March
  [340, 55, 75],  // April
  [210, 40, 70],  // May
  [240, 10, 65],  // June
  [275, 40, 70],  // July
  [50, 40, 85],   // August
  [0, 50, 70],    // September
  [40, 80, 75],   // October
  [25, 50, 65],   // November
  [240, 20, 95]   // December
];

function animateColor(fromH, toH, fromS, toS, fromL, toL, duration = 1500) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const currentH = fromH + (toH - fromH) * progress;
    document.body.style.setProperty('--H', currentH);
    const currentS = fromS + (toS - fromS) * progress;
    document.body.style.setProperty('--S',  `${currentS}%`);
    const currentL = fromL + (toL - fromL) * progress;
    document.body.style.setProperty('--L',  `${currentL}%`);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// setup the instance, pass callback functions
scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: false,
  })
  .onStepEnter((response) => {
    // response.element.style.background = "rgba(0, 170, 255, 0.2)"; // highlight step with 50% opacity
    // stickyText.textContent = snowArea[response.index];
    // const snowLevel = snowArea[response.index] / Math.max(...snowArea) / 2;
    // snowCap.style.transform = `scaleY(${snowLevel})`;
    if (response.index < 12) {
      updateSnowCap(1-(snowArea[response.index] / Math.max(...snowArea)) / 2);
      response.element.querySelector('.step-text').style.opacity = '1.0';
      moveCameraX(-2 + response.index * 0.05); // adjust step size
      rotateY((12-response.index) * (2 * Math.PI) / 12); // adjust step size
      sun.style.transform = `scale(${1-0.01*response.index})`;
      sun.style.left = `${10+1*response.index}vw`;
      const currentH = parseInt(document.body.style.getPropertyValue('--H'));
      const currentS = parseInt(document.body.style.getPropertyValue('--S').replace('%', ''));
      const currentL = parseInt(document.body.style.getPropertyValue('--L').replace('%', ''));
      const newH =  monthHSL[response.index][0];
      const newS =  monthHSL[response.index][1];
      const newL =  monthHSL[response.index][2];
      animateColor(currentH, newH, currentS, newS, currentL, newL, 1000);
      // document.body.style.setProperty('--H', monthHSL[response.index][0]);
      // document.body.style.setProperty('--S', `${monthHSL[response.index][1]}%`);
      // document.body.style.setProperty('--L', `${monthHSL[response.index][2]}%`);
    }
  })
  .onStepExit((response) => {
    // response.element.style.background = "transparent"; // reset
    if (response.direction === "up") {
      if (response.index-1 >= 0 & response.index-1 < 12) {
        // const snowLevel = snowArea[response.index-1] / Math.max(...snowArea) / 2;
        // snowCap.style.transform = `scaleY(${snowLevel})`;
        updateSnowCap(1-(snowArea[response.index-1] / Math.max(...snowArea)) / 2);
        moveCameraX(-2 + (response.index-1) * 0.05); // adjust step size
        rotateY((12-(response.index-1)) * (2 * Math.PI) / 12); // adjust step size
        // sun.style.transform = `scale(${1-0.01*(response.index-1)})`;
        // sun.style.left = `${10+1*(response.index-1)}vw`;
        // document.body.style.setProperty('--H', monthHSL[response.index-1][0]);
        // document.body.style.setProperty('--S', `${monthHSL[response.index-1][1]}%`);
        // document.body.style.setProperty('--L', `${monthHSL[response.index-1][2]}%`);
        const currentH = parseInt(document.body.style.getPropertyValue('--H'));
        const currentS = parseInt(document.body.style.getPropertyValue('--S').replace('%', ''));
        const currentL = parseInt(document.body.style.getPropertyValue('--L').replace('%', ''));
        const newH =  monthHSL[response.index-1][0];
        const newS =  monthHSL[response.index-1][1];
        const newL =  monthHSL[response.index-1][2];
        animateColor(currentH, newH, currentS, newS, currentL, newL, 1000);
      }
    }
    response.element.querySelector('.step-text').style.opacity = '0.4';
  });