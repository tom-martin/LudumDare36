var scene = null;

var renderer = null;

var container = document.getElementById('container');

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';


var handleTouchStart = function(evt) {
    // reqFullScreen();
}

function reqFullScreen() {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
}

function onClick( event ) {
    // reqFullScreen();
}

window.addEventListener( 'click', onClick, false );
window.addEventListener("touchstart", handleTouchStart, false);

var respondToResize = function() {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


var lastFrameTime = 0;
var input = null;

var threeJsSystem = null;
var playerSystem = null;
var threeCamera = null;
var player = null;


function initGame() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xd5f4ff );

    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.zIndex = 1;

    container.innerHTML = '';

    container.appendChild(renderer.domElement);
    container.appendChild( stats.domElement );

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    input = new Input();
    lastFrameTime = 0;
    threeJsSystem = new ThreeJsSystem();
    playerSystem = new PlayerSystem(input);

    threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000 );
    threeCamera.position.set(0, 0, 20);
    threeCamera.lookAt(new THREE.Vector3(0, 0, 0));

    createPlayer(scene, playerSystem, threeJsSystem);
    createRoller(scene, true, 2, 2, playerSystem, threeJsSystem);
    createRoller(scene, false, 4, -3, playerSystem, threeJsSystem);

    createRoller(scene, true, 3, 4, playerSystem, threeJsSystem);
    createRoller(scene, false, 4, -1, playerSystem, threeJsSystem);

    createBlock(scene, 0, -1, playerSystem, threeJsSystem);
}

function render(t) {
    stats.begin();
    var tick = Math.min(0.1, (t - lastFrameTime) / 1000);
    lastFrameTime = t;
    requestAnimationFrame(render);

    playerSystem.update(tick);
    threeJsSystem.update(tick);

    renderer.render(scene, threeCamera);

    stats.end();
}

initGame();
window.addEventListener("resize", respondToResize);
respondToResize();
requestAnimationFrame(render);

