// window.Math shortcuts, Math object can be accessed anywhere 
Object.getOwnPropertyNames(window.Math).forEach(function(method) {
	window[method] = Math[method];
});

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

//fg - line animations	
var PatternCanvas = document.getElementById('pattern');
var PatternCxt = PatternCanvas.getContext('2d');
// fullscreen
//PatternCanvas.width = window.innerWidth;
//PatternCanvas.height = window.innerHeight;
var PatternWidth = .5;
var PatternHeight = .5;
var CANVAS_WIDTH = 666;
var CANVAS_HEIGHT = 666;
var PatternLineCounts = 4;
var PatternQueueLength = 66;
var PatternLineColors = [{
		h: 60,
		s: 60,
		l: 50
	}, {
		h: 0,
		s: 50,
		l: 50
	}, {
		h: 200,
		s: 50,
		l: 50
	}, {
		h: 250,
		s: 50,
		l: 50
	}];

//controller variables
var addShadow = false;
var addDarkShadow = false;

//line class
var Line = function(x, y, color, ease, size, offset) {
		var _this = this,
			tmpOffset = clone(offset);
		this.x = x;
		this.y = y;
		this.color = color;
		this.size = size;
		this.queue = [];
		this.ease = ease;
		this.offset = offset;

		this.draw = function(time) {

			var newParticle = {
				x: this.x + this.offset.x,
				y: this.y + this.offset.y,
				size: this.size,
				color: clone(this.color)
			};

			if (this.queue.length > PatternQueueLength)
				this.queue.splice(0, 1);

			if (this.offset.x + 10 > tmpOffset.x)
				tmpOffset.x = (random() * CANVAS_WIDTH / 2) - CANVAS_WIDTH / 2;
			if (this.offset.y + 10 > tmpOffset.y)
				tmpOffset.y = (random() * CANVAS_HEIGHT / 2) - CANVAS_HEIGHT / 2;

			//delete these for different effects
			this.offset.x += (tmpOffset.x - this.offset.x) / this.ease;
			this.offset.y += (tmpOffset.y - this.offset.y) / this.ease;


			this.queue.forEach(function(particle, i) {
				var next = _this.queue[i + 1];

				if (particle.color.l - 0.5 > 0)
					particle.color.l -= 0.5;

				if (particle.color.s - 0.8 > 0)
					particle.color.s -= 0.8;

				particle.size += 0.2;


				particle.color.h += 1;

				if (next) {
					PatternCxt.beginPath();
					PatternCxt.strokeStyle = 'hsl(' + particle.color.h + ',' + particle.color.s + '%,' + particle.color.l + '%)';
					PatternCxt.lineWidth = particle.size;
					PatternCxt.moveTo(particle.x, particle.y);
					PatternCxt.lineTo(next.x, next.y);
					PatternCxt.stroke();
				} else {
					lastParticle = particle;
				}

			});

			this.queue.push(newParticle);

			//console.log("draw");
		};
	};

// cloning object
var clone = function(obj) {
		if (null === obj || "object" !== typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	};


// PatternCluster object access variables from LeapControl.js script
var	PatternCluster = {
		time: 0,
		emitter: {
			x: CANVAS_WIDTH / 2,
			y: CANVAS_HEIGHT / 2,
			step: 35,
			angle: 0
		},
		linesArr: [],
		createLines: function() {
			var i = PatternLineCounts;
			while (i--) {
				// new line (x, y, color, ease, size, offset)
				this.linesArr.push(new Line(0,0,PatternLineColors[i],5,15, {x: 0,y: 0}));
			}
		},
		animate: function() {
			window.requestAnimFrame(this.animate.bind(this));
			
			//call the draw function is hands are detected
			//note that the canvas pauses when the draw function is not called
			if(HandDetected){
				this.draw();
			}
		},
		draw: function() {
			//clear out the line trajectory
			if (HandIndexFingerDirection < 0){
				PatternCxt.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			} 

			//keycode event to control shadowBlur effect
			PatternCxt.shadowColor = 'rgba(0,0,0,0.3)';
			if (addShadow){
				PatternCxt.shadowBlur = 20;
			} else {
				PatternCxt.shadowBlur = 0;
			}
			if (addDarkShadow){
				PatternCxt.globalCompositeOperation = 'darker';
			} else {
				PatternCxt.globalCompositeOperation = 'xor';
			}

			//default circle trajectory
			//PatternCluster.emitter.x += sin(App.emitter.angle)* PatternWidth * App.emitter.step;
			//PatternCluster.emitter.y += cos(App.emitter.angle)* PatternHeight * App.emitter.step;
			
			//controls the direction of the LinePattern emitter
			PatternCluster.emitter.x = HandX;
			PatternCluster.emitter.y = HandY;
			PatternCluster.emitter.angle += this.time;
			this.time++;

			this.linesArr.forEach(function(line) {
				line.x = PatternCluster.emitter.x;
				line.y = PatternCluster.emitter.y;
				line.draw(PatternCluster.time);
			});

		},
		init: function() {
			this.createLines();
			// texture of the Lines, 'xor' darker' or 'lighter'
			//PatternCxt.globalCompositeOperation = 'xor';
			PatternCxt.lineCap = 'square';
			this.animate();
		}
	};

//PatternCluster.init();


