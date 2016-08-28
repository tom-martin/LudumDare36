function ThreeJsComponent() {
    this.mesh = null;
    this.positionOffset = new THREE.Vector3();
}

function PositionComponent() {
    this.position = new THREE.Vector3();
    this.rotation = new THREE.Euler( 0, 0, 0, 'XYZ' );
}

function MatterComponent() {
    this.matterBody = null;
}

function CollisionComponent() {
    this.halfWidth = 0.5;
    this.halfHeight = 1;
    this.canMoveVertically = true;
    this.canMoveHorizontally = true;
}

function CameraComponent() {
    this.threeCamera = null;
    this.followEntity = null;
    this.offset = new THREE.Vector3();
}