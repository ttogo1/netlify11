'use strict';
var vcanvas, ctx;
var stype = 0;                      // 비행선 종류 0 ~ 3
var sx = 200, sy = 200, vel = 3;    // 비행선 좌표, 길이
var fire;                          // 총알생성 키
var arrRocket = [];
var r_left, r_right, r_up, r_down;
var arr = [];
var audio, Explosion;
var particle = [];

var Audio;

var proportionWH;
var vcanvas0 = {width: 900, height: 400};
var ratio;


var sdirection = 0;
// particle

function b2v(a, b) {
	return a + (b - a) * Math.random();
}

function createParticle(a) {
    var i, nop, x, y, wh, velx, vely, colors, d1, d2;
    nop = 100;
    for (i = 0; i < nop; i += 1) {
        x = a.x + b2v(0, a.wh * 1.2);
        y = a.y + b2v(0, a.wh * 1.2);
        wh = b2v(1, 8);
        colors = a.cHue + Math.round(20 * Math.random());
        d1 = b2v(30, 120);
        d2 = b2v(30, 120);
        velx = (7 - wh) / 3 * b2v(-1, 1);
        vely = (7 - wh) / 3 * b2v(-1, 1);
        
        particle.push({px: x , py: y, pw: wh, pc: colors, d1: d1, d2: d2, vx: velx, vy: vely});
    }
} // arr.push({x: x, y: y, wh: wh, v: v, cHue: c, hit: 0});

function drawParticle(tp) {
    var i, hue, saturation, lightness;
    for (i = 0;  i < tp.length; i += 1) {
        hue = tp[i].pc;
        saturation = 100;
        lightness = 80 * tp[i].d1 / tp[i].d2;
        ctx.fillStyle = "hsl(" + hue + ", 100%," + lightness + "%)";
        ctx.fillRect(tp[i].px *ratio, tp[i].py * ratio, tp[i].pw * ratio, tp[i].pw * ratio);
    }
}

function updateParticle() {
	var i, k = 1;
	for (i = 0; i < particle.length; i += 1) {
		particle[i].px -= k * particle[i].vx;
		particle[i].py -= k * particle[i].vy;
		particle[i].d1 -= k * 2;
		
		if (particle[i].d1 < 0) { particle.splice(i, 1); }
	}
}
// base 

function clearCanvas() {
    ctx.clearRect(0, 0, vcanvas.width, vcanvas.height);
}

// Collision

function hitshipRect(s, t) {
    return (s.x2 > t.x1 && s.x1 < t.x2) && (s.y2 > t.y1 && s.y1 < t.y2);
}

function collisionShip() {
    var s, t, i, Explosion;
    
    s = {x1: sx - 10 , y1: sy - 7 , x2: sx + 30, y2: sy + 7};

    for (i = 0; i < arr.length; i += 1) {
        t = {x1: arr[i].x, y1: arr[i].y, x2: arr[i].x + arr[i].wh, y2: arr[i].y + arr[i].wh};
        if (hitshipRect(s, t)) {
			createParticle(arr[i]); 
            arr.splice(i, 1);
            Explosion = new Audio('sound/explosion6.mp3');
            Explosion.play();
        }
    }
}

function collisionRocket(ss) {
    var i, r, t, Explosion;
    
    r = {x1: ss.x, y1: ss.y, x2: ss.x + ss.rw, y2: ss.y + ss.rh};
    for (i = 0; i < arr.length; i += 1) {
        t = {x1: arr[i].x, y1: arr[i].y, x2: arr[i].x + arr[i].wh, y2: arr[i].y + arr[i].wh};
        if (hitshipRect(r, t)) {
            arr[i].hit += 1;
            if (arr[i].hit > 50) {
				createParticle(arr[i]); 
                arr.splice(i, 1);
                Explosion = new Audio('sound/explosion6.mp3');
                Explosion.play();
            }
        }
    }
}

// Enemy

function createEnemy() {
    var x, y, wh, v, c;
    x = vcanvas0.width;
    y = Math.floor(Math.random() * vcanvas0.height) + 1;
    wh = Math.floor(Math.random() * 30) + 10;
    v = Math.floor(Math.random() * 2) + 1;
    c = Math.round(360 * Math.random()); 
    
    arr.push({x: x, y: y, wh: wh, v: v, cHue: c, hit: 0});
}

function createWall() {
    var x, y, wh, v, c, i, n;
    
    c = Math.round(360 * Math.random()); 
    for (i = 0; i < n; i += 1) {
        x = vcanvas0.width;
        y = 50 * i + 5;
        wh = 45;
        v = 2;
        
        arr.push({x: x, y: y, wh: wh, v: v, cHue: c, hit: 0});
    }
}

function deleteEnemy() {
    var i = 0;
    
    for (i = 0; i < arr.length; i += 1) {
        if (arr[i].x < -50) { arr.splice(i, 1); }
    }
}

function updateEnemy() {
    var i = 0;
    
    for (i = 0; i < arr.length; i += 1) {
        arr[i].x -= arr[i].v;
    }
}

function drawEnemy() {
    var i = 0;
    
    for (i = 0; i < arr.length; i += 1) {
        ctx.fillStyle = "hsl(" + arr[i].cHue + ", 100%, 50%)";
        ctx.fillRect(arr[i].x * ratio, arr[i].y * ratio , arr[i].wh * ratio, arr[i].wh * ratio);
    }
}

// Rocket

function createRocket() {
    var audio;
	if (sdirection === 0){
		if (fire) {
        	arrRocket.push({x: sx + 60, y: sy - 1, rw: 5, rh: 3 , c: "#ffff00", v: 5});
        
        	if (stype === 0) {
            	audio = new Audio('sound/Laser_Burst_Gun(1p).mp3');
				audio.volume = 0.2;
            	audio.play();
        	}
        	if (stype === 1) {
				arrRocket.push({x: sx + 60 , y: sy - 1, rw: 5 , rh: 3, c: "#ffff00", v: 5});
				arrRocket.push({x: sx + 60 , y: sy - 1, rw: 5, rh: 3, c: "#ffff00", v: 5});
				audio = new Audio('sound/Laser_Burst_Gun(2p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
			if (stype === 2 || stype === 3) {
				arrRocket.push({x: sx + 10 , y: sy + 12, rw: 5, rh: 3, c: "#ffff00", v: 5});
				arrRocket.push({x: sx + 10, y: sy - 15, rw: 5, rh: 3, c: "#ffff00", v: 5});
				audio = new Audio('sound/Laser_Burst_Gun(3p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
			if (stype === 3) {
				arrRocket.push({x: sx, y: sy + 16, rw: 5, rh: 3, c: "#ffff00", v: 5});
				arrRocket.push({x: sx, y: sy - 19, rw: 5, rh: 3, c: "#ffff00", v: 5});
				audio = new Audio('sound/Laser_Burst_Gun(4p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
		}
		
	
	}
	
	if (sdirection === 1){
		if (fire) {
        	arrRocket.push({x: sx - 60, y:sy - 1, rw: 5, rh: 3 , c: "#ffff00", v: -5});
        
        	if (stype === 0) {
            	audio = new Audio('sound/Laser_Burst_Gun(1p).mp3');
				audio.volume = 0.2;
            	audio.play();
        	}
        	if (stype === 1) {
				arrRocket.push({x: sx - 60 , y: sy -1, rw: 5 , rh: 3, c: "#ffff00", v: -5});
				arrRocket.push({x: sx - 60 , y: sy - 1, rw: 5, rh: 3, c: "#ffff00", v: -5});
				audio = new Audio('sound/Laser_Burst_Gun(2p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
			if (stype === 2 || stype === 3) {
				arrRocket.push({x: sx - 10 , y: sy + 12, rw: 5, rh: 3, c: "#ffff00", v: -5});
				arrRocket.push({x: sx - 10, y: sy - 15, rw: 5, rh: 3, c: "#ffff00", v: -5});
				audio = new Audio('sound/Laser_Burst_Gun(3p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
			if (stype === 3) {
				arrRocket.push({x: sx, y: sy + 16, rw: 5, rh: 3, c: "#ffff00", v: -5});
				arrRocket.push({x: sx, y: sy - 19, rw: 5, rh: 3, c: "#ffff00", v: -5});
				audio = new Audio('sound/Laser_Burst_Gun(4p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
		}
		
	
	}
	if (sdirection === 2){
		if (fire) {
        	arrRocket.push({x: sx - 3 , y:sy - 60, rw: 5, rh: 3 , c: "#ffff00", v: -5});
        
        	if (stype === 0) {
            	audio = new Audio('sound/Laser_Burst_Gun(1p).mp3');
				audio.volume = 0.2;
            	audio.play();
        	}
        	if (stype === 1) {
				arrRocket.push({x: sx - 3 , y: sy - 60  , rw: 5 , rh: 3, c: "#ffff00", v: -5});
				arrRocket.push({x: sx - 3 , y: sy - 60, rw: 5, rh: 3, c: "#ffff00", v: -5});
				audio = new Audio('sound/Laser_Burst_Gun(2p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
			if (stype === 2 || stype === 3) {
				arrRocket.push({x: sx + 10 , y: sy - 10, rw: 5, rh: 3, c: "#ffff00", v: -5});
				arrRocket.push({x: sx - 15, y: sy - 10, rw: 5, rh: 3, c: "#ffff00", v: -5});
				audio = new Audio('sound/Laser_Burst_Gun(3p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
			if (stype === 3) {
				arrRocket.push({x: sx + 15, y: sy, rw: 5, rh: 3, c: "#ffff00", v: -5});
				arrRocket.push({x: sx - 20, y: sy, rw: 5, rh: 3, c: "#ffff00", v: -5});
				audio = new Audio('sound/Laser_Burst_Gun(4p).mp3');
				audio.volume = 0.2;
				audio.play();
			}
		}
		
	
	}
	if (sdirection === 3){
		if (fire) {
        	arrRocket.push({x: sx - 3 , y:sy + 60, rw: 5, rh: 3 , c: "#ffff00", v: 5});
        
        	if (stype === 0) {
            	audio = new Audio('sound/Laser_Burst_Gun(1p).mp3');
				audio.volume = 0.2;
            	audio.play();
        		}
        	if (stype === 1) {
				arrRocket.push({x: sx - 3 , y: sy + 60  , rw: 5 , rh: 3, c: "#ffff00", v: 5});
				arrRocket.push({x: sx - 3 , y: sy + 60, rw: 5, rh: 3, c: "#ffff00", v: 5});
				audio = new Audio('sound/Laser_Burst_Gun(2p).mp3');
				audio.volume = 0.2;
				audio.play();
				}
			if (stype === 2 || stype === 3) {
				arrRocket.push({x: sx + 10 , y: sy + 10, rw: 5, rh: 3, c: "#ffff00", v: 5});
				arrRocket.push({x: sx - 15, y: sy + 10, rw: 5, rh: 3, c: "#ffff00", v: 5});
				audio = new Audio('sound/Laser_Burst_Gun(3p).mp3');
				audio.volume = 0.2;
				audio.play();
				}
			if (stype === 3) {
				arrRocket.push({x: sx + 15, y: sy, rw: 5, rh: 3, c: "#ffff00", v: 5});
				arrRocket.push({x: sx - 20, y: sy, rw: 5, rh: 3, c: "#ffff00", v: 5});
				audio = new Audio('sound/Laser_Burst_Gun(4p).mp3');
				audio.volume = 0.2;
				audio.play();
				}
		}
		
	
	}
    
}

function deleteRocket() {
    var i;
    for (i = 0; i < arrRocket.length; i += 1) {
        if (arrRocket[i].x > vcanvas0.width) { arrRocket.splice(i, 1); }
    }
}

function updateRocket() {
    var i;
	if (sdirection === 0 || sdirection === 1){
		for (i = 0; i < arrRocket.length; i += 1) {
        	arrRocket[i].x += arrRocket[i].v;
        	collisionRocket(arrRocket[i]);
    	}
	}
	if	 (sdirection === 2 || sdirection === 3){
		for (i = 0; i < arrRocket.length; i += 1) {
        	arrRocket[i].y += arrRocket[i].v;
        	collisionRocket(arrRocket[i]);
    	}
	}

}

function drawRocket() {
    var i;
    for (i = 0; i < arrRocket.length; i += 1) {
        ctx.fillStyle = arrRocket[i].c;
        ctx.fillRect(arrRocket[i].x * ratio , arrRocket[i].y * ratio, arrRocket[i].rw * ratio, arrRocket[i].rh * ratio);
    }
}

// Ship

function updateShip() {
    if (r_right) { sx += vel; }
    if (r_left) { sx -= vel; }
    if (r_down) { sy += vel; }
    if (r_up) { sy -= vel; }
	
	// 보정
    if (sx > vcanvas0.width - 60) { sx = vcanvas0.width - 60; }
    if (sx < 15) { sx = 15; }
    if (sy > vcanvas0.height - 15) { sy = vcanvas0.height - 15; }
    if (sy < 15) { sy = 15; }
}

function drawShip() {
	if (sdirection === 0){
		ctx.fillStyle = "red";
    	ctx.beginPath();
    	ctx.moveTo((sx - 15) * ratio, sy * ratio );
    	ctx.lineTo(sx * ratio , (sy - 15) *ratio );
		ctx.lineTo((sx + 60) * ratio, sy * ratio);
		ctx.lineTo(sx * ratio , (sy + 15) * ratio );
		ctx.closePath();
		ctx.fill();
		if (stype === 1) {
        	ctx.fillRect((sx + 42)* ratio ,(sy - 5)* ratio, 10 * ratio , 10* ratio);
    	}
    
    	if (stype > 1) {
        	ctx.fillRect((sx + 10)* ratio, (sy - 15)* ratio, 10 * ratio, 30 * ratio);
    	}
    
    	if (stype > 2) {
        	ctx.fillRect(sx * ratio, (sy - 19)* ratio, 11 * ratio, 38 * ratio);
    	}
	}
	if (sdirection === 1){
		ctx.fillStyle = "blue";
    	ctx.beginPath();
    	ctx.moveTo((sx + 15) * ratio, sy * ratio );
    	ctx.lineTo(sx * ratio , (sy - 15) *ratio );
		ctx.lineTo((sx - 60) * ratio, sy * ratio);
		ctx.lineTo(sx * ratio , (sy + 15) * ratio );
		ctx.closePath();
		ctx.fill();
		if (stype === 1) {
        	ctx.fillRect((sx - 52)* ratio ,(sy - 5)* ratio, 10 * ratio ,10 * ratio);
    	}
    
    	if (stype > 1) {
        	ctx.fillRect((sx - 20)* ratio, (sy - 15)* ratio, 10 * ratio, 30 * ratio);
    	}
    
    	if (stype > 2) {
        	ctx.fillRect( (sx - 10) * ratio, (sy - 19)* ratio, 11 * ratio, 38 * ratio);
    	}
	}
    if (sdirection === 2){
		ctx.fillStyle = "yellow";
    	ctx.beginPath();
    	ctx.moveTo((sx - 15) * ratio, sy * ratio );
    	ctx.lineTo(sx * ratio , (sy + 15) *ratio );
		ctx.lineTo((sx + 15) * ratio, sy * ratio);
		ctx.lineTo(sx * ratio , (sy - 60) * ratio );
		ctx.closePath();
		ctx.fill();
		if (stype === 1) {
        	ctx.fillRect((sx - 5)* ratio ,(sy - 52)* ratio, 10 * ratio , 10* ratio);
    	}
    
    	if (stype > 1) {
        	ctx.fillRect((sx - 15)* ratio, (sy - 17)* ratio, 30 * ratio, 10 * ratio);
    	}
    
    	if (stype > 2) {
        	ctx.fillRect((sx - 18.8) * ratio, (sy - 8)* ratio, 38 * ratio, 11 * ratio);
    	}
	}
	if (sdirection === 3){
		ctx.fillStyle = "skyblue";
    	ctx.beginPath();
    	ctx.moveTo((sx - 15) * ratio, sy * ratio );
    	ctx.lineTo(sx * ratio , (sy - 15) *ratio );
		ctx.lineTo((sx + 15) * ratio, sy * ratio);
		ctx.lineTo(sx * ratio , (sy + 60) * ratio );
		ctx.closePath();
		ctx.fill();
		if (stype === 1) {
        	ctx.fillRect((sx - 5)* ratio  ,(sy + 42)* ratio, 10 * ratio , 10* ratio);
    	}
    
    	if (stype > 1) {
        	ctx.fillRect((sx - 15)* ratio, (sy + 10)* ratio, 30 * ratio, 10 * ratio);
    	}
    
    	if (stype > 2) {
        	ctx.fillRect((sx - 18.8) * ratio, (sy)* ratio, 38 * ratio, 11 * ratio);
    	}
	}
}

function gameLoop() {
    clearCanvas();
    updateEnemy();
    deleteEnemy();
    drawEnemy();
    
    updateRocket();
    deleteRocket();
    drawRocket();
    
    updateShip();
    collisionShip();
    drawShip();
	
	updateParticle();
	drawParticle(particle);
}

function resizeCanvas(){
	var divH, w, h, newW, newH;	
	
	w = window.innerWidth - 22;
	h = window.innerHeight - 22;
	
	if (w <= h * proportionWH) {
		newW = w;
		newH = w / proportionWH;
	} else{
		newW = h * proportionWH;
		newH = h;
	}
	
	vcanvas.width = newW;
	vcanvas.height = newH;
	
	ratio = newW / vcanvas0.width;
	
	divH = (h - vcanvas.height) / 2;
	document.getElementById("myDiv").style.height = divH + "px";
}
function init() {
    vcanvas = document.getElementById("myCanvas");
    ctx = vcanvas.getContext("2d");
	
	vcanvas.width = 900;
	vcanvas.height = 400;
    proportionWH = vcanvas0.width / vcanvas0.height;
	resizeCanvas();
	
    setInterval(createEnemy, 400);
    setInterval(createWall, 20000);
    setInterval(createRocket, 100);
    setInterval(gameLoop, 16);
	

	
}

// key control
function set_key() {
    if (event.keyCode === 37) {  r_left = 1,  sdirection = 1; }
    if (event.keyCode === 38) {  r_up = 1, sdirection = 2;  }
    if (event.keyCode === 39) {  r_right = 1, sdirection = 0;  }
    if (event.keyCode === 40) {  r_down = 1, sdirection = 3;  }

    if (event.keyCode === 48) { stype = 0; }
    if (event.keyCode === 49) { stype = 1; }
    if (event.keyCode === 50) { stype = 2; }
    if (event.keyCode === 51) { stype = 3; }
    
    if (event.keyCode === 32) { fire = 1; }
}

function stop_key() {
    if (event.keyCode === 37) {  r_left = 0; }
    if (event.keyCode === 38) {  r_up = 0;  }
    if (event.keyCode === 39) {  r_right = 0;  }
    if (event.keyCode === 40) {  r_down = 0;  }

    if (event.keyCode === 32) {  fire = 0;  }
}

document.onkeydown = set_key;
document.onkeyup = stop_key;
