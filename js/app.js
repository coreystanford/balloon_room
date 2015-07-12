var balloons = (function(){

	"use strict";

	Physijs.scripts.worker = 'js/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

	var scene = new Physijs.Scene({fixedTimeStep: 1/125}), stats,
	initEventHandling,
	renderer = window.WebGLRenderingContext ?  new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer(),
	clock = new THREE.Clock(),
	mouseX = 0, mouseY = 0,
	windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2,
	light1, light2, light3, light4,
	camera,
	balloon, textGeo, textMesh, textMaterial,
	back, right, left, ceiling, floor, behind,
	colours = [0x40ed1e, 0xed6c1e, 0x1ed2ed, 0xed1e32, 0xed1eba, 0xedeb1e],
	coords= { yRand: 0, xRand: 0, zRand: 0 };

	function initScene(){

		scene.setGravity(new THREE.Vector3(0,35,0));

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
		camera.position.set(0,0,45);
		scene.add(camera);

		back = createWall(back, "back", 90, 0, 0, 0, 0, -10, 40, 20, false, 1);
		right = createWall(right, "right", 90, 0, 90, 20, 0, 12.5, 45, 20, false, 1);
		left = createWall(left, "left", 90, 0, 90, -20, 0, 12.5, 45, 20, false, 1);
		ceiling = createWall(ceiling, "ceiling", 0, 90, 0, 0, 10, 12.5, 45, 40, false, 1);
		floor = createWall(floor, "floor", 0, 90, 0, 0, -10, 12.5, 45, 40, false, 1);
		behind = createWall(behind, "behind", 90, 0, 0, 0, 0, 20, 40, 30, true, 0);

		light1 = new THREE.PointLight(new THREE.Color("#ffffff"), 1.2);
		light1.position.set(138,134,107);
		light1.castShadow = false;
		scene.add(light1);
		light2 = new THREE.SpotLight(new THREE.Color("#ffffff", .01, 25, 10 * Math.PI / 180));
		light2.position.set(-110,-121,0);
		light2.castShadow = false;
		scene.add(light2);
		light3 = new THREE.SpotLight(new THREE.Color("#ffffff", .01, 25, 10 * Math.PI / 180));
		light3.position.set(-19.8,-35,20);
		light3.castShadow = false;
		scene.add(light3);
		light4 = new THREE.SpotLight(new THREE.Color("#ffffff", .0001, 0, 10 * Math.PI / 180));
		light4.position.set(-27,8,172);
		light4.castShadow = true;
		light4.onlyShadow = true;
		light4.shadowDarkness = .2;
		scene.add(light4);

		makeBalloons(50);

		createText("Happy Birthday", -5, -10.4, 3.65)
		createText("Genevieve!", -8.8, 4, 3);

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
					opacity: .85,
					side: THREE.FrontSide
				}), 1, 1);

				balloon = new Physijs.BoxMesh(geometry, material);

				var pos = ["yRand", "xRand", "zRand"];
				for( var xyz = 0; xyz < 3; xyz++){
					var posNeg = Math.random();
					switch(xyz){
						case 0:
							if(posNeg > 0.5){
								coords[pos[xyz]] = Math.random() * -1;
							} else {
								coords[pos[xyz]] = Math.random() * 3;
							}
						break;
						case 1:
							if(posNeg > 0.5){
								coords[pos[xyz]] = Math.random() * -15;
							} else {
								coords[pos[xyz]] = Math.random() * 15;
							}
						break;
						case 2:
							if(posNeg > 0.5){
								coords[pos[xyz]] = Math.random() * -4;
							} else {
								coords[pos[xyz]] = Math.random() * 4;
							}
						break;
					}
				}

				balloon.position.y = coords.yRand-9;
				balloon.position.x = coords.xRand;
				balloon.position.z = coords.zRand;

				balloon.worldToLocal(new THREE.Vector3(0,10,-10));

				balloon.name = "balloon"+i;
				balloon.castShadow = true;

				scene.add(balloon);

			};

		});

	}

	function createText(text, txtY, txtZ, size) {

		textGeo = new THREE.TextGeometry( text, {

			size: size,
			height: 2,
			curveSegments: 10,

			font: 'helvetiker',
			weight: 'bold',
			style: 'normal',

			bevelThickness: .05,
			bevelSize: .05,
			bevelEnabled: true,

			material: 0,
			extrudeMaterial: 0

		});

		textMaterial = Physijs.createMaterial(new THREE.MeshFaceMaterial( [
			new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
			new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
		] ) );

		textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();

		var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

		textMesh = new Physijs.BoxMesh( textGeo, textMaterial, 0 );

		textMesh.position.x = centerOffset;
		textMesh.position.y = txtY;
		textMesh.position.z = txtZ;

		textMesh.rotation.x = 0;
		textMesh.rotation.y = Math.PI * 2;

		textMesh.receiveShadow = true;
		textMesh.castShadow = true;

		scene.add( textMesh );

	}

	function handleMouseMove(evt) {
		mouseX = ( evt.clientX - windowHalfX ) / 75;
		mouseY = ( evt.clientY - windowHalfY ) / 75;
	}

	function handleMouseDown( evt ) {
		makeBalloons(15);
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
		gui.add(light1.position, 'x', -200, 200);
		gui.add(light1.position, 'y', -200, 200);
		gui.add(light1.position, 'z', -500, 500);
	}

	window.onload = function(){

		initScene();
		loadGUI();

		scene.addEventListener(
            'ready',
            function () {
                console.log('Physijs scene is ready');
                render();
            }
        );
		renderer.domElement.addEventListener( 
		    'mousemove', 
		    handleMouseMove
		);
		renderer.domElement.addEventListener( 
		    'mousedown', 
		    handleMouseDown
		);
	}

	return {
		scene: scene
	}

})();