
var woodTexture = THREE.ImageUtils.loadTexture( "textures/wood_log.png" );
woodTexture.magFilter = THREE.NearestFilter;
woodTexture.minFilter = THREE.NearestFilter;

var rockTexture = THREE.ImageUtils.loadTexture( "textures/rock_sml.png" );
rockTexture.magFilter = THREE.NearestFilter;
rockTexture.minFilter = THREE.NearestFilter;

rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
rockTexture.repeat.set( 3, 1 );

var createPlayer = function(scene, playerSystem, threeJsSystem) {
	var entity = {};
	var geom = new THREE.PlaneGeometry( 1, 2);
	var mat = new THREE.MeshBasicMaterial({color: 0xFF0000});
	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = new THREE.Mesh( geom, mat );
	entity.threeJsComponent.positionOffset.y += 0.5;
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();

	scene.add(entity.threeJsComponent.mesh);

	entity.collisionComponent = new CollisionComponent();
	entity.collisionComponent.halfWidth = 0.5;
	entity.collisionComponent.halfHeight = 0.5;

	playerSystem.player = entity;

	return entity;
}

var createBlock = function(scene, x, y, playerSystem, threeJsSystem) {
	var entity = {};
	var geom = new THREE.PlaneGeometry( 3, 3);
	entity.collisionComponent = new CollisionComponent();
	entity.collisionComponent.halfWidth = 1.5;
	entity.collisionComponent.halfHeight = 1.5;
	entity.collisionComponent.canMoveHorizontally = true;
	
	var mat = new THREE.MeshBasicMaterial({color: 0x404040});
	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = new THREE.Mesh( geom, mat );
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();

	entity.positionComponent.position.set(x, y, -0.001);

	playerSystem.playerCollisionEntities.push(entity);

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

var createRoller = function(scene, horizontal, x, y, playerSystem, threeJsSystem) {
	var entity = {};
	var geom = null;
	entity.collisionComponent = new CollisionComponent();
	if(horizontal) {
		geom = new THREE.PlaneGeometry( 4, 0.5);
		entity.collisionComponent.halfWidth = 2;
		entity.collisionComponent.halfHeight = 0.25;
		entity.collisionComponent.canMoveHorizontally = false;
	} else  {
		geom = new THREE.PlaneGeometry( 0.5, 4);
		entity.collisionComponent.halfWidth = 0.25;
		entity.collisionComponent.halfHeight = 2;
		entity.collisionComponent.canMoveVertically = false;
	}
	var mat = new THREE.MeshBasicMaterial({color: 0xFFaa00});
	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = new THREE.Mesh( geom, mat );
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();

	entity.positionComponent.position.set(x, y, -0.0001);

	playerSystem.playerCollisionEntities.push(entity);

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

