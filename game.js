const cvs = document.getElementById('bird');
const ctx = cvs.getContext('2d');


// VARS
let frames = 0;
const DEGREE = Math.PI/180;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = 'img/litsprite.png';

// LOAD SOUNDS
const score_s = new Audio();
score_s.src = 'audio/sfx_point.wav';

const die_s = new Audio();
die_s.src = 'audio/sfx_die.wav';

const flap_s = new Audio();
flap_s.src = 'audio/sfx_flap.wav';

const hit_s = new Audio();
hit_s.src = 'audio/sfx_hit.wav';

const swooshing_s = new Audio();
swooshing_s.src = 'audio/sfx_swooshing.wav';

// GAME STATE OBJ
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    gameOver: 2
}

// START BTN
const startBtn = {
    x: 120,
    y:263,
    w:83,
    h: 29
}

// GAME STATE LISTENER

cvs.addEventListener('click', function(e){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            swooshing_s.play();
            break;
        case state.game:
            bird.flap();
            flap_s.play();
            break;
        case state.gameOver:
            let rect = cvs.getBoundingClientRect();
            let clickX = e.clientX - rect.left;
            let clickY = e.clientY - rect.top;

            if( clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w &&
                clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                    pipes.reset();
                    bird.speedReset();
                    score.reset();
                    state.current = state.getReady;
                }
            break;
    }
})

document.addEventListener('keydown', function(k){
    if(state.current == state.getReady){
        if(k.keyCode == 13) {
            state.current = state.game;
            swooshing_s.play();
        }
    }
    if(state.current == state.gameOver){
        if (k.keyCode == 13) {
            pipes.reset();
            bird.speedReset();
            score.reset();
            state.current = state.getReady;
        }
    }  
})

document.addEventListener("keydown", function (event) {
    if(state.current == state.game){
        if (event.keyCode == 32) {
            bird.flap();
            flap_s.play();
        }
    }
    
})

// BACKGROUND

const bg = {
    sX : 0,
    sY: 0,
    w:275,
    h:226,
    x:0,
    y:cvs.height - 226,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y,
            this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y,
            this.w, this.h);
    }
}
// FOREGROUND
const fg = {
    sX: 276,
    sY: 0,
    w:224,
    h:112,
    x:0,
    y:cvs.height - 112,
    dx: 2,
    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y,
            this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y,
            this.w, this.h);
    },

    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}
// BIRD
const bird = {
    animation: [
        {sX: 276,sY:112},
        {sX: 276,sY:139},
        {sX: 276,sY:166},
        {sX: 276,sY:139}
    ],
    x: 50,
    y: 150,
    w:34,
    h:26,
    radius: 12,

    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,


    draw: function(){
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,  - this.w/2, -this.h/2,
        this.w, this.h);

        ctx.restore();
    },
    flap: function(){
        this.speed = - this.jump; 
    },
    update: function(){
        this.period = state.current == state.getReady ? 10 : 5;
        this.frame += frames%this.period == 0 ? 1 : 0;
        this.frame = this.frame%this.animation.length;

        if(state.current == state.getReady) {
            this.y = 150;
            this.rotation = 0 * DEGREE;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= cvs.height  - fg.h){
                this.y = cvs.height-fg.h-this.h/2;
                if(state.current == state.game){
                    state.current = state.gameOver;
                    die_s.play();
                }
            }

            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },
    speedReset: function(){
        this.speed = 0;
    }
}

// GETREADY MSG
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,

    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

// GAMEOVER MSG
const gameOver = {
    sX: 175,
    sY:228,
    w: 225,
    h: 202,
    x: cvs.width/2 - 225/2,
    y:90,

    draw: function () {
        if(state.current == state.gameOver){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y,this.w, this.h);
        }       
    }

}

// PIPES
const pipes = {
    position: [],
    top: {
        sX: 553,
        sY:0
    },
    bottom: {
        sX:502,
        sY:0
    },
    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function(){
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.gap + this.h;

            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function(){
        if(state.current !== state.game)return;

        if(frames%100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1 )
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];

            
            let bottomPipeYPos = p.y + this.h + this.gap;

            if(bird.x + bird.radius>p.x && bird.x-bird.radius<p.x+this.w && 
                bird.y + bird.radius>p.y && bird.y-bird.radius<p.y+this.h){
                    state.current = state.gameOver;
                    hit_s.play();
                }
            if(bird.x + bird.radius>p.x && bird.x-bird.radius<p.x+this.w && 
                bird.y + bird.radius>bottomPipeYPos && bird.y-bird.radius<bottomPipeYPos+this.h){
                    state.current = state.gameOver;
                    hit_s.play();
                }

            p.x -= this.dx;

            if (p.x+this.w <= 0) {
                this.position.shift();
                score.value+=1;
                score_s.play();

                score.best = Math.max(score.value, score.best);
                localStorage.setItem('best', score.best);
            }
        }
    },
    reset: function(){
        this.position = [];
    }
}

const controls = {
    value: 'Press Enter to Start',
    value2: 'Press Spacebar to Flap',

    draw: function(){
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';

        if (state.current == state.getReady) {
            ctx.lineWidth = 1.7;
            ctx.font = '25px "Bungee Inline"';
            ctx.textAlign = 'center';
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
        }
        if(state.current == state.getReady){
            ctx.lineWidth = 1.5;
            ctx.font = '22px "Bungee Inline"';
            ctx.textAlign = 'center';
            ctx.fillText(this.value2, cvs.width / 2, 450);
            ctx.strokeText(this.value2, cvs.width / 2, 450);
        }
    }
}

const score = {
    best:parseInt(localStorage.getItem('best')) || 0,
    value: 0,

    draw: function(){
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';

        if(state.current == state.game) {
            ctx.lineWidth = 2;
            ctx.font = '35px "Bungee Inline"';
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
        }else if(state.current == state.gameOver){
            // SCORE VALUE
            ctx.font = '25px "Bungee Inline"';
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225,228);
            ctx.strokeText(this.best, 225,228);
        }
    },

    reset: function(){
        this.value = 0;
    }

}


// DRAW
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0,0, cvs.width, cvs.height);
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
    controls.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}
loop();