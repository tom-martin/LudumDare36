
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
            entity.threeJsComponent.mesh.renderOrder += entity.threeJsComponent.renderOrderOffset;
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
        var verticalCount = 0;
        var horizontalCount = 0;
        var currentPosition = rockEntity.positionComponent.position;

        var moveColComp = rockEntity.collisionComponent;

        for(var i in self.playerCollisionEntities) {
            var otherEntity = self.playerCollisionEntities[i];
            var colComp = otherEntity.collisionComponent;
            if(colComp.isRoller) {
                var pos = otherEntity.positionComponent.position;
                
                // if(doEntitiesCollide(currentPosition, moveColComp, pos, colComp)) {
                if(colComp.isUnderBlock) {
                    if(colComp.canMoveVertically) {
                        verticalCount++;
                    }
                    if(colComp.canMoveHorizontally) {
                        horizontalCount++;
                    }
                }
                if(verticalCount >=2 && horizontalCount >= 2) {
                    break;
                }
            }
        }

        if(horizontalCount < 2) {
            requiredMove.x = 0;
        }

        if(verticalCount < 2) {
            requiredMove.y = 0;
        }

        if(horizontalCount < 2 && verticalCount < 2) {
            self.blockEntity.spriteComponent.sprite.setAnim("rockCracked");
            self.blockEntity.spriteComponent.sprite.update(0);

            try {
                if(!self.player.playerComponent.failing) {
                    failSound.play();
                }
            } catch(err) {
                console.log("Couldn't play "+err);
            }
            self.player.playerComponent.failing = true;
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
                            if(moveEntity == self.player) {
                                self.player.playerComponent.isPushing = true;
                            }
                        } else {
                            actualMove = moveTheOtherGuy;
                        }
                    } else {
                        
                        if(moveColComp.isRoller && colComp.isRoller && doEntitiesCollide(moveEntity.positionComponent.position, moveColComp, pos, colComp)) {
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

    var lastMovementMove = new THREE.Vector3();

    var bobDir = 1.5;

    this.update = function(now, tick) {
        var nextMove = new THREE.Vector3(0, 0, 0);

        if(self.player.playerComponent.failing) {
            self.player.playerComponent.failTimer += tick;
            if(self.player.playerComponent.failTimer > 1) {
                self.player.playerComponent.failed = true;
            }
        }

        var blockFinishDistSq = this.blockEntity.positionComponent.position.distanceToSquared(this.finishEntity.positionComponent.position);
        if(blockFinishDistSq < 0.5) {
            this.player.playerComponent.completionTimer += tick;
            if(this.player.playerComponent.completionTimer > 0.5 || blockFinishDistSq < 0.001) {
                try {
                    winSound.play();
                } catch(err) {
                    console.log("Couldn't play "+err);
                }
                this.player.playerComponent.levelComplete = true;
                return;
            }
        }

        updateIsUnderBlockStatus();
        var sprite = this.player.spriteComponent.sprite;

        if(this.player.playerComponent.isChopping) {
            this.player.playerComponent.chopTimer += tick;
            if(this.player.playerComponent.chopTimer > 1) {
                this.player.playerComponent.isChopping = false;    
            }
        }

        if(input.chop.down) {
            this.player.playerComponent.isChopping = true;
            this.player.playerComponent.chopTimer = 0;
        }

        if(!this.player.playerComponent.isChopping) {
            if(input.north.down) {
                nextMove.y += tick*playerSpeed;
            } else if(input.east.down) {
                nextMove.x += tick*playerSpeed;
            } else if(input.south.down) {
                nextMove.y -= tick*playerSpeed;
            } else if(input.west.down) {
                nextMove.x -= tick*playerSpeed;
            }
        }

        if(nextMove.lengthSq() > 0) {
            lastMovementMove.copy(nextMove);
        }

        if(lastMovementMove.y > 0) {
            if(this.player.playerComponent.isPushing) {
                sprite.setAnim("playerPushNorth");
            } else if(this.player.playerComponent.isChopping) {
                sprite.setAnim("playerNorthChop");
            } else {
                sprite.setAnim("playerNorth");
            }
        } else if(lastMovementMove.x > 0) {
            if(this.player.playerComponent.isPushing) {
                sprite.setAnim("playerPushEast");
            } else if(this.player.playerComponent.isChopping) {
                sprite.setAnim("playerEastChop");
            } else {
                sprite.setAnim("playerEast");
            }
        } else if(lastMovementMove.y < 0) {
            if(this.player.playerComponent.isPushing) {
                sprite.setAnim("playerPushSouth");
            } else if(this.player.playerComponent.isChopping) {
                sprite.setAnim("playerSouthChop");
            } else {
                sprite.setAnim("playerSouth");
            }
        } else if(lastMovementMove.x < 0) {
            if(this.player.playerComponent.isPushing) {
                sprite.setAnim("playerPushWest");
            } else if(this.player.playerComponent.isChopping) {
                sprite.setAnim("playerWestChop");
            } else {
                sprite.setAnim("playerWest");
            }
        }

        if( this.player.playerComponent.isChopping && 
            !this.player.playerComponent.isPushing &&
            this.player.playerComponent.chopTimer > 0.5) {
            var chopPos = this.player.positionComponent.position.clone();
            chopPos.add(lastMovementMove);
            for(var i in self.playerCollisionEntities) {
                var otherEntity = self.playerCollisionEntities[i];
                var colComp = otherEntity.collisionComponent;

                if(colComp.isTree && colComp.active) {
                    var pos = otherEntity.positionComponent.position;
                    if(doEntitiesCollide(chopPos, this.player.collisionComponent, pos, colComp)) {
                        colComp.active = false;
                        otherEntity.threeJsComponent.mesh.visible = false;
                        var horizontal = lastMovementMove.x != 0;
                        var moveLog = lastMovementMove.clone();
                        moveLog.normalize();
                        moveLog.multiplyScalar(2);
                        createRoller(scene, horizontal, pos.x+moveLog.x, pos.y+moveLog.y, self, threeJsSystem);
                        break;
                    }
                }
            }
        } else {
            this.player.playerComponent.isPushing = false;
            var actualMove = tryAndMove(this.player, nextMove);

            if(this.player.playerComponent.isChopping ||
              this.player.playerComponent.isPushing ||
              nextMove.lengthSq() > 0) {
                sprite.update(now);
            }

            // if(!this.player.playerComponent.isPushing && actualMove.lengthSq() > 0) {
            //     this.player.threeJsComponent.positionOffset.y += bobDir*tick;
            //     if(this.player.threeJsComponent.positionOffset.y > 0.65) {
            //         this.player.threeJsComponent.positionOffset.y = 0.65;
            //         bobDir = -2;
            //     } else if(this.player.threeJsComponent.positionOffset.y < 0.35) {
            //         this.player.threeJsComponent.positionOffset.y = 0.35;
            //         bobDir = 2;
            //     }
            // } else {
            //     this.player.threeJsComponent.positionOffset.y = 0.5;
            // }
        }
    }
}
