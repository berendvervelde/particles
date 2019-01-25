(function(){
    var pColors = ["rgb( 200,  30,  30 )", "rgb( 200, 150,  30 )", "rgb( 200, 200,  30 )", "rgb(  30, 190,  30 )", "rgb(  70,  70, 210 )", "rgb( 130,  40, 170 )", "rgb( 110,  30,  30 )", "rgb( 110,  80,  30 )", "rgb( 120, 120,  50 )", "rgb(  30, 100,  30 )", "rgb(  30,  30, 160 )", "rgb( 100,  30, 130 )" ];
    var NUMPARTICLES = 800,
        NUMTYPES = 12,
        NUMSTEPS = 10,
        ANIMWAIT = 10,
        RADIUS = 3.0,
        DOUBLEPI = 2 * Math.PI,
        BOUNCE = 0.02;
    var animTimer = 0;
    var particles = [];
    var pType = [];

    function init() {
        var canvas = document.createElement('canvas');
        document.body.insertBefore(canvas, document.body.firstChild);
        setCanvasSize(canvas);

        var context = canvas.getContext("2d");
        initParticles(1, {w : canvas.width, h: canvas.height});
        initType(0);
        var grid = [];

        setInterval((function (c, i) {
                    return function () {
                        draw_anim(c, i, canvas, {w : canvas.width, h: canvas.height}, grid);
                    };
        })(context, particles), 10);
    }

    function initParticles(type, size) {
        switch (type){
            case 0:
            for (var i=0; i<NUMPARTICLES; i++){
                particles.push({
                    type: Math.floor(i * NUMTYPES / NUMPARTICLES),
                    xf : Array.from(Array(NUMSTEPS), () => 0),
                    yf : Array.from(Array(NUMSTEPS), () => 0),
                    vx : Math.random() - 0.5,
                    vy : Math.random() - 0.5,
                    x: Math.floor(Math.random() * size.w),
                    y: Math.floor(Math.random() * size.h)
                });
            }
            break;
            case 1:
            for (var i=0; i<NUMPARTICLES; i++){
                particles.push({
                    type: Math.floor(i * NUMTYPES / NUMPARTICLES),
                    xf : Array.from(Array(NUMSTEPS), () => 0),
                    yf : Array.from(Array(NUMSTEPS), () => 0),
                    vx : Math.random() - 0.5,
                    vy : Math.random() - 0.5,
                    x: size.w / 2,
                    y: size.h / 2
                });
            }
            break;
        }
        
    }

    function initType(type){
        switch (type){
            case 0:
            for (var i=0; i<NUMTYPES; i++){
                pType.push({
                   steps: NUMSTEPS,
                   color: pColors[i],
                   force: setRandomForce(),
                   radius: setRandomRadius(),
               });
            }
            break;
            case 1:
            for (var i=0; i<NUMTYPES; i++){
                pType.push({
                   steps: 0,
                   color: pColors[i],
                   force: Array.apply(null, Array(12)).map(x => -1),
                   radius: setRandomRadius(),
               });
            }
            case 2:
            for (var i=0; i<NUMTYPES; i++){
                pType.push({
                   steps: 0,
                   color: pColors[i],
                   force: [0,0,0,0,0,0,0,0,0,0,0,0],
                   radius: [0,0,0,0,0,0,0,0,0,0,0,0],
               });
            }
            case 3:
            for (var i=0; i<NUMTYPES; i++){
                pType.push({
                   steps: 0,
                   color: pColors[i],
                   force: [0,0,0,0,0,0,0,0,0,0,0,0],
                   radius: [0,0,0,0,0,0,0,0,0,0,0,0],
               });
            }
            default:
            for (var i=0; i<NUMTYPES; i++){
                pType.push({
                   steps: 0,
                   color: pColors[i],
                   force: [0,0,0,0,0,0,0,0,0,0,0,0],
                   radius: [0,0,0,0,0,0,0,0,0,0,0,0],
               });
            }
            break;
        }
    }

    function setRandomForce(){
        var force = [];
        for (var i=0; i<NUMTYPES; i++) {
            force.push(Math.random() * 5 - 3);
        }
        return force;
    }
    function setRandomRadius(){
        var radius = [];
        for (var i=0; i<NUMTYPES; i++) {
            // bigger radii gives better results 
            var value = Math.random() * 100 + 35;
            radius.push(value);
        }
        return radius;
    }

    function draw_anim(context, particles, canvas, size, grid) {
        var timer = Date.now();
        if (timer - animTimer > ANIMWAIT) {
            animTimer = timer;
            context.clearRect(0, 0, canvas.width, canvas.height);
            update();

            for (var i=0; i<NUMPARTICLES; i++) {
                drawparticle(context, particles[i]);
                manageEdge(particles[i], size);
            }
        }
    }

    function update(){
        for (var i=0; i<NUMPARTICLES; i++){
            // apply friction and update position based on its vector
            particles[i].vx *= 0.8;
            particles[i].vy *= 0.8;
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            updateParticleInteraction(i);
            // update stepper, if steps is bigger than 0 the particles' response will be delayed, causing them to ocillate or rotate
            for (var j=0; j< pType[particles[i].type].steps; j++){
                particles[i].xf[j] = particles[i].xf[j+1];
                particles[i].yf[j] = particles[i].yf[j+1];
            }
            particles[i].vx += particles[i].xf[0];
            particles[i].vy += particles[i].yf[0];
        }
    }

    function updateParticleInteraction(index){
        var param4 = 0.0;
        var param5 = 0.0;
        var counter = 0;
        for (var i=0; i<NUMPARTICLES; i++){
            if(i!== index){
                var dx = particles[i].x - particles[index].x;
                var dy = particles[i].y - particles[index].y;
                var dSquared = dx * dx + dy * dy;
                if (dSquared < pType[particles[index].type].radius[particles[i].type] * pType[particles[index].type].radius[particles[i].type]){
                    var d = Math.sqrt(dSquared);
                    var pDiam = RADIUS * 2.0;
                    if (d < pDiam){
                        if(d > 0.0){
                            var param1 = dx / pDiam;
                            var param2 = dy / pDiam;
                            var param3 = 1.0 - (d / pDiam);
                            particles[index].vx -= param1 * param3;
                            particles[index].vy -= param2 * param3;
                        }
                    }
                    var force = pType[particles[index].type].force[particles[i].type];
                    param4 += (dx / d) * force;
                    param5 += (dy / d) * force;
                    counter ++;
                }
            }
        }
        var step = pType[particles[index].type].steps;
        if(counter > 0){
            particles[index].xf[step] = param4 / counter;
            particles[index].yf[step] = param5 / counter;
        } else {
            particles[index].xf[step] = 0.0;
            particles[index].yf[step] = 0.0;
        }
    }

    function setCanvasSize(canvas) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawparticle(context, particle) {
        context.beginPath();
        context.arc(particle.x, particle.y, RADIUS, 0, DOUBLEPI);
        context.fillStyle = pType[particle.type].color;
        context.fill();
    }
    
    function manageEdge(particle, size){
        if(particle.x - RADIUS < 0) {
            particle.x = RADIUS;
            particle.vx = BOUNCE;
        }
        if(particle.y - RADIUS < 0) {
            particle.y = RADIUS;
            particle.vy = BOUNCE;
        }
        if(particle.x + RADIUS > size.w) {
            particle.x = size.w -RADIUS;
            particle.vx = -BOUNCE;
        }
        if(particle.y > size.h) {
            particle.y = size.h -RADIUS;
            particle.vy = -BOUNCE;
        }
    }

    init();
}());