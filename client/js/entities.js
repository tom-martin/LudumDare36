
var createGroundTile = function(scene, x, y, threeJsSystem) {
	var entity = {};

	var anim = "ground1";
	if(Math.random() < 0.5) {
		anim = "ground2";
	}
	var sprite = new Sprite(2, 2, scene, Textures.groundSheet, anim, 1, null);
	sprite.setAnim(anim);
	sprite.update(0);

	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = sprite.mesh;
	entity.threeJsComponent.renderOrderOffset = -100;
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();
	entity.positionComponent.position.set(x, y, 0);

	entity.spriteComponent = new SpriteComponent();
	entity.spriteComponent.sprite = sprite;

	entity.positionComponent.position.set(x, y, -0.01);

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

var createLongGroundTile = function(scene, x, y, threeJsSystem) {
	var entity = {};
	var sprite = new Sprite(4, (704/128)*4, scene, Textures.longGroundSheet, "longGround", 1, null);

	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = sprite.mesh;
	entity.threeJsComponent.renderOrderOffset = -100;
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();
	entity.positionComponent.position.set(x, y, 0);

	entity.spriteComponent = new SpriteComponent();
	entity.spriteComponent.sprite = sprite;

	entity.positionComponent.position.set(x, y, -0.01);

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

var createPlayer = function(scene, x, y, playerSystem, threeJsSystem) {
	var entity = {};

	var sprite = new Sprite(64/45, 2, scene, Textures.playerSheet, "playerSouth", 1, null);

	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = sprite.mesh;
	entity.threeJsComponent.positionOffset.y += 0.5;
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();
	entity.positionComponent.position.set(x, y, 0);

	entity.spriteComponent = new SpriteComponent();
	entity.spriteComponent.sprite = sprite;

	scene.add(entity.threeJsComponent.mesh);

	entity.playerComponent = new PlayerComponent();

	entity.collisionComponent = new CollisionComponent();
	entity.collisionComponent.halfWidth = 0.5;
	entity.collisionComponent.halfHeight = 0.5;

	playerSystem.player = entity;

	return entity;
}

var createTree = function(scene, x, y, playerSystem, threeJsSystem) {
	var entity = {};

	var sprite = new Sprite(2, 4, scene, Textures.treeSheet, "tree", 1, null);

	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = sprite.mesh;
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();
	entity.positionComponent.position.set(x, y, 0);

	entity.spriteComponent = new SpriteComponent();
	entity.spriteComponent.sprite = sprite;

	scene.add(entity.threeJsComponent.mesh);

	entity.collisionComponent = new CollisionComponent();
	entity.collisionComponent.halfWidth = 1;
	entity.collisionComponent.halfHeight = 1;
	entity.threeJsComponent.positionOffset.y += 1;
	entity.collisionComponent.canMoveVertically = false;
	entity.collisionComponent.canMoveHorizontally = false;
	entity.collisionComponent.isTree = true;

	playerSystem.playerCollisionEntities.push(entity);

	return entity;
}

var createBlock = function(scene, x, y, playerSystem, threeJsSystem) {
	var entity = {};

	entity.collisionComponent = new CollisionComponent();
	entity.collisionComponent.halfWidth = 1.5;
	entity.collisionComponent.halfHeight = 1.5;
	entity.collisionComponent.isBlock = true;

	var sprite = new Sprite(3, 3, scene, Textures.rockSheet, "rock", 1, null);
	
	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = sprite.mesh;
	threeJsSystem.entities.push(entity);

	entity.positionComponent = new PositionComponent();
	entity.positionComponent.position.set(x, y, -0.00001);

	playerSystem.playerCollisionEntities.push(entity);
	playerSystem.blockEntity = entity;

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

var createFinish = function(scene, x, y, playerSystem, threeJsSystem) {
	var entity = {};

	entity.collisionComponent = new CollisionComponent();
	entity.collisionComponent.halfWidth = 2;
	entity.collisionComponent.halfHeight = 2;
	entity.collisionComponent.isBlock = true;

	var sprite = new Sprite(4, 4, scene, Textures.finishSheet, "finish", 1, null);
	
	entity.threeJsComponent = new ThreeJsComponent();
	entity.threeJsComponent.mesh = sprite.mesh;
	threeJsSystem.entities.push(entity);

	entity.positionComponent = new PositionComponent();
	entity.positionComponent.position.set(x, y, -0.001);

	playerSystem.finishEntity = entity;

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

var createRoller = function(scene, horizontal, x, y, playerSystem, threeJsSystem) {
	var entity = {};


	entity.threeJsComponent = new ThreeJsComponent();
	entity.collisionComponent = new CollisionComponent();
	if(horizontal) {
		entity.collisionComponent.halfWidth = 2;
		entity.collisionComponent.halfHeight = 0.25;
		entity.collisionComponent.canMoveHorizontally = false;

		var sprite = new Sprite(4, 1, scene, Textures.rollerSheet, "roller", 1, null);
		entity.threeJsComponent.mesh = sprite.mesh;
	} else  {
		entity.collisionComponent.halfWidth = 0.25;
		entity.collisionComponent.halfHeight = 2;
		entity.collisionComponent.canMoveVertically = false;

		var sprite = new Sprite(1, 4, scene, Textures.rollerVertSheet, "rollerVert", 1, null);
		entity.threeJsComponent.mesh = sprite.mesh;
	}
	entity.collisionComponent.isRoller = true;
	threeJsSystem.entities.push(entity);
	entity.positionComponent = new PositionComponent();

	entity.positionComponent.position.set(x, y, -0.0001);

	playerSystem.playerCollisionEntities.push(entity);

	scene.add(entity.threeJsComponent.mesh);

	return entity;
}

