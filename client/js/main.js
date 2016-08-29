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

var winSound = new Audio("sounds/done.wav");
var failSound = new Audio("sounds/broken.wav");

var respondToResize = function() {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();

    if(renderer != null) {
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
    $("#restartButton").css({top: window.innerHeight-50, left: (window.innerWidth/2)-50, position:'absolute'});
}


var lastFrameTime = 0;
var input = null;

var threeJsSystem = null;
var playerSystem = null;
var threeCamera = null;
var player = null;
var levelIndex = 0;

function initGame(keepText) {
    var level = levels[levelIndex];
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xd5f4ff );

    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.zIndex = 1;

    container.innerHTML = '';

    container.appendChild(renderer.domElement);
    // container.appendChild( stats.domElement );

    var light = new THREE.AmbientLight( 0xffffff );
    scene.add( light );

    input = new Input();
    lastFrameTime = 0;
    threeJsSystem = new ThreeJsSystem();
    playerSystem = new PlayerSystem(input, scene, threeJsSystem);

    threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000 );
    threeCamera.position.set(0, 0, 25);
    threeCamera.lookAt(new THREE.Vector3(0, 0, 0));

    for(var x = -10; x < 14; x+=4) {
        createLongGroundTile(scene, x, 0, threeJsSystem);
    }

    for(var i in level.entities) {
        var e = level.entities[i];

        switch(e.type) {
            case("player"): {
                player = createPlayer(scene, e.x, e.y, playerSystem, threeJsSystem);
                break;
            }
            case("block"): {
                createBlock(scene, e.x, e.y, playerSystem, threeJsSystem);
                break;
            }
            case("tree"): {
                createTree(scene, e.x, e.y, playerSystem, threeJsSystem);
                break;
            }
            case("roller"): {
                createRoller(scene, e.horizontal, e.x, e.y, playerSystem, threeJsSystem);
                break;
            }
            case("finish"): {
                createFinish(scene, e.x, e.y, playerSystem, threeJsSystem);
                break;
            }
        }
    }

    if(!keepText) {

        if(level.levelTitle != null) {
            $('#modalTitle').text(level.levelTitle);    
        }
        if(level.levelMessage != null) {
            $('#modalMessage').text(level.levelMessage);    
        }
        if(level.buttonText != null) {
            $('#modalButton').text(level.buttonText);    
        }
    }
    $('#myModal').modal('show');
    respondToResize();
}

function render(t) {
    stats.begin();
    var tick = Math.min(0.1, (t - lastFrameTime) / 1000);
    lastFrameTime = t;
    requestAnimationFrame(render);

    playerSystem.update(t, tick);
    threeJsSystem.update(tick);

    renderer.render(scene, threeCamera);

    if(player.playerComponent.levelComplete) {
        levelIndex++;
        if(levelIndex < levels.length) {
            initGame();
        } else {
            levelIndex = 0;
            $('#modalTitle').text('CONGRATULATIONS!');
            $('#modalMessage').text('YOU FINISHED ALL THE LEVELS!');    
            $('#modalButton').text('PLAY AGAIN!'); 
            initGame(true);
        }
    }

    if(player.playerComponent.failed) {
        $('#modalTitle').text('YOU BROKE YOUR ROCK!');
        $('#modalMessage').text('TRY AND KEEP IT ON TWO PARALLEL LOGS AT ALL TIMES!');    
        $('#modalButton').text('TRY AGAIN ...'); 
        initGame(true);
        
    }

    stats.end();
}

$(function() {
    initGame();
    window.addEventListener("resize", respondToResize);
    requestAnimationFrame(render);

    $('#restartButton').click(function() {
        initGame();
    });
});


