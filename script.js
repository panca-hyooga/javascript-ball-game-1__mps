//this will be used to store main game state checker with setinterval
let ballstate_interval;
//this will be used to store time lapsed that are counted by an individual setinterval function that are called each 100ms interval.
let timelapsed_interval;

//determine the speed of the ball moving.
let x_force = 0;
let y_force = 0;

//(1) Store all element present in DOM into variable
const arena_element = document.getElementById("arena");
const ball_element = document.getElementById("ball");
const bumper_element = document.getElementById("bumper");
const start_button = document.getElementById("start");
const brick_container = document.getElementById("brick-container");
const timer_element = document.getElementById("time-lapsed");
const score_element = document.getElementById("score-counter");
const result_banner_element = document.getElementById("result-banner");

//(2) Read the arena element node, width and height (measure units in pixel)
const arena_width = arena_element.offsetWidth;
const arena_height = arena_element.offsetHeight;

//(3) Read the ball element node, width and height (measure units in pixel)
const ball_width = ball_element.offsetWidth;
const ball_height = ball_element.offsetHeight;
const ball_half_w = ball_width / 2;
const ball_half_h = ball_height / 2;
//(4) Calculation to determine how far the balls should go until it reach the bottom side and the right side of the arena.
const ball_max_offsetbottom = arena_height - ball_height;
const ball_max_offsetright = arena_width - ball_width;

//(17) register sound effect
const sfx_play = function(filename){
    const newaudio = new Audio(filename);
    newaudio.play();
};

//(6) Capture the bumper distance range from the left side of the arena.
let last_bump_left = bumper_element.offsetLeft;

//(6.1) A function that determines how the ball will be moved.
//we will call this function in a "setInterval", later on...
const ball_mover = function(){
    //(6.2) change the force value depend on where the ball are hitting.
    (function ifBallHitWall(){
        //(6.3) if the ball hitting the left-most side of the arena...
        if(ball_element.offsetLeft <= 0){
            x_force = Math.abs(x_force);
        }
        //(6.4) if the ball are hitting the right-most side of the arena...
        else if(ball_element.offsetLeft >= ball_max_offsetright){
            x_force = -Math.abs(x_force);
        }

        //(6.5) if the ball are hitting the top-most side of the arena...
        if(ball_element.offsetTop <= 0){
            y_force = Math.abs(y_force);
        }
        //(6.6) if the ball are hitting the bottom-most side of the arena...
        else if(ball_element.offsetTop >= ball_max_offsetbottom){
            //enable this if you want the ball can be bounce back if it hit the bottom of the arena
            //y_force = -Math.abs(y_force);

            //(13) implement lose condition
            clearInterval(timelapsed_interval);
            clearInterval(ballstate_interval);
            ball_element.parentNode.removeChild(ball_element);
            bumper_element.parentNode.removeChild(bumper_element);
            //setup result banner on the UI to inform the player that he is losing
            result_banner_element.style.height = "100%";
            result_banner_element.style.backgroundColor = "red";
            result_banner_element.textContent = "GAME OVER!";
        };
    })();

    //(6.8) change the force value if the ball are hitting the bumper
    (function ifBallHitBumper(){
        //(6.9) this if statement purpose to check, is the bottom side of the ball are hitting the top side of the bumper while it curently within a range between left and right side of the bumper?
        if(ball_element.offsetLeft + ball_width >= bumper_element.offsetLeft &&
            ball_element.offsetLeft <= bumper_element.offsetLeft + bumper_element.offsetWidth &&
            ball_element.offsetTop + ball_height >= bumper_element.offsetTop
        ){
            //(6.10) make the y_force become negative number. thats mean the ball will move to the top.
            y_force = -Math.abs(y_force);
            //(6.11) at the moment when the ball hitting the bumper, there are short amount of time where we can make a friction.
            //for example, when we move bumper from left to right, it should create a litle bit force to move the ball to the right (and vice versa).
            const bumper_friction = (bumper_element.offsetLeft - last_bump_left) / 10; //we calculate bumper offsetleft that has been captured on the last 10 millisecond, with the curent bumper offsetLeft.
            if(bumper_friction !== 0){
                x_force = 0 + bumper_friction;
                console.log('bumped hori');
            };

            //(17.2) play bump sfx
            sfx_play("bumping.mp3");
        };
    })();

    //(11)detect if the ball are bumping with the bricks
    (function ifBallHitBricks(){
        const ball_real_left = arena_element.offsetLeft+ball_element.offsetLeft;
        const ball_real_top = arena_element.offsetTop+ball_element.offsetTop;
        
        //(16) prepare score increment counter
        let score_increment_val = 0;
        
        //(11.1)if top edge of the ball is bumping with a bricks
        const brick_from_top = document.elementFromPoint(ball_real_left + ball_half_w, ball_real_top - 1);
        if(brick_from_top && brick_from_top.classList.contains("bricks")){
            brick_from_top.parentNode.removeChild(brick_from_top);
            y_force = Math.abs(y_force);

            //(16.1) add score
            score_increment_val += 1;

            //(17.1) play sfx
            sfx_play("breaks.mp3");
        };
        //(11.2)if left edge of the ball is bumping with a bricks
        const brick_from_left = document.elementFromPoint(ball_real_left - 1, ball_real_top + ball_half_h);
        if(brick_from_left && brick_from_left.classList.contains("bricks")){
            brick_from_left.parentNode.removeChild(brick_from_left);
            x_force = Math.abs(x_force);

            //(16.1) add score
            score_increment_val += 1;

            //(17.1) play sfx
            sfx_play("breaks.mp3");
        };
        //(11.3)if right edge of the ball is bumping with a bricks
        const brick_from_right = document.elementFromPoint(ball_real_left + ball_width + 1, ball_real_top + ball_half_h);
        if(brick_from_right && brick_from_right.classList.contains("bricks")){
            brick_from_right.parentNode.removeChild(brick_from_right);
            x_force = -Math.abs(x_force);

            //(16.1) add score
            score_increment_val += 1;

            //(17.1) play sfx
            sfx_play("breaks.mp3");
        };
        //(11.4)if bottom edge of the ball is bumping with a bricks
        const brick_from_bottom = document.elementFromPoint(ball_real_left + ball_half_w, ball_real_top + ball_height + 1);
        if(brick_from_bottom && brick_from_bottom.classList.contains("bricks")){
            brick_from_bottom.parentNode.removeChild(brick_from_bottom);
            y_force = -Math.abs(y_force);

            //(16.1) add score
            score_increment_val += 1;

            //(17.1) play sfx
            sfx_play("breaks.mp3");
        };

        //(16.2) show accumulated score increment on the UI (if any)
        const newscore = parseInt(score_element.textContent) + score_increment_val;
        score_element.textContent = newscore;
    })();


    //(6.12) draw new position for the ball on the UI.
    ball_element.style.top = `${ball_element.offsetTop + y_force}px`;
    ball_element.style.left = `${ball_element.offsetLeft + x_force}px`;

    //(6.7) update bumper offsetLeft value. This will be used to determine how much bumper friction will be created...
    last_bump_left = bumper_element.offsetLeft;

    //(12) implement win condition
    if(!brick_container.querySelector(".bricks")){
        clearInterval(timelapsed_interval);
        clearInterval(ballstate_interval);
        ball_element.parentNode.removeChild(ball_element);
        bumper_element.parentNode.removeChild(bumper_element);
        //setup result banner on the UI to inform the player that he is winning
        result_banner_element.style.height = "100%";
        result_banner_element.style.backgroundColor = "blue";
        result_banner_element.textContent = "YOU WIN!";
    };
};

//(7) hold the value of bumper initial left position on the first page load. Initial position thats mean this cant be changed.
const bumper_init_left = bumper_element.offsetLeft;
//(8) get mouse pointer position when the button is pressed.
let mouse_init_x;

//(9) Create a function to setup the game.
const throw_ball = function(click_event){
    //(9.1) Remove the text from the bumper
    this.innerHTML = '';
    //(9.2) And change the cursor pointer to inform the player that he now can move bumper to the left or right side.
    this.style.cursor = "w-resize";

    //(9.3) Set initial foce value
    y_force = -4;
    x_force = 0;

    //(9.4) Begin moving the ball every 10 millisecond
    ballstate_interval = setInterval(ball_mover, 10);

    //(9.5) Read mouse pointer location.
    mouse_init_x = click_event.clientX;

    //(9.6) when user moving cursor horizontally, the bumper element will follow..
    document.addEventListener("mousemove", function(mousemove_event){
        bumper_element.style.left = `${bumper_init_left - (mouse_init_x - mousemove_event.clientX)}px`;
    });

    //(9.7) prevent player for trigger this "throw_ball" function again..
    bumper_element.removeEventListener("click", throw_ball);

    //(15) run new interval for increasing the timer
    timelapsed_interval = setInterval(increase_timerval, 100);
};

//(10) When the player are clicking on the bumper, the game will start...
bumper_element.addEventListener("click", throw_ball);

//(14) create interval function for counting the timer
const increase_timerval = function(){
    //this will determine how much value added to "time", on each interval.
    const time_increment_val = 0.12;

    const newtime = parseFloat(timer_element.innerText) + time_increment_val;
    timer_element.innerText = newtime.toFixed(2);
};