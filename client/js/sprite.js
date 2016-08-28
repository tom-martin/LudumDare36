function Sprite(width, height, scene, sheet, initialAnimName, opacity, texture) {
	var scope = this;
	this.setAnim = function(animName) {
		scope.anim = sheet.anims[animName];
    }

    var spriteGeom = new THREE.Geometry();
    spriteGeom.faceVertexUvs[0] = [];
    var halfWidth = width/2;
    var halfHeight = height/2;
    spriteGeom.vertices.push(new THREE.Vector3(-halfWidth, -halfHeight, 0));
    spriteGeom.vertices.push(new THREE.Vector3(-halfWidth, halfHeight, 0));
    spriteGeom.vertices.push(new THREE.Vector3(halfWidth, -halfHeight, 0));
    spriteGeom.vertices.push(new THREE.Vector3(halfWidth, halfHeight, 0));

    spriteGeom.faces.push(new THREE.Face3(0, 2, 1));
    spriteGeom.faceVertexUvs[0].push([new THREE.Vector2(0, 0),new THREE.Vector2(1,0),new THREE.Vector2(0,1)]);
    spriteGeom.faces.push(new THREE.Face3(1, 2, 3));
    spriteGeom.faceVertexUvs[0].push([new THREE.Vector2(0, 1),new THREE.Vector2(1,0),new THREE.Vector2(1,1)]);

    spriteGeom.computeFaceNormals();   


    this.setAnim(initialAnimName);
	

    var newTexture = null;
    if(!texture) {
    	newTexture = THREE.ImageUtils.loadTexture(sheet.textureLocation);
        newTexture.wrapS = newTexture.wrapT = THREE.RepeatWrapping; 
        newTexture.repeat.set( sheet.xScale, sheet.yScale);
        newTexture.magFilter = THREE.NearestFilter;
        newTexture.minFilter = THREE.NearestFilter;
        newTexture.generateMipMaps = false;
    } else {
        newTexture = texture.clone();
        newTexture.needsUpdate = true;
    }

    var uniforms = { newTexture:  { type: "t", value: texture } , 
                     xScale: { type: "f", value: sheet.xScale}, 
                     xOffset: { type: "f", value: this.anim.frames[0].x}, 
                     yScale: { type: "f", value: sheet.yScale}, 
                     yOffset: { type: "f", value: this.anim.frames[0].y}};

    this.material = new THREE.MeshLambertMaterial( { map: newTexture, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide} );
    if(opacity < 1) {
        this.material.opacity = opacity;
    }
    this.mesh = new THREE.Mesh( spriteGeom, this.material );

    scene.add( this.mesh );

    this.update = function(now) {
		var frameOffset = Math.floor(now / this.anim.frameLength) % this.anim.frames.length;
        newTexture.offset.x = this.anim.frames[frameOffset].x;
        uniforms['xOffset']['value'] = this.anim.frames[frameOffset].x;

        newTexture.offset.y = this.anim.frames[frameOffset].y;
        uniforms['yOffset']['value'] = this.anim.frames[frameOffset].y;
    }

}