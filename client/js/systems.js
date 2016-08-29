
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

            entity.threeJsComponent.mesh.renderOrder = -entity.threeJsComponent.mesh.position.y;
        }
    }
}

function PlayerSystem(input, scene, threeJsSystem) {
    var self = this;
    self.player = null;
    self.blockEntity = null;
    self.block = null;
    var playerSpeed = 5;

    self.playerCollisionEntities = [];

    var tryAndMoveBlock = function(rockEntity, requiredMove) {
        var canMoveVertically = false;
        var canMoveHorizontally = false;
        var totalCount = 0;
        var currentPosition = rockEntity.positionComponent.position;

        var moveColComp = rockEntity.collisionComponent;

        for(var i in self.playerCollisionEntities) {
            var otherEntity = self.playerCollisionEntities[i];
            var colComp = otherEntity.collisionComponent;
            if(colComp.isRoller) {
                var pos = otherEntity.positionComponent.position;
                
                if(colComp.isUnderBlock) {
                    if(colComp.canMoveVertically) {
                        canMoveVertically = true;
                        totalCount ++;
                    }
                    if(colComp.canMoveHorizontally) {
                        canMoveHorizontally = true;
                        totalCount ++;
                    }
                }
                if(totalCount >= 2 && colComp.canMoveHorizontally && colComp.canMoveVertically) {
                    break;
                }
            }
        }

        if(totalCount >= 2) {
            if(!canMoveHorizontally) {
                requiredMove.x = 0;
            }

            if(!canMoveVertically) {
                requiredMove.y = 0;
            }
        } else {
            requiredMove.set(0, 0, 0);
        }

        var actualMove = tryAndMove(rockEntity, requiredMove, true);

        if(requiredMove.lengthSq() > 0) {
            var halfMove = new THREE.Vector3();
            halfMove.copy(actualMove);
            halfMove.multiplyScalar(0.6);
            for(var i in self.playerCollisionEntities) {
                var otherEntity = self.playerCollisionEntities[i];
                var colComp = otherEntity.collisionComponent;
                if(colComp.isRoller && colComp.isUnderBlock) {
                    tryAndMove(otherEntity, halfMove);   
                }
            }
        }

        return actualMove;
    }

    var doEntitiesCollide = function(posA, colA, posB, colB) {

        return !( posA.x + colA.halfWidth <= posB.x-colB.halfWidth ||
                  posA.x - colA.halfWidth >= posB.x+colB.halfWidth ||
                  posA.y + colA.halfHeight <= posB.y-colB.halfHeight ||
                  posA.y - colA.halfHeight >= posB.y+colB.halfHeight
                )
    }

    var tryAndMove = function(moveEntity, requiredMove, skipRollers) {
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
            var colComp = otherEntity.collisionComponent;

            if(otherEntity != moveEntity) {
                if(!colComp.active) continue;
                if(moveEntity == self.player && colComp.isUnderBlock) continue;
                if(skipRollers && colComp.isRoller) continue;

                var pos = otherEntity.positionComponent.position;
                if(doEntitiesCollide(nextPosition, moveColComp, pos, colComp)) {
                    if(moveEntity == self.player && colComp.isTree && input.chop.down) {
                        colComp.active = false;
                        otherEntity.threeJsComponent.mesh.visible = false;
                        var horizontal = requiredMove.x != 0;
                        var moveLog = requiredMove.clone();
                        moveLog.normalize();
                        moveLog.multiplyScalar(2);
                        createRoller(scene, horizontal, pos.x+moveLog.x, pos.y+moveLog.y, self, threeJsSystem);
                        input.chop.clear();
                        continue;
                    }

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
                    var actualMove = null;
                    if(colComp.isBlock) {
                        if(!moveColComp.isRoller) {
                            actualMove = tryAndMoveBlock(otherEntity, moveTheOtherGuy);
                        } else {
                            actualMove = moveTheOtherGuy;
                        }
                    } else {
                        
                        if(moveColComp.isRoller && colComp.isRoller && moveColComp.canMoveVertically == colComp.canMoveHorizontally) {
                            actualMove = moveTheOtherGuy
                        } else {
                            actualMove = tryAndMove(otherEntity, moveTheOtherGuy);
                        }
                    }
                    nextMove.add(actualMove);

                    nextPosition.copy(moveEntity.positionComponent.position);
                    nextPosition.add(nextMove);
                }
            }
        }

        moveEntity.positionComponent.position.add(nextMove);
        return nextMove;
    }

    var updateIsUnderBlockStatus = function() {
        var blockPosition = self.blockEntity.positionComponent.position;
        var blockColComp = self.blockEntity.collisionComponent;

        var playerPosition = self.player.positionComponent.position;
        var playerColComp = self.player.collisionComponent;

        for(var i in self.playerCollisionEntities) {
            var otherEntity = self.playerCollisionEntities[i];
            var colComp = otherEntity.collisionComponent;
            if(colComp.isRoller) {
                var pos = otherEntity.positionComponent.position;
                
                if(doEntitiesCollide(blockPosition, blockColComp, pos, colComp)) {
                    colComp.isUnderBlock = true;
                } else if(!doEntitiesCollide(playerPosition, playerColComp, pos, colComp)) {
                    colComp.isUnderBlock = false;
                }
            }
        }
    }

    this.update = function(now, tick) {
        var nextMove = new THREE.Vector3(0, 0, 0);

        updateIsUnderBlockStatus();
        var sprite = this.player.spriteComponent.sprite;

        if(input.north.down) {
            nextMove.y += tick*playerSpeed;
            sprite.setAnim("playerNorth");
        } else if(input.east.down) {
            nextMove.x += tick*playerSpeed;
            sprite.setAnim("playerEast");
        } else if(input.south.down) {
            nextMove.y -= tick*playerSpeed;
            sprite.setAnim("playerSouth");
        } else if(input.west.down) {
            nextMove.x -= tick*playerSpeed;
            sprite.setAnim("playerWest");
        }

        sprite.update(now);

        tryAndMove(this.player, nextMove)
    }
}
