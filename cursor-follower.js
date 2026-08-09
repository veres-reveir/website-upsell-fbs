(function () {
  'use strict';

  // Desktop pointer only — never touch (keeps mobile scroll untouched)
  var canRun =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canRun) return;

  var COLORS = ['#ff6b6b', '#fff200', '#45b7d1', '#96ceb4', '#ffeaa7'];
  var REMOVE_DELAY = 380;
  var MAX_POINTS = 28;
  var MIN_MOVE = 3;
  var MAX_SHAPES = 18;
  var SHAPE_CHANCE = 0.06;

  var root = document.createElement('div');
  root.id = 'cursor-follower';
  root.setAttribute('aria-hidden', 'true');
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  root.appendChild(svg);
  document.body.appendChild(root);

  function sizeSvg() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  }
  sizeSvg();

  var resizeTimer = null;
  window.addEventListener(
    'resize',
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeSvg, 120);
    },
    { passive: true }
  );

  function Follower(stage, color) {
    this.stage = stage;
    this.color = color;
    this.points = [];
    this.line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.line.style.fill = color;
    this.line.style.stroke = color;
    this.line.style.strokeWidth = '1';
    this.line.style.opacity = '0.85';
    stage.appendChild(this.line);
  }

  Follower.prototype.getDrift = function () {
    return (Math.random() - 0.5) * 3;
  };

  Follower.prototype.add = function (position, spawnShape) {
    var direction = { x: 0, y: 0 };
    if (this.points[0]) {
      direction.x = (position.x - this.points[0].position.x) * 0.25;
      direction.y = (position.y - this.points[0].position.y) * 0.25;
    }

    var point = {
      position: position,
      time: Date.now(),
      drift: {
        x: this.getDrift() + direction.x / 2,
        y: this.getDrift() + direction.y / 2,
      },
      age: 0,
      direction: direction,
    };

    if (spawnShape) {
      var shapeChance = Math.random();
      if (shapeChance < SHAPE_CHANCE) this.makeCircle(point);
      else if (shapeChance < SHAPE_CHANCE * 2) this.makeSquare(point);
      else if (shapeChance < SHAPE_CHANCE * 3) this.makeTriangle(point);
    }

    this.points.unshift(point);
    if (this.points.length > MAX_POINTS) this.points.length = MAX_POINTS;
  };

  Follower.prototype.createLine = function (points) {
    if (!points.length) return '';
    var path = ['M'];
    var forward = true;
    var i = 0;
    while (i >= 0) {
      var point = points[i];
      var offsetX = point.direction.x * ((i - points.length) / points.length) * 0.6;
      var offsetY = point.direction.y * ((i - points.length) / points.length) * 0.6;
      var x = point.position.x + (forward ? offsetY : -offsetY);
      var y = point.position.y + (forward ? offsetX : -offsetX);
      point.age += 0.2;
      path.push(String(x + point.drift.x * point.age));
      path.push(String(y + point.drift.y * point.age));
      i += forward ? 1 : -1;
      if (i === points.length) {
        i--;
        forward = false;
      }
    }
    return path.join(' ');
  };

  Follower.prototype.trim = function () {
    if (this.points.length) {
      var last = this.points[this.points.length - 1];
      if (last.time < Date.now() - REMOVE_DELAY) this.points.pop();
    }
    this.line.setAttribute('d', this.createLine(this.points));
  };

  Follower.prototype.hasPoints = function () {
    return this.points.length > 0;
  };

  var activeShapes = 0;

  Follower.prototype.moveShape = function (shape, point) {
    if (activeShapes >= MAX_SHAPES) return;
    activeShapes += 1;
    this.stage.appendChild(shape);
    var driftX =
      point.position.x + point.direction.x * (Math.random() * 20) + point.drift.x * (Math.random() * 10);
    var driftY =
      point.position.y + point.direction.y * (Math.random() * 20) + point.drift.y * (Math.random() * 10);
    var stage = this.stage;

    shape.style.transform = 'translate(' + point.position.x + 'px, ' + point.position.y + 'px)';
    shape.style.transition = 'transform 0.45s ease-out, opacity 0.45s ease-out';
    shape.style.opacity = '1';
    shape.style.willChange = 'transform, opacity';

    requestAnimationFrame(function () {
      shape.style.transform =
        'translate(' +
        driftX +
        'px, ' +
        driftY +
        'px) scale(0) rotate(' +
        Math.random() * 360 +
        'deg)';
      shape.style.opacity = '0';
    });

    setTimeout(function () {
      if (stage.contains(shape)) stage.removeChild(shape);
      activeShapes = Math.max(0, activeShapes - 1);
    }, 480);
  };

  Follower.prototype.makeCircle = function (point) {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    var radius = Math.max(2, (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1);
    circle.setAttribute('r', String(radius));
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.style.fill = this.color;
    this.moveShape(circle, point);
  };

  Follower.prototype.makeSquare = function (point) {
    var size = Math.max(3, (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5);
    var square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    square.setAttribute('width', String(size));
    square.setAttribute('height', String(size));
    square.style.fill = this.color;
    this.moveShape(square, point);
  };

  Follower.prototype.makeTriangle = function (point) {
    var size = Math.max(3, (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5);
    var triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    triangle.setAttribute('points', '0,0 ' + size + ',' + size / 2 + ' 0,' + size);
    triangle.style.fill = this.color;
    this.moveShape(triangle, point);
  };

  var followers = COLORS.map(function (color) {
    return new Follower(svg, color);
  });

  var lastX = -9999;
  var lastY = -9999;
  var rafId = 0;
  var running = false;

  function tick() {
    var any = false;
    for (var i = 0; i < followers.length; i++) {
      followers[i].trim();
      if (followers[i].hasPoints()) any = true;
    }
    if (any) {
      rafId = requestAnimationFrame(tick);
    } else {
      running = false;
      rafId = 0;
    }
  }

  function ensureLoop() {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(tick);
    }
  }

  window.addEventListener(
    'mousemove',
    function (e) {
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      if (dx * dx + dy * dy < MIN_MOVE * MIN_MOVE) return;
      lastX = e.clientX;
      lastY = e.clientY;

      var position = { x: e.clientX, y: e.clientY };
      // Only first follower spawns shapes — cuts DOM churn 5×
      for (var i = 0; i < followers.length; i++) {
        followers[i].add(position, i === 0);
      }
      ensureLoop();
    },
    { passive: true }
  );
})();
