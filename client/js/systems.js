
function ThreeJsSystem() {
    this.entities = [];

    this.update = function(tick) {
        for(var i in this.entities) {
            var entity = this.entities[i];

            if(entity.positionComponent != null && entity.threeJsComponent != null) {
                entity.threeJsComponent.mesh.position.copy(entity.positionComponent.position);
                entity.threeJsComponent.mesh.position.add(entity.threeJsComponent.positionOffset);
                entity.threeJsComponent.mesh.rotation.copy(entity.positionComponent.rotation);
            }
        }
    }
}

function PlayerSystem(input) {
    var self = this;
    self.player = null;
    var playerSpeed = 5;

    self.playerCollisionEntities = [];

    var tryAndMove = function(moveEntity, requiredMove) {
        var nextPosition = new THREE.Vector3();
        var nextMove = new THREE.Vector3();
        nextMove.copy(requiredMove);
        var moveColComp = moveEntity.collisionComponent;
        if(!moveColComp.canMoveVertically) {
            nextMove.y = 0;   
        }
        if(!moveColComp.canMoveHorizontally) {
            nextMove.x = 0;   
        }

        nextPosition.copy(moveEntity.positionComponent.position);
        nextPosition.add(nextMove);

        for(var i in self.playerCollisionEntities) {
            var otherEntity = self.playerCollisionEntities[i];

            if(otherEntity != moveEntity) {
                var pos = otherEntity.positionComponent.position;
                var colComp = otherEntity.collisionComponent;
                if(!(nextPosition.x + moveColComp.halfWidth <= pos.x-colComp.halfWidth ||
                     nextPosition.x - moveColComp.halfWidth >= pos.x+colComp.halfWidth ||
                     nextPosition.y + moveColComp.halfHeight <= pos.y-colComp.halfHeight ||
                     nextPosition.y - moveColComp.halfHeight >= pos.y+colComp.halfHeight
                    )) {
                    var moveTheOtherGuy = new THREE.Vector3();
                    if(nextMove.x > 0) {
                        moveTheOtherGuy.x = (nextPosition.x+moveColComp.halfWidth) - (pos.x-colComp.halfWidth);
                    } else if(nextMove.x < 0) {
                        moveTheOtherGuy.x = -((pos.x+colComp.halfWidth)-(nextPosition.x-moveColComp.halfWidth));
                    } else if(nextMove.y > 0) {
                        moveTheOtherGuy.y = (nextPosition.y+moveColComp.halfHeight) - (pos.y-colComp.halfHeight);
                    } else if(nextMove.y < 0) {
                        moveTheOtherGuy.y = -((pos.y+colComp.halfHeight)-(nextPosition.y-moveColComp.halfHeight));
                    }
                    nextMove.sub(moveTheOtherGuy);
                    var actualMove = tryAndMove(otherEntity, moveTheOtherGuy);
                    nextMove.add(actualMove);

                    nextPosition.copy(moveEntity.positionComponent.position);
                    nextPosition.add(nextMove);
                }
            }
        }

        moveEntity.positionComponent.position.add(nextMove);
        return nextMove;
    }

    this.update = function(tick) {
        var moveEntity = this.player;
        var nextMove = new THREE.Vector3(0, 0, 0);

        if(input.north.down) {
            nextMove.y += tick*playerSpeed;
        } else if(input.east.down) {
            nextMove.x += tick*playerSpeed;
        } else if(input.south.down) {
            nextMove.y -= tick*playerSpeed;
        } else if(input.west.down) {
            nextMove.x -= tick*playerSpeed;
        }

        tryAndMove(this.player, nextMove)
    }
}
