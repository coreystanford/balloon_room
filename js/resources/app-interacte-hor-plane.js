var balloons = (function(){

	"use strict";

	Physijs.scripts.worker = 'js/physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';

	var scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 }),
	initEventHandling,
	renderer = window.WebGLRenderingContext ?  new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer(),
	clock = new THREE.Clock(),
	light1, light2, light3,
	camera,
	balloon,
	back, right, left, ceiling, floor, behind,
	selected_block = null,
	mouse_position = new THREE.Vector3,
	block_offset = new THREE.Vector3, _i, _v3 = new THREE.Vector3,
	balloons = [],
	intersect_plane;

	function initScene(){

		scene.setGravity(new THREE.Vector3(0,0,0));

		scene.addEventListener(
			'update',
			function() {
				if ( selected_block !== null ) {
					
					_v3.copy( mouse_position ).add( block_offset ).sub( selected_block.position ).multiplyScalar( 5 );
					_v3.y = 0;
					selected_block.setLinearVelocity( _v3 );
					
					// Reactivate all of the balloons
					_v3.set( 0, 0, 0 );
					for ( _i = 0; _i < balloons.length; _i++ ) {
						balloons[_i].applyCentralImpulse( _v3 );
					}
				}

				scene.simulate( undefined, 1 );
				// physics_stats.update();
			}
		);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMapEnabled = true;

		document.getElementById('balloon-container').appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(
		             50,
		             window.innerWidth / window.innerHeight,
		             0.1,
		             200
		             );
		camera.setLens(25, 35);
		camera.position.set(0,8,40);
		scene.add(camera);

		back = createWall(back, "back", 90, 0, 0, 0, 0, -50, 50, 35);
		right = createWall(right, "right", 90, 0, 90, 25, 0, 0, 100, 35);
		left = createWall(left, "left", 90, 0, 90, -25, 0, 0, 100, 35);
		ceiling = createWall(ceiling, "ceiling", 0, 90, 0, 0, 15, 0, 100, 50);
		floor = createWall(floor, "floor", 0, 90, 0, 0, -15, 0, 100, 50);
		behind = createWall(behind, "behind", 90, 0, 0, 0, 0, 50, 50, 35);

		intersect_plane = new THREE.Mesh(
			new THREE.PlaneGeometry( 150, 150 ),
			new THREE.MeshBasicMaterial({ opacity: 1, transparent: true })
		);
		intersect_plane.rotation.x = Math.PI / -2;
		scene.add( intersect_plane );

		light1 = new THREE.DirectionalLight(new THREE.Color("#ffffff", 30));
		light1.position.set(113,87,63);
		light1.castShadow = true;
		scene.add(light1);
		light2 = new THREE.DirectionalLight(new THREE.Color("#ffffff", 30));
		light2.position.set(-113,-87,-63);
		light2.castShadow = true;
		scene.add(light2);
		light3 = new THREE.SpotLight(new THREE.Color("#ffffff", 1, 10, 180 * Math.PI / 180));
		light3.position.set(12,73,30);
		light3.castShadow = true;
		scene.add(light3);

		var colours = [0x40ed1e, 0xed6c1e, 0x1ed2ed, 0xed1e32, 0xed1eba, 0xedeb1e, ];

		var loader = new THREE.JSONLoader();
		loader.load('mesh/balloon.json', function(geometry, materials){
			var coords= { yRand: 0, xRand: 0, zRand: 0 };

			for (var i = 0; i < 5; i++) {
				
				var colour = colours[Math.floor(Math.random() * colours.length)];

				var material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
					color: colour,
					transparent: true,
					opacity: .8,
					side: THREE.DoubleSide
				}), 0.1, 0.9);

				balloon = new Physijs.BoxMesh(geometry, material);

				var pos = ["yRand", "xRand", "xRand"];
				for( var xyz = 0; xyz < 2; xyz++){
					var posNeg = Math.random();
					if(posNeg > 0.5){
						coords[pos[xyz]] = Math.random() * -10;
					} else {
						coords[pos[xyz]] = Math.random() * 10;
					}
				}

				balloon.position.y = coords.yRand;
				balloon.position.x = coords.xRand;
				balloon.position.z = coords.zRand;

				// balloon.setAngularVelocity(new THREE.Vector3(20,-10,50));

				balloon.name = "balloon"+i;
				balloon.castShadow = true;

				requestAnimationFrame(render);

				scene.add(balloon);
				balloons.push( balloon );

			};

			render();

		});

		initEventHandling();

	}

	function createWall(plane, name, xDegree, yDegree, zDegree, posX, posY, posZ, width, height){
		
		var planeMaterial = Physijs.createMaterial(
		                    new THREE.MeshPhongMaterial({
								color: 0xffffff,
								shininess: 25,
								shading: THREE.FlatShading,
								side: THREE.DoubleSide
							}),
							0.5, //friction
							.8 // bounciness (aka. restitution)
		                );

		plane = new Physijs.BoxMesh(new THREE.BoxGeometry(width, 1, height),
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

	function render(){
		scene.simulate();
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	function loadGUI(){

		var gui = new dat.GUI({
			height: 5 * 32 - 1
		});	
		
		gui.add(camera.position, 'x');
		gui.add(camera.position, 'y');
		gui.add(camera.position, 'z');
		gui.add(light3.position, 'x', -200, 200);
		gui.add(light3.position, 'y', -200, 200);
		gui.add(light3.position, 'z', -200, 200);
	}

	initEventHandling = (function() {
		var _vector = new THREE.Vector3,
			projector = new THREE.Projector(),
			handleMouseDown, handleMouseMove, handleMouseUp;
		
		handleMouseDown = function( evt ) {
			var ray, intersections;
			
			_vector.set(
				( evt.clientX / window.innerWidth ) * 2 - 1,
				-( evt.clientY / window.innerHeight ) * 2 + 1,
				1
			);

			projector.unprojectVector( _vector, camera );
			
			ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );
			intersections = ray.intersectObjects( balloons );

			if ( intersections.length > 0 ) {
				selected_block = intersections[0].object;
				
				_vector.set( 0, 0, 0 );
				selected_block.setAngularFactor( _vector );
				selected_block.setAngularVelocity( _vector );
				selected_block.setLinearFactor( _vector );
				selected_block.setLinearVelocity( _vector );

				mouse_position.copy( intersections[0].point );
				block_offset.subVectors( selected_block.position, mouse_position );
				
				intersect_plane.position.y = mouse_position.y;
			}
		};
		
		handleMouseMove = function( evt ) {
			
			var ray, intersection,
				i, scalar;
			
			if ( selected_block !== null ) {
				
				_vector.set(
					( evt.clientX / window.innerWidth ) * 2 - 1,
					-( evt.clientY / window.innerHeight ) * 2 + 1,
					1
				);
				projector.unprojectVector( _vector, camera );
				
				ray = new THREE.Raycaster( camera.position, _vector.sub( camera.position ).normalize() );
				intersection = ray.intersectObject( intersect_plane );
				mouse_position.copy( intersection[0].point );
			}
			
		};
		
		handleMouseUp = function( evt ) {
			
			if ( selected_block !== null ) {
				_vector.set( 1, 1, 1 );
				selected_block.setAngularFactor( _vector );
				selected_block.setLinearFactor( _vector );
				
				selected_block = null;
			}
			
		};
		
		return function() {
			renderer.domElement.addEventListener( 'mousedown', handleMouseDown );
			renderer.domElement.addEventListener( 'mousemove', handleMouseMove );
			renderer.domElement.addEventListener( 'mouseup', handleMouseUp );
		};
	})();

	window.onload = function(){
		initScene();
		loadGUI();
	}

	return {
		scene: scene
	}

})();