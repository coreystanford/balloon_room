var balloons = (function(){

	"use strict";

	Physijs.scripts.worker = 'js/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

	var scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 }), stats,
	initEventHandling,
	renderer = window.WebGLRenderingContext ?  new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer(),
	clock = new THREE.Clock(),
	mouseX = 0, mouseY = 0,
	windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2,
	light1, light2, light3,
	camera,
	balloon,
	back, right, left, ceiling, floor, behind,
	colours = [0x40ed1e, 0xed6c1e, 0x1ed2ed, 0xed1e32, 0xed1eba, 0xedeb1e],
	coords= { yRand: 0, xRand: 0, zRand: 0 };

	function initScene(){

		scene.setGravity(new THREE.Vector3(0,30,0));

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		document.getElementById('balloon-container').appendChild( stats.domElement );

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMapEnabled = true;

		document.getElementById('balloon-container').appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(
		             50,
		             window.innerWidth / window.innerHeight,
		             0.1,
		             100
		             );
		camera.setLens(40, 35);
		camera.position.set(0,5,40);
		scene.add(camera);

		back = createWall(back, "back", 90, 0, 0, 0, 0, -20, 40, 30, false, 1);
		right = createWall(right, "right", 90, 0, 90, 20, 0, 0, 40, 30, false, 1);
		left = createWall(left, "left", 90, 0, 90, -20, 0, 0, 40, 30, false, 1);
		ceiling = createWall(ceiling, "ceiling", 0, 90, 0, 0, 15, 0, 40, 50, false, 1);
		floor = createWall(floor, "floor", 0, 90, 0, 0, -15, 0, 40, 50, false, 1);
		behind = createWall(behind, "behind", 90, 0, 0, 0, 0, 20, 40, 30, true, 0);

		light1 = new THREE.SpotLight(new THREE.Color("#ffffff", .5, 50, 180 * Math.PI / 180));
		light1.position.set(113,87,63);
		light1.castShadow = true;
		scene.add(light1);
		light2 = new THREE.SpotLight(new THREE.Color("#ffffff", 1, 250, 180 * Math.PI / 180));
		light2.position.set(-110,-121,-16);
		light2.castShadow = true;
		scene.add(light2);
		light3 = new THREE.SpotLight(new THREE.Color("#ffffff", .01, 25, 180 * Math.PI / 180));
		light3.position.set(-27,-40,34);
		light3.castShadow = true;
		scene.add(light3);

		makeBalloons(20);

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );

		render();

	}

	function createWall(plane, name, xDegree, yDegree, zDegree, posX, posY, posZ, width, height, transparent, opacity){

		var planeMaterial = Physijs.createMaterial(
		                    new THREE.MeshLambertMaterial({
								color: 0x1ed2ed,
								shininess: 1,
								transparent: transparent,
								opacity: opacity,
								shading: THREE.SmoothShading,
								side: THREE.FrontSide
							}),
							0.4, //friction
							.7 // bounciness (aka. restitution)
		                );

		plane = new Physijs.BoxMesh(new THREE.BoxGeometry(width, .5, height),
		            planeMaterial,
					0 // mass (0 = immovable)
				);

		plane.rotation.x = xDegree * (Math.PI / 180); // convert to degrees from radians
		plane.rotation.y = yDegree * (Math.PI / 180);
		plane.rotation.z = zDegree * (Math.PI / 180);

		plane.position.x = posX;
		plane.position.y = posY;
		plane.position.z = posZ;

		plane.name = name;
		plane.receiveShadow = true;

		scene.add(plane);

		return plane;
	}

	function makeBalloons(iterations){

		var loader = new THREE.JSONLoader();
		loader.load('mesh/simple_balloon.json', function(geometry, materials){

			for (var i = 0; i < iterations; i++) {
				
				var colour = colours[Math.floor(Math.random() * colours.length)];

				var material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
					color: colour,
					transparent: true,
					opacity: .8,
					side: THREE.DoubleSide
				}), 0.1, 1);

				balloon = new Physijs.BoxMesh(geometry, material);

				var pos = ["yRand", "xRand", "zRand"];
				for( var xyz = 0; xyz < 3; xyz++){
					var posNeg = Math.random();
					if(posNeg > 0.5){
						coords[pos[xyz]] = Math.random() * -12;
					} else {
						coords[pos[xyz]] = Math.random() * 12;
					}
				}

				balloon.position.y = coords.yRand;
				balloon.position.x = coords.xRand;
				balloon.position.z = coords.zRand;
				console.log(balloon.position);
				balloon.setAngularVelocity(new THREE.Vector3(0,-10,50));

				balloon.name = "balloon"+i;
				balloon.castShadow = true;

				scene.add(balloon);

			};

		});

	}

	function onDocumentMouseMove(event) {

		mouseX = ( event.clientX - windowHalfX ) / 90;
		mouseY = ( event.clientY - windowHalfY ) / 90;

	}

	function handleMouseDown( evt ) {
		var _vector = new THREE.Vector3;
		
		_vector.set(
			( evt.clientX / window.innerWidth ) * 2 - 1,
			-( evt.clientY / window.innerHeight ) * 2 + 1,
			1
		);

		makeBalloons(5);

		console.log(_vector);
		
	};

	function render(){
		scene.simulate();

		camera.position.x += ( mouseX - camera.position.x ) * .05;
		camera.position.y += ( - mouseY - camera.position.y ) * .05;
		camera.lookAt( scene.position );

		renderer.render(scene, camera);
		requestAnimationFrame(render);
		stats.update();
	}

	function loadGUI(){

		var gui = new dat.GUI({
			height: 5 * 32 - 1
		});	
		
		gui.add(camera.position, 'x');
		gui.add(camera.position, 'y');
		gui.add(camera.position, 'z');
		gui.add(light2.position, 'x', -500, 500);
		gui.add(light2.position, 'y', -500, 500);
		gui.add(light2.position, 'z', -500, 500);
	}

	window.onload = function(){
		initScene();
		loadGUI();
		renderer.domElement.addEventListener( 'mousedown', handleMouseDown );
	}

	return {
		scene: scene
	}

})();