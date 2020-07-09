function preload() {

}

let map = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 1],
	[1, 0, 3, 3, 3, 0, 3, 0, 3, 3, 0, 1],
	[1, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 1],
	[1, 0, 3, 3, 3, 3, 3, 0, 3, 3, 3, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 3, 3, 3, 0, 3, 3, 3, 3, 3, 0, 1],
	[1, 0, 0, 3, 0, 3, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 3, 0, 3, 3, 3, 3, 1],
	[1, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 1],
	[1, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 1],
	[1, 0, 3, 5, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var done;
let container;
let testing_b;
var tileSize = 10;
let worldSize = 144;
let world;
var sensor;

function setup() {
	noCanvas();
	world = new World('VRScene');
	var ground = new Plane({ x: 0, y: 0, z: 0, width: worldSize, asset: 'stone', height: worldSize, red: 255, green: 255, blue: 255, rotationX: -90, metalness: 0.25, transparent: true });
	ground.tag.object3D.userData.solid = true;
	world.add(ground);
	drawMap();
}
function drawMap() {
	container = new Container3D({ x: -worldSize / 2, y: 0, z: -worldSize / 2 }); // move to the center

	for (var row = 0; row < map.length; row++) {
		for (var col = 0; col < map[row].length; col++) {
			var xPos = col * tileSize;
			var zPos = row * tileSize;
			var block = new Box({
				x: xPos, y: 3, z: zPos,
				opacity: 0,
				width: tileSize,
				depth: tileSize,
				height: 5
			});
			block.tag.object3D.userData.solid = true;

			let tree1 = new OBJ({
				asset: 'tree1_obj',
				mtl: 'tree1_mtl',
				x: xPos,
				y: 0,
				z: zPos,
				rotationX: 0,
				rotationY: 90,
				rotationZ: 0,
				scaleX: 2.0,
				scaleY: 2.0,
				scaleZ: 2.0
			});
			let bush1 = new OBJ({
				asset: 'bush1_obj',
				mtl: 'bush1_mtl',
				x: xPos,
				y: -3,
				z: zPos,
				rotationX: 0,
				rotationY: 90,
				rotationZ: 0,
				scaleX: (3.0 + Math.floor(Math.random())),
				scaleY: (2.0 + Math.floor(Math.random())),
				scaleZ: (3.0 + Math.floor(Math.random())),
			});

			tree1.tag.object3D.userData.solid = true;
			bush1.tag.object3D.userData.solid = true;

			if (map[row][col] == 3) {
				container.addChild(bush1);
			}
			else if (map[row][col] == 1) {
				container.addChild(tree1);
				container.addChild(block);
			}
			// else if ( map[row][col] == 2 ) {
			//   container.addChild(block);
			// }
			else if (map[row][col] == 5) {
				var treasure = new OBJ({
					asset: 'treasure',
					mtl: 'treasure_mtl',
					x: xPos,
					y: 3.5,
					z: zPos,
					rotationX: 0,
					rotationY: 180,
					scaleX: 5,
					scaleY: 5,
					scaleZ: 5,
				});
				var treasureBox = new Box({
					x: xPos, y: 3, z: zPos,
					opacity: 0.1,
					width: tileSize / 4,
					depth: tileSize / 4,
					height: 1.5,
					red: random(100, 240), green: random(100, 240), blue: random(100, 240),
					clickFunction: function (t) {
						console.log("Clicked");
					}
				});
				treasureBox.tag.object3D.userData.solid = true;
				container.addChild(treasure);
				container.addChild(treasureBox);
			}

		}
	}

	world.add(container);
	sensor = new Sensor();
}

function draw() {
	userPos();

	//Collision logic
	var objectAhead = sensor.getEntityInFrontOfUser();

	// if the mouse is pressed or the W key is pressed
	if (mouseIsPressed || keyIsDown(87)) {
		// assume we can move forward
		var okToMove = true;

		// if there is an object, it is close and it is solid, prevent motion
		if (objectAhead && objectAhead.distance < 0.25 && objectAhead.object.el.object3D.userData.solid) {
			console.log("Blocked!");
			okToMove = false;
		}

		if (okToMove) {
			world.moveUserForward(0.1);
		}
	}
}

//setting the boundary invisible wall and resets the position
function userPos() {
	let pos = world.getUserPosition();

	// now evaluate
	if (pos.x > 144) {
		// alert('out of bound')
		world.setUserPosition(-width / 2, pos.y, pos.z);

	}
	else if (pos.x < -144) {
		// alert('out of bound');
		world.setUserPosition(width / 2, pos.y, pos.z);

	}
	if (pos.z > 144) {
		// alert('out of bound');
		world.setUserPosition(pos.x, pos.y, -width / 2);

	}
	else if (pos.z < -144) {
		// alert('out of bound');
		world.setUserPosition(pos.x, pos.y, width / 2);
	}
}
class Sensor {
	constructor() {
		// raycaster - think of this like a "beam" that will fire out of the
		// bottom of the user's position to figure out what is below their avatar
		this.rayCaster = new THREE.Raycaster();
		this.userPosition = new THREE.Vector3(0, 0, 0);
		this.downVector = new THREE.Vector3(0, -1, 0);
		this.intersects = [];

		this.rayCasterFront = new THREE.Raycaster();
		this.cursorPosition = new THREE.Vector2(0, 0);
		this.intersectsFront = [];
	}

	getEntityInFrontOfUser() {
		// update the user's current position
		var cp = world.getUserPosition();
		this.userPosition.x = cp.x;
		this.userPosition.y = cp.y;
		this.userPosition.z = cp.z;

		if (world.camera.holder.object3D.children.length >= 2) {
			this.rayCasterFront.setFromCamera(this.cursorPosition, world.camera.holder.object3D.children[1]);
			this.intersectsFront = this.rayCasterFront.intersectObjects(world.threeSceneReference.children, true);

			// determine which "solid" items are in front of the user
			for (var i = 0; i < this.intersectsFront.length; i++) {
				if (!this.intersectsFront[i].object.el.object3D.userData.solid) {
					this.intersectsFront.splice(i, 1);
					i--;
				}
			}

			if (this.intersectsFront.length > 0) {
				return this.intersectsFront[0];
			}
			return false;
		}
	}

	getEntityBelowUser() {
		// update the user's current position
		var cp = world.getUserPosition();
		this.userPosition.x = cp.x;
		this.userPosition.y = cp.y;
		this.userPosition.z = cp.z;

		this.rayCaster.set(this.userPosition, this.downVector);
		this.intersects = this.rayCaster.intersectObjects(world.threeSceneReference.children, true);

		// determine which "solid" or "stairs" items are below
		for (var i = 0; i < this.intersects.length; i++) {
			if (!(this.intersects[i].object.el.object3D.userData.solid || this.intersects[i].object.el.object3D.userData.stairs)) {
				this.intersects.splice(i, 1);
				i--;
			}
		}

		if (this.intersects.length > 0) {
			return this.intersects[0];
		}
		return false;
	}
}
