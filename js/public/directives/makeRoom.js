balloonApp.directive('makeRoom', ['$window', '$rootScope', function($window, $rootScope) {
    return {
    	restrict: 'A',
        scope: {
          roomId: '@',
          name: '@'
        },
        link : function($scope, element, attrs) {

			"use strict";

			// load dependencies
			Physijs.scripts.worker = 'js/resources/physijs_worker.js';
			Physijs.scripts.ammo = 'ammo.js';

			var scene = new Physijs.Scene({fixedTimeStep: 1/125}), 
			stats, // shows framerate
			renderer = window.WebGLRenderingContext ?  new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer(),
			mouseX = 0, mouseY = 0,
			windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2,
			light1, light2, light3, light4, // lights
			camera,
			textGeo, textMesh, textMaterial, // text
			back, right, left, ceiling, floor, behind, // walls
			colours = [0x40ed1e, 0xed6c1e, 0x1ed2ed, 0xed1e32, 0xed1eba, 0xedeb1e],
			coords= { yRand: 0, xRand: 0, zRand: 0 };

			// Wall Prototype
			function Wall(name, xDegree, yDegree, zDegree, posX, posY, posZ, width, height, transparent, opacity){
				this.planeMaterial = Physijs.createMaterial(
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

				this.plane = new Physijs.BoxMesh(new THREE.BoxGeometry(width, .5, height),
				            this.planeMaterial,
							0 // mass (0 = immovable)
						);

				this.plane.rotation.x = xDegree * (Math.PI / 180); // convert to degrees from radians
				this.plane.rotation.y = yDegree * (Math.PI / 180);
				this.plane.rotation.z = zDegree * (Math.PI / 180);

				this.plane.position.x = posX;
				this.plane.position.y = posY;
				this.plane.position.z = posZ;

				this.plane.name = name;
				this.plane.receiveShadow = true;

				scene.add(this.plane);
			}

			// PointLight Prototype
			function PointLight(intesity, posX, posY, posZ, shadow) {
				this.light = new THREE.PointLight(new THREE.Color("#ffffff"), intesity);
				this.light.position.set(posX,posY,posZ);
				this.light.castShadow = shadow;
				scene.add(this.light);
			}

			// SpotLight Prototype
			function SpotLight(intensity, distance, radius, posX, posY, posZ, shadow, only, darkness) {
				this.light = new THREE.SpotLight(new THREE.Color("#ffffff", intensity, distance, radius));
				this.light.position.set(posX,posY,posZ);
				this.light.castShadow = shadow;
				this.light.onlyShadow = only;
				this.light.shadowDarkness = darkness;
				scene.add(this.light);
			}

			// Balloon Prototype
			function Balloon(geometry, i) {

				this.colour = colours[Math.floor(Math.random() * colours.length)];

				this.material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
					color: this.colour,
					transparent: true,
					opacity: .85,
					side: THREE.FrontSide
				}), 1, 1);

				this.balloon = new Physijs.BoxMesh(geometry, this.material);

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

				this.balloon.position.y = coords.yRand-25;
				this.balloon.position.x = coords.xRand;
				this.balloon.position.z = coords.zRand+24;

				this.balloon.name = "balloon"+i;
				this.balloon.castShadow = true;
				this.balloon.receiveShadow = true;

				scene.add(this.balloon);

			}

			Balloon.prototype.applyForce = function() {
				this.balloon.applyCentralImpulse(new THREE.Vector3(0,0,-250));
			};

			Balloon.prototype.randomSize = function() {
				var rand = Math.random() * 2.3;
				this.balloon.scale.set(rand,rand,rand);
			}

			function Confetti(){

				this.material = Physijs.createMaterial(
				                    new THREE.MeshLambertMaterial({
										color: 0x1ed2ed,
										shading: THREE.FlatShading,
										side: THREE.FrontSide
									}),
									0.1, //friction
									0.1 // bounciness (aka. restitution)
				                );

				this.confetti = new Physijs.BoxMesh(new THREE.BoxGeometry(.05, 0.01, 0.1),
				            this.material
						);

				this.confetti.position.x = posX;
				this.confetti.position.y = posY;
				this.confetti.position.z = posZ;

				this.confetti.castShadow = true;
				this.confetti.receiveShadow = true;

			}

			function initScene(){

				scene.setGravity(new THREE.Vector3(0,15,0));

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				stats.domElement.style.zIndex = 100;
				document.getElementById($scope.roomId).appendChild( stats.domElement );

				renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.shadowMapEnabled = true;
				renderer.shadowMapSoft = true;
				document.getElementById($scope.roomId).appendChild(renderer.domElement);

				camera = new THREE.PerspectiveCamera(
				             50,
				             window.innerWidth / window.innerHeight,
				             29,
				             60
				             );
				camera.setLens(55, 35);
				camera.position.set(0,0,40);
				scene.add(camera);

				new Wall("back", 90, 0, 0, 0, 0, -10, 100, 100, false, 1);
				new Wall("right", 90, 0, 90, 35, 0, 12.5, 45, 100, true, 0);
				new Wall("left", 90, 0, 90, -35, 0, 12.5, 45, 100, true, 0);
				// new Wall("ceiling", 0, 90, 0, 0, 10, 12.5, 45, 40, false, 1);
				// new Wall("floor", 0, 90, 0, 0, -10, 12.5, 45, 100, false, 1);
				new Wall("behind", 90, 0, 0, 0, 0, 10, 40, 30, true, 0);

				light1 = new PointLight(1.2,138,134,107,false);
				light2 = new SpotLight(.01, 25, 10 * Math.PI / 180,-110,-121,0, false, false,0.5);
				light3 = new SpotLight(.01, 25, 10 * Math.PI / 180,-19.8,-35,20, false, false,0.5);
				light4 = new SpotLight(.0001, 0, 10 * Math.PI / 180,-27,8,172,true, true,0.2);

				makeBalloons(100);

				var size1, size2;
				if(windowHalfX > 465){ 
					size1 = 4.5; 
					size2 = 3;
				} else {
					size1 = size2 = 2.5;
				} 
				createText("Happy Birthday", 2.5, -9.4, size1)
				createText($scope.name+"!", -2.5, -3, size2);

			}

			function makeBalloons(iterations){

				var loader = new THREE.JSONLoader();
				loader.load('mesh/simple_balloon.json', function(geometry, materials){

					for (var i = 0; i < iterations; i++) {
						
						var balloon = new Balloon(geometry, i);
						
						balloon.randomSize();
						balloon.applyForce();

					};

				});

			}

			function createText(text, txtY, txtZ, size) {

				textGeo = new THREE.TextGeometry( text, {

					size: size,
					height: 1,
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
				mouseX = ( evt.clientX - windowHalfX ) / 80;
				mouseY = ( evt.clientY - windowHalfY ) / 80;
			}

			function handleMouseDown( evt ) {
				makeBalloons(20);
			};

			function render(){
				scene.simulate();

				camera.position.x += ( mouseX - camera.position.x );
				camera.position.y += ( - mouseY - camera.position.y );
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
				gui.add(light2.light.position, 'x', -200, 200);
				gui.add(light2.light.position, 'y', -200, 200);
				gui.add(light2.light.position, 'z', -500, 500);
			}

			initScene();
			// loadGUI();

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

	}

}]);