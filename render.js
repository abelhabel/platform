// setInterval(renderPlatforms, 16);
setInterval(renderDraggableNodes, 24);
setInterval(renderGameObjects, 16);
const ws = new Workspace(window.innerWidth, window.innerHeight, 100, 100);
const mx = 1;
const my = 1;
const coout = document.getElementById('coordinates');
const drawBounds = false;
var mouseX = 0;
var mouseY = 0;
screens.fg = new Screen('fg');
screens.bg = new Screen('bg');
screens.misc = new Screen('misc');
platforms.push.apply(platforms, [
  new Platform(300, 800, 600, 100),
  new Platform(300, 100, 600, 100),
  new Platform(25, 500, 50, 700),
  new Platform(575, 500, 50, 700)
]);

window.addEventListener('mousedown', (e) =>{
  window.aimX = e.x;
  window.aimY = e.y;
  window.aim = new Line(e.x, e.y, e.x, e.y);
}, false);
window.addEventListener('mouseup', (e) =>{
  var line = window.aim;
  var speed = -15;
  var options = {
    dx: line.vectorX()/speed,
    dy: line.vectorY()/speed,
    elasticity: 0.9,
    spin: 2
  }
  var x = line.x1;
  var y = line.y1;
  var w = h = 10;
  var go = new GameObject(x, y, w, h, options);
  gameObjects.push(go);
  window.aim = null;
}, false);
window.addEventListener('mousemove', (e) =>{
  if(window.aim) {
    window.aim.x2 = e.x;
    window.aim.y2 = e.y;

  }
}, false);

// platforms.forEach((p) => ws.addToGrid(p));
// var addInterval = setInterval(() => {
//   var vx = Math.ceil(Math.random() * 3);
//   var go = new GameObject(200, 0, 25, 25,
//     {
//       elasticity: 0.9,
//       dx: vx,
//       spin: 1,
//       lifeTime: 20
//     }
//   );
//   go.gameObjectIndex = gameObjects.push(go) -1;
//   // ws.addToGrid(go);
// }, 1000);



// ws.addToGrid(platforms);
// gameObjects.push.apply(gameObjects, [
//   new GameObject(400, 225, 50, 50,{elasticity: preElasticity, dx: 1}),
//   new GameObject(200, 225, 50, 50,{elasticity: preElasticity, dx: 2})
// ]);

var l1 = new Line(200, 500, 482, 250);
var l2 = new Line(400, 100, 900, 800);
// (l1.x1, l1.y1, l1.x2, l1.y2)
screens.fg.ct.drawLine = function(x1, y1, x2, y2) {
  this.beginPath();
  this.moveTo(x1, y1);
  this.lineTo(x2, y2);
  this.stroke();
};
console.log(l1.intersect(l2));
function renderPlatforms() {

  screens.bg.ct.clearRect(screens.bg.xmin, screens.bg.ymin, screens.bg.w, screens.bg.h);
  platforms.forEach((p) => {
    if(p.render) p.render();
  });
}
renderPlatforms();
function renderGameObjects() {
  if(drawBounds){

  }
  screens.fg.ct.clearRect(screens.fg.xmin, screens.fg.ymin, screens.fg.w, screens.fg.h);
  // screens.fg.ct.drawLine(l1.x1, l1.y1, l1.x2, l1.y2);
  // screens.fg.ct.drawLine(l2.x1, l2.y1, l2.x2, l2.y2);

  if(window.aim) {
    var line = window.aim;
    screens.fg.ct.drawLine(line.x1, line.y1, line.x2, line.y2);
  }
  gameObjects.forEach((g) => {
    if(g.render) g.render();
  });

  gameObjects.forEach((g) => {
    var x2 = g.x + g.dx * ups;
    var y2 = g.y + g.dy * ups;
    // screens.fg.ct.drawLine(g.x, g.y, x2, y2);
  });

  lineObjects.forEach((line) => {
    // screens.fg.ct.drawLine(line.x1, line.y1, line.x2, line.y2);
  })
}

function renderDraggableNodes() {
  screens.misc.ct.clearRect(0,0,screens.misc.w, screens.misc.h);
  draggableNodes.forEach((node) => {
    if(!node.visible) return;
    node.render();
  });
}

function keyboardDown(e) {
  var ball = gameObjects[0];
  var up = 87;
      down = 83;
      left = 65;
      right = 68;
  switch(e.keyCode) {
    case up:
      if(!getDown(ball)) return;
      ball.dy = -20;
      ball.atRest = false;
      break;
    case left:

      ball.dx = -mx;
      break;
    case right:
      ball.dx = mx;
      break;
  }
  // console.log(e.keyCode);
}
function pause() {
  clearInterval(moveTimer);
  // clearInterval(addInterval);
}
function keyboardUp(e) {
  var ball = gameObjects[0];
  var up = 87;
      down = 83;
      left = 65;
      right = 68;
      esc = 27;
  switch(e.keyCode) {
    case up:
      if(!ball.atRest) return;
    case left:
      ball.dx = 0;
    case right:
      ball.dx = 0;
    case esc:
      pause();
  }
}

window.addEventListener('keydown', keyboardDown, false);
window.addEventListener('keyup', keyboardUp, false);
window.addEventListener('mousemove', (e)=> {
  mouseX = e.x;
  mouseY = e.y;
  coout.textContent = `${e.x}, ${e.y}`;
}, false);
