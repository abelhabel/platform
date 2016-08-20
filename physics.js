const ups = 60; //updates per second
const g = 20 / ups; //px per second ^2
const tick = 1 / ups; //time increase per update
const cm = 1;
const cr = 2;
// d = a t^2 * 0.5
// t = Math.sqrt(d * 0.5 / a);
var moveTimer = setInterval(move, 1000/ups);
var canLog = true;
var logInterval = null;
function log() {
  if(canLog) console.log.apply(console, arguments);
  if(!logInterval) {
    logInterval = setTimeout(() => {
      canLog = true;
      logInterval = null;
    }, 1000);
  }
  canLog = false;
}

function checkCollision(go) {
  var tiles = ws.getGridTilesOnObject(go);
  var collidedWith = false;
  for(var id in tiles) {
    if(tiles[id].id == go.id) continue;
    if(go instanceof GameObject && tiles[id] instanceof GameObject) {
      if(intersectCircle(go, tiles[id])) {
        collidedWith = tiles[id];
        break;
      }
    } else {
      if(intersectRectNF(go, tiles[id])) {
        collidedWith = tiles[id];
        break;
      }
    }

  }
  return collidedWith;
  // arr.push.apply(arr, gameObjects);
  return arr.find((p) => {
    if(go.id == p.id) return false;
    if(go.lastCollidedWith && go.lastCollidedWith.id == p.id) return false;
    return intersectRectNF(go, p);
  });
}
function castPoint(x, y, go) {
  var tiles = ws.getGridTilesOnObject(go);
  var collidedWith = false;
  for(var id in tiles) {
    if(tiles[id].id == go.id) continue;
    if(isPointInObject(x, y, tiles[id])) {
      collidedWith = tiles[id];
      break;
    }
  }
  return collidedWith;
}

function getLeft(go) {
  var d = Math.abs(go.dx) + cm + 2;
  var a = castPoint(go.xmin - d, go.ymin +10, go);
  var b = castPoint(go.xmin - d, go.y, go);
  var c = castPoint(go.xmin - d, go.ymax - 10, go);
  return !(a || b || c) ? false : {
    top: a,
    middle: b,
    bottom: c
  };
}

function getRight(go) {
  var d = Math.abs(go.dx) + cm + 2;
  var a = castPoint(go.xmax + d, go.ymin +10, go);
  var b = castPoint(go.xmax + d, go.y, go);
  var c = castPoint(go.xmax + d, go.ymax -10, go);
  return !(a || b || c) ? false : {
    top: a,
    middle: b,
    bottom: c
  };
}

function getDown(go) {
  var d = Math.abs(go.dy) + cm;
  var a = castPoint(go.xmin+10, go.ymax + d, go);
  var b = castPoint(go.x, go.ymax + d, go);
  var c = castPoint(go.xmax-10, go.ymax + d, go);
  return !(a || b || c) ? false : {
    left: a,
    middle: b,
    right: c
  };
}

function getUp(go) {
  var d = Math.abs(go.dy) + cm;
  var a = castPoint(go.xmin+10, go.ymin - d, go);
  var b = castPoint(go.x, go.ymin - d, go);
  var c = castPoint(go.xmax-10, go.ymin - d, go);
  return !(a || b || c) ? false : {
    left: a,
    middle: b,
    right: c
  };
}

function momentum(o1, o2) {
  if(o2.cotr != 'Platform') {
    // o1.lastCollidedWith = o2.id;
    // o2.lastCollidedWith = o1.id;
    var temp;
    if(o1.dy < o2.dy || o1.y < o2.y) {
      temp = o2;
      o2 = o1;
      o1 = temp;
    }
    if(!o1.dy) o1.dy = 0.01;
    if(!o2.dy) o2.dy = 0.01;
    if(!o1.dx) o1.dx = 0.01;
    if(!o2.dx) o2.dx = 0.01;
    o1.ydir = o1.dy > 0 ? 1 : -1;
    o1.xdir = o1.dx > 0 ? 1 : -1;
    // before
    var totalx = o1.dx + o2.dx;
    var totaly = o1.dy + o2.dy;
    // console.log('total x before', totalx);
    // var vd = Math.sqrt(vx*vx + vy*vy);
    // var angle = Math.asin(vy/vd);
    var line = new Line(o1.x, o1.y, o2.x, o2.y);
    var dd1 = Math.sqrt(o1.dx * o1.dx + o1.dy * o1.dy);
    var dd2 = Math.sqrt(o2.dx * o2.dx + o2.dy * o2.dy);
    var totalb = dd1 + dd2;
    var angle = Math.PI/2;
    // if vy > 0 && o1.x - o2.x < 0 then -angle
    if(o1.dy < 0 && o1.x - o2.x < 0) {
      angle *= -1;
    }
    if(o1.dy > 0 && o1.x - o2.x > 0) {
      angle *= -1;
    }
    // if vy < 0 then angle
    var linep = new Line(o1.x, o1.y, o2.x, o2.y).rotate(angle);
    line.move(line.dx, line.dy);
    o2.dx = (line.x2 - o2.x) / ups;
    o2.dy = (line.y2 - o2.y) / ups;
    o1.dx = (linep.x2 - o1.x) / ups;
    o1.dy = (linep.y2 - o1.y) / ups;
    var dd1a = Math.sqrt(o1.dx * o1.dx + o1.dy * o1.dy);
    var dd2a = Math.sqrt(o2.dx * o2.dx + o2.dy * o2.dy);
    var totala = dd1a + dd2a;
    var f = totalb / totala;
    o1.dx *= f;
    o2.dx *= f;
    o1.dy *= f;
    o2.dy *= f;
    // console.log('total', dd1, dd2 );
    lineObjects.push(line, linep);
    o1.fill.color = 'green';
    o1.cachedImage = null;
    // pause();
    // var vf1 = (dd2 * (o1.m - o2.m) + 2 * o2.m * dd2) / (o1.m + o2.m);
    // o1.dy = vf1 * linep.k;
    // var vf2 = (dd1 * (o2.m - o1.m) + 2 * o1.m * dd1) / (o1.m + o2.m);
    // o2.dy = vf2 * line.k;
    // o1.dx = vf1 * Math.cos(angle) * xdir1;
    // o1.dy = vf1 * Math.sin(angle) * ydir1;
    // o2.dx = vf2 * Math.cos(angle) * xdir2;
    // o2.dy = vf2 * Math.sin(angle) * ydir2;

    // o2.dx += o1.dx/20;
    // o2.dy += o1.dy/20;
    // console.log(Math.round(o1.dx), Math.round(o1.dy),Math.round(o2.dx), Math.round(o2.dy));
    var vfx1 = (o1.dx * (o1.m - o2.m) + 2 * o2.m * o2.dx) / (o1.m + o2.m);
    var vfy1 = (o1.dy * (o1.m - o2.m) + 2 * o2.m * o2.dy) / (o1.m + o2.m);
    var vfx2 = (o2.dx * (o2.m - o1.m) + 2 * o1.m * o1.dx) / (o1.m + o2.m);
    var vfy2 = (o2.dy * (o2.m - o1.m) + 2 * o1.m * o1.dy) / (o1.m + o2.m);
    // o1.dx = vfx1;
    // o1.dy = vfy1;
    // o1.dy *= linep.k;
    // o2.dx = vfx2;
    // o2.dy = vfy2;
    // o2.dy *= linep.k;
    // o1.dx *= Math.abs(vf1);
    // o1.dy *= Math.abs(vf1);
    // o2.dx *= Math.abs(vf2);
    // o2.dy *= Math.abs(vf2);
    // var tma = o1.m * vf1 + o2.m * vf2;
    // log(tmb, tma);
    // log(Math.round(o1.dx), Math.round(o1.dy),Math.round(o2.dx), Math.round(o2.dy));
    // pause();
  }
}

function move() {
  var t, dx, dy, vx, vy, ax, ay, walking;
  gameObjects && gameObjects.forEach((go) => {
    var ox = go.x;
    var oy = go.y;
    t = go.time ? go.time + tick : tick;
    go.time = t;
    ay = g + go.ay;
    ax = go.ax;
    go.dy += ay;
    go.dx += ax;
    var collision = checkCollision(go);
    if(!collision)  {
      // this is the cheaper collision check.
      go.x += go.dx;
      go.y += go.dy;
      go.setBB();
      ws.updateGrid(ox, oy, go);
      return;
    } else {
      if(collision instanceof GameObject) {
        if(go.lastCollidedWith == collision.id || collision.lastCollidedWith == go.id){
          go.x += go.dx;
          go.y += go.dy;
          go.setBB();
          ws.updateGrid(ox, oy, go);
          return;
        }
        return momentum(go, collision);
      }
    }
    // more expensive collision check to be run only
    // when there is a collision

    var down = getDown(go);
    var downQ = (down.middle || down.left || down.right);
    var up = getUp(go);
    var upQ = (up.middle || up.left || up.right);
    var left = getLeft(go);
    var leftQ = (left.middle || left.top || left.bottom);
    var right = getRight(go);
    var rightQ = (right.middle || right.top || right.bottom);

    if(go.dy > 0 && !down) {
      go.y += go.dy;
    } else
    if(go.dy < 0 && !up) {
      go.y += go.dy;
    } else if(down || up){
      if(down) {
        go.spin *= go.elasticity;
        go.dx += go.spin;
        var e = Math.min(go.elasticity, downQ.elasticity);
        var el = Math.max(go.elasticity, downQ.elasticity);
        go.dy = (-1) * go.dy * e;
        if(el > 1) go.dy *= el;
        go.lastCollidedWith = downQ.id;
        if(go.cotr == 'GameObject' && downQ.cotr == 'GameObject' && !upQ) {
          var distx = go.x - downQ.x;
          var disty = go.y - downQ.y;
          var angle = Math.atan2(disty, distx);
          var totalx = downQ.w/2 + go.w/2;
          var totaly = downQ.h/2 + go.h/2;
          var x = Math.cos(angle ) * totalx - distx;
          var y = Math.sin(angle ) * totaly - disty;
          go.x += x;
          go.y += y;
          // pause();
          // var movex = totalx - distx;
          // var movey = totaly - disty;
          // log(movex, movey);
          // go.x += movex;
          // go.y += movey;

        }
      }
      if(up) {
        // console.log(rightQ, leftQ);
        go.spin *= go.elasticity;
        go.dx += go.spin || 0;
        var e = Math.min(go.elasticity, upQ.elasticity);
        var el = Math.max(go.elasticity, upQ.elasticity);
        go.dy = (-1) * go.dy * e;
        if(el > 1) go.dy *= el;
        go.lastCollidedWith = upQ.id;
        if(go.cotr == 'GameObject' && upQ.cotr == 'GameObject' && !downQ) {
          var distx = go.x - upQ.x;
          var disty = go.y - upQ.y;
          var angle = Math.atan2(disty, distx);
          var totalx = upQ.w/2 + go.w/2;
          var totaly = upQ.h/2 + go.h/2;
          var x = Math.cos(angle ) * totalx - distx;
          var y = Math.sin(angle ) * totaly - disty;
          go.x += x;
          go.y += y;
          // pause();
          // var movex = totalx - distx;
          // var movey = totaly - disty;
          // log(movex, movey);
          // go.x += movex;
          // go.y += movey;

        }
        // momentum(go, upQ);
      }
      // if(up) go.y -= go.xmax - upQ.xmin;
    }

    if(go.dx < 0 && !getLeft(go)) {
      go.x += go.dx;
    } else
    if(go.dx > 0 && !getRight(go)){
      go.x += go.dx;
    } else {
      // do no set go.dx to 0 if the player
      // should be able to hold down left and right keys
      // and still have speed while colliding.
      // go.dx = 0;
      if(right) {
        // go.x += rightQ.xmin - go.xmax;
        var e = Math.min(go.elasticity, rightQ.elasticity);
        var el = Math.max(go.elasticity, rightQ.elasticity);
        go.spin *= e;
        go.dy -= go.spin;
        go.dx = (-1) * go.dx * e;
        if(el > 1) go.dx *= el;
        go.lastCollidedWith = rightQ.id;
        // go.dy = 0;
        if(go.cotr == 'GameObject' && rightQ.cotr == 'GameObject' && !leftQ) {
          var distx = go.x - rightQ.x;
          var disty = go.y - rightQ.y;
          var angle = Math.atan2(disty, distx);
          var totalx = rightQ.w/2 + go.w/2;
          var totaly = rightQ.h/2 + go.h/2;
          var x = Math.cos(angle ) * totalx - distx;
          var y = Math.sin(angle ) * totaly - disty;
          go.x += x;
          go.y += y;
          // pause();
          // var movex = totalx - distx;
          // var movey = totaly - disty;
          // log(movex, movey);
          // go.x += movex;
          // go.y += movey;

        }
      }
      if(left) {
        // go.x -= go.xmin - leftQ.xmax;
        var e = Math.min(go.elasticity, leftQ.elasticity);
        var el = Math.max(go.elasticity, leftQ.elasticity);
        go.spin *= e;
        go.dy += go.spin;
        go.dx = (-1) * go.dx * e;
        if(el > 1) go.dx *= el;
        if(go.cotr == 'GameObject' && leftQ.cotr == 'GameObject' && !rightQ) {
          var distx = go.x - leftQ.x;
          var disty = go.y - leftQ.y;
          var angle = Math.atan2(disty, distx);
          var totalx = leftQ.w/2 + go.w/2;
          var totaly = leftQ.h/2 + go.h/2;
          var x = Math.cos(angle ) * totalx - distx;
          var y = Math.sin(angle ) * totaly - disty;
          go.x += x;
          go.y += y;
          // pause();
          // var movex = totalx - distx;
          // var movey = totaly - disty;
          // log(movex, movey);
          // go.x += movex;
          // go.y += movey;

        }
        go.lastCollidedWith = leftQ.id;
      }
    }
    go.setBB();
    ws.updateGrid(ox, oy, go);
  });
}

function Line(x1, y1, x2, y2) {
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2;
  this.dx = this.x2 - this.x1;
  this.dy = this.y2 - this.y1;
  this.r = () => Math.sqrt(this.dx * this.dx + this.dy * this.dy);
  this.vectorX = () => {
    var x = this.x2 - this.x1;
    return x;
    var y = this.y2 - this.y1;
    return x / (Math.abs(x) + Math.abs(y));
  };
  this.vectorY = () => {
    var x = this.x2 - this.x1;
    var y = this.y2 - this.y1;
    return y;
    return y / (Math.abs(x) + Math.abs(y));
  };
  this.setK = () => this.k = (this.y2 - this.y1) / (this.x2 - this.x1);
  this.setM = () => this.m = this.y1 - (this.k * this.x1);
  this.yforx = (x) => this.k * x + this.m;
  this.setBB = () => {
    this.xmin = Math.min(this.x1, this.x2);
    this.xmax = Math.max(this.x1, this.x2);
    this.ymin = Math.min(this.y1, this.y2);
    this.ymax = Math.max(this.y1, this.y2);
    return this;
  };

  this.move = (x, y) => {
    this.x1 += x;
    this.x2 += x;
    this.y1 += y;
    this.y2 += y;
    this.setBB();
    return this;
  };

  this.angle = () => Math.atan2(this.dy, this.dx);

  this.rotate = (angle, xdir, ydir) => {
    var currentAngle = Math.atan2(this.dy, this.dx);
    var nextAngle = currentAngle + angle;
    this.x2 = this.x1 + this.r() * Math.cos(nextAngle);
    this.y2 = this.y1 + this.r() * Math.sin(nextAngle);
    this.setK();
    this.setM();
    this.setBB();
    return this;
  };

  this.setBB();
  this.intersect = (line) => {
    var xy = this.intersectAt(line);
    return isPointInObject(xy.x, xy.y, this);
  };
  this.intersectAt = (line) => {
    var x = (line.m - this.m) / (this.k - line.k);
    return {
      x: x,
      y: this.yforx(x)
    };
  };

  this.setK();
  this.setM();
}


function isPointInObject(posx, posy, obj) {
  if(posx < obj.xmax && posx > obj.xmin && posy < obj.ymax && posy > obj.ymin) {
    return true;
  }
  return false;
}

function intersectRectNF(r1, r2) {
  return !(r2.xmin > r1.xmax + Math.abs(r1.dx)||
        r2.xmax < r1.xmin - Math.abs(r1.dx) ||
        r2.ymin > r1.ymax + Math.abs(r1.dy)||
        r2.ymax < r1.ymin - Math.abs(r1.dy));
}


function intersectRect(r1, r2) {
  return !(r2.xmin > r1.xmax ||
        r2.xmax < r1.xmin ||
        r2.ymin > r1.ymax ||
        r2.ymax < r1.ymin);
}

function intersectCircle(c1, c2) {
  var x = c1.x - c2.x;
  var y = c1.y - c2.y;
  var objectsR = c1.r + c2.r;
  var distanceR = Math.round(Math.sqrt(x*x + y*y));
  return (objectsR >  distanceR);
}
