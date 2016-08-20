const screens = {};
const platforms = [];
const gameObjects = [];
const draggableNodes = [];
const lineObjects = [];
gameObjects.remove = function(obj) {
  var index = this.findIndex((o) => o.id == obj.id);
  this.splice(index, 1);
};
function getNextId() {
  return ++getNextId.id;
}
getNextId.id = 0;
function Workspace(w, h, gridX, gridY) {
  var ws = this;
  this.id = getNextId();
  this.width = w || 100000;
  this.height = h || 100000;
  this.backgroundColor = "#000000";
  this.gridSizeX = gridX;
  this.gridSizeY = gridY;
  this.updateGridSize = function(w, h) {
    this.gridSizeX = w;
    this.gridSizeY = h;
  };
  this.gridify = function() {
    var grid = {};
    for(var i = 0; i < this.width; i += this.gridSizeX) {
      for(var j = 0; j < this.height; j += this.gridSizeY) {
        grid[i + ":" + j] = {};
      }
    }
    this.grid = grid;
  };
  this.gridify();
  this.getGridTile = function(x, y) {
    var gridX = x - (x % this.gridSizeX);
    var gridY = y - (y % this.gridSizeY);
    return this.grid[gridX + ":" + gridY];
  };
  this.getGridTilesOnObject = function(obj) {
    var d = 50;
    var tile0 = this.getGridTile(obj.xmin - d, obj.ymin - d);
    var tile1 = this.getGridTile(obj.xmax + d, obj.ymin - d);
    var tile2 = this.getGridTile(obj.xmin - d, obj.ymax + d);
    var tile3 = this.getGridTile(obj.xmax + d, obj.ymax + d);
    var tile4 = this.getGridTile(obj.x, obj.y);
    var arr = {};
    tile0 && Object.keys(tile0).forEach((id) => arr[id] = (tile0[id])),
    tile1 && Object.keys(tile1).forEach((id) => arr[id] = (tile1[id])),
    tile2 && Object.keys(tile2).forEach((id) => arr[id] = (tile2[id])),
    tile3 && Object.keys(tile3).forEach((id) => arr[id] = (tile3[id])),
    tile4 && Object.keys(tile4).forEach((id) => arr[id] = (tile4[id]))
    return arr;
  };

  this.deleteOnId = function(id, dolog) {
    if(dolog) console.time('deleteOnId');
    var keys = Object.keys(this.grid);
    var i = 0, l = keys.length;
    for(i; i < l; i++) {
      if(this.grid[keys[i]][id]) {
        delete this.grid[keys[i]][id];
      }
    }
    if(dolog) console.timeEnd('deleteOnId');
  }

  this.tilesOnId = function(id) {
    var out = [];
    var keys = Object.keys(this.grid);
    var i = 0, l = keys.length;
    for(i; i < l; i++) {
      if(this.grid[keys[i]][id]) {
        out.push({key: keys[i], tile: this.grid[keys[i]]});
      }
    }
    return out;
  }

  this.addToGrid = function(obj) {
    for(var x = obj.xmin; x < obj.xmax; x += this.gridSizeX) {
      for(var y = obj.ymin; y < obj.ymax; y += this.gridSizeX) {
        var tile = this.getGridTile(x, y);
        if(tile) tile[obj.id] = obj;
      }
    }
  };

  this.removeFromGrid = function(obj, dolog) {
    if(dolog) console.time('removeFromGrid');
    for(var x = obj.xmin; x < obj.xmax; x += this.gridSizeX) {
      for(var y = obj.ymin; y < obj.ymax; y += this.gridSizeX) {
        var tile = this.getGridTile(x, y);
        if(dolog) console.log(tile, obj.id);
        if(tile) delete tile[obj.id];
        if(dolog) console.log(tile);
      }
    }
    if(dolog) console.timeEnd('removeFromGrid');
  };

  this.updateGrid = function(x, y, obj) {
    this.deleteOnId(obj.id);
    this.addToGrid(obj);
    return;
    if(!obj.dx && !obj.dy) return;
    var tileInitial = this.getGridTile(x, y);
    var tileNew = this.getGridTile(obj.x, obj.y);
    if(tileNew && tileInitial && tileInitial !== tileNew) {
      this.removeFromGrid(obj);
      this.addToGrid(obj);
    }
  };

  this.cotr = "Workspace";
}
function Screen(id, w, h) {
  var s = this;
  this.canvas = document.getElementById(id);
  this.ct = this.canvas.getContext('2d');
  this.canvas.width = this.w = w || window.innerWidth;
  this.canvas.height = this.h = h || window.innerHeight;
  this.x = this.w/2;
  this.y = this.h/2;
  this.setBB();
  window.addEventListener('resize', () => {
    s.canvas.width = s.w = window.innerWidth;
    s.canvas.height = s.h = window.innerHeight;
  }, false);

}



function Platform(x,y,w,h, o) {
  const color = 'black';
  o = o || {};
  this.cotr = 'Platform';
  this.id = getNextId();
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.setBB();
  this.elasticity = o.elasticity || 1;
  this.border = {
    thickness: 1,
    color: o.borderColor || color
  };
  this.fill = {
    color: o.fillColor || color
  };
  this.atRest = true;
  this.last = {};
  this.screen = screens.bg;
  if(typeof ws !== 'undefined') {
    ws.addToGrid(this);
  }
  this.nodes = [
    new DraggebleNode(this, this.xmax - 7.5, this.ymin + 7.5)
  ];
  new MouseEvent(this, window, 'mouseenter', (e) => {
    console.log('mouse enter');
    this.nodes.forEach( (n) => n.visible = true);
  });
  new MouseEvent(this, window, 'mouseleave', (e) => {
    console.log('mouse leave');
    this.nodes.forEach( (n) => n.visible = false);
  });
  new MouseEvent(this, window, 'mousedown', (e) => {
    console.log(e);
    if(e.ctrlKey) {

    }
    this.mouseMove = true;
    this.mox = e.x;
    this.moy = e.y;
    this.mvx = this.x - e.x;
    this.mvy = this.y - e.y;

    this.setBB();
    renderPlatforms();
  });
  new MouseEvent(this, window, 'mousemove mouseout', (e) => {
    if(!this.mouseMove) return;
    var onEnd = this.setBB;
    var resize = this.nodes.find((node) => isPointInObject(e.x, e.y, node));
    if(resize) {
      // this.xmax += (e.x - this.mox) * 2;
      // this.ymin += (this.moy - e.y) * 2;
      this.cachedImage = null;
      this.xmax += e.x - this.mox;
      this.ymin += e.y - this.moy;

      this.setBBR();
    } else {
      this.x = e.x + this.mvx;
      this.y = e.y + this.mvy;
      this.setBB();
    }
    // this.y = e.y + this.mvy;
    this.nodes.forEach( (node) => {

      node.x += e.x - this.mox;
      node.y += e.y - this.moy;

      node.setBB();
    });
    this.mox = e.x;
    this.moy = e.y;
    ws.updateGrid(this.mox, this.moy, this);
    renderPlatforms();
  });
  new MouseEvent(this, window, 'mouseup', (e) => {
    console.log('stop moving');
    this.mouseMove = false;
  });

}

function GameObject(x,y,w,h,o) {
  const color = 'blue';
  const go = this;
  o = o || {};
  this.cotr = 'GameObject';
  this.id = getNextId();
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.r = w/2;
  this.m = Math.PI * this.r * this.r;
  this.dx = o.dx || 0;
  this.dy = o.dy || 0;
  this.diry = this.dirx = 0;
  this.ay = o.ay || 0;
  this.ax = o.ax || 0;
  this.vx = this.vy = 0;
  this.spin = o.spin || 0;
  this.lifeTime = o.lifeTime || 0;
  this.lifeTime && setTimeout(() => {
    ws.deleteOnId(this.id);
    gameObjects.remove(this);
  }, this.lifeTime * 1000);

  this.collisionResponseY = 'bounce';
  this.collisionResponseX = 'slide';
  this.elasticity = o.elasticity || 1;
  var time = 0;
  Object.defineProperty(this, 'time', {
    get: () => {
      return time;
    },
    set: (val) => {
      time = val;
      // if(time > 0.1) go.lastCollidedWith = null;
    }
  });
  this.setBB();
  this.border = {
    thickness: 1,
    color: o.borderColor || color
  };
  this.fill = {
    color: o.fillColor || color
  };
  this.screen = screens.fg;
  this.last = {};
  this.screen && new MouseEvent(this, window, 'mousedown', (e) => {
    // this.clicked = !this.clicked;
    console.log('clicked');
    var pixel = this.screen.ct.getImageData(e.x, e.y, 1, 1);
    return;
    this.dy = -10;
    this.atRest = false;
    this.time = 0;
  });
  if(typeof ws !== 'undefined') ws.addToGrid(this);
}



GameObject.prototype.setBB = function() {
  this.xmin = this.x - this.w/2;
  this.xmax = this.x + this.w/2;
  this.ymin = this.y - this.h/2;
  this.ymax = this.y + this.h/2;
};

GameObject.prototype.setBBR = function() {
  this.w = (this.xmax - this.xmin);
  this.h = (this.ymax - this.ymin);
  this.x = this.xmin + this.w/2;
  this.y = this.ymin + this.h/2;
};

const fullCircle = 2*Math.PI;
GameObject.prototype.render = function() {
  const cs = this.screen.ct;

  cs.fillStyle = this.fill.color;
  if(this.cachedImage) {
    return cs.drawImage(this.cachedImage, this.xmin, this.ymin);
  }
  if(this instanceof Platform) {
    // console.log('render platform');
    cs.fillRect(this.xmin, this.ymin, this.w, this.h);
  } else {
    cs.beginPath();
    cs.arc(this.x, this.y, this.w/2, 0, fullCircle);
    cs.fill();
  }
  if(drawBounds){
    cs.strokeStyle = 'green';
    cs.strokeRect(this.xmin, this.ymin, this.w, this.h);
  }
  if(!this.cachedImage) {
    // create temporary canvas
    var c2 = document.createElement('canvas');
    c2.width = this.w;
    c2.height = this.h;
    var cs2 = c2.getContext('2d');
    // draw the shape on temporary canvas
    cs2.fillStyle = this.fill.color;
    if(this instanceof Platform) {
      cs2.fillRect(0, 0, this.w, this.h);
    } else {
      cs2.beginPath();
      cs2.arc(this.w/2, this.h/2, this.w/2, 0, fullCircle);
      cs2.fill();
    }

    // use the temporary canvas as the cached image
    this.cachedImage = c2;
  }
};


GameObject.prototype.moveToCollision = function(co) {
  var dy = co.ymin > this.ymax ? co.ymin - this.ymax : 0;
  this.lastCollidedWith = co;
  if(this.collisionResponseY == 'stop') this.atRest = true;
  switch(this.collisionResponseY) {
    case 'stop':
      this.atRest = true;
      this.y += this.cvy;
      this.x += this.cvx;
      this.dy = 0;
      this.setBB();
      this.render();
      this.time = 0;
      this.ay = 0;
      break;
    case 'bounce':
      this.time = 0;
      this.dx += this.spin.x;
      this.spin.x /= 2;
      this.dy *= -1;
      this.dy -= g;

      this.dy *= this.elasticity;
      break;
  }
  // this.clear();
};

function DraggebleNode(o, x, y) {
  this.x = x;
  this.y = y;
  this.r = this.w = this.h = 15;
  this.visible = false;
  this.setBB();
  this.screen = screens.misc;
  this.render = function() {
    var cs = this.screen.ct;
    var originalStyle = cs.fillStyle;
    cs.strokeStyle = 'green';
    cs.strokeRect(this.xmin, this.ymin, this.w, this.h);
    cs.strokeStyle = originalStyle;
  };
  new MouseEvent(this, window, 'mousedown', (e) => {
    return 'mousedown';
  });
  new MouseEvent(this, window, 'mouseup', (e) => {
    return 'mouseup';
  });
  new MouseEvent(this, window, 'mousemove', (e) => {
    return 'mousemove';
  });
  draggableNodes.push(this);
}

function MouseEvent(o, canvas, event, fn) {
  var handle = (e) => {
    var x = e.x, y = e.y;
    if(isPointInObject(x, y, o)) {
      fn(e);
    }
  };
  var events = event.split(' ');
  o.mouseState = 'outside';
  events.forEach((event) => {
    if(event == 'mouseenter') {
      event = 'mousemove';
      handle = (e) => {
        var x = e.x, y = e.y;
        if(o.mouseState == 'outside' && isPointInObject(x, y, o)) {
          o.mouseState = 'inside';
          fn(e);
        }
      };
    }
    if(event == 'mouseleave') {
      event = 'mousemove';
      handle = (e) => {
        var x = e.x, y = e.y;
        if(o.mouseState == 'inside' && !isPointInObject(x, y, o)) {
          o.mouseState = 'outside';
          fn(e);
        }
      };
    }
    canvas.addEventListener(
      event,
      handle,
      false
    );
  });
}
Platform.prototype.setBB = GameObject.prototype.setBB;
Platform.prototype.render = GameObject.prototype.render;
Platform.prototype.setBBR = GameObject.prototype.setBBR;
Screen.prototype.setBB = GameObject.prototype.setBB;
DraggebleNode.prototype.setBB = GameObject.prototype.setBB;
DraggebleNode.prototype.setBBR = GameObject.prototype.setBBR;
// Platform.prototype = GameObject.prototype;
// Screen.prototype = GameObject.prototype;
// const screens = {
//   fg: new Screen('fg'),
//   bg: new Screen('bg')
// };
// const platforms = [
//   new Platform(200, 800, 800, 100),
//   new Platform(600, 900, 200, 100)
// ];
// const gameObjects = [
//   new GameObject(200, 225, 50, 50),
//   new GameObject(300, 250, 50, 50),
//   new GameObject(400, 275, 50, 50),
//   new GameObject(500, 300, 50, 50),
//   new GameObject(600, 325, 50, 50),
//   new GameObject(700, 350, 50, 50),
// ];

// Platform.prototype = new GameObject();
// Screen.prototype = new GameObject();
