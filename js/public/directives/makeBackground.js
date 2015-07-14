balloonApp.directive('makeBackground', ['$window', '$rootScope', function($window, $rootScope) {
    return {
    	restrict: 'A',
        scope: {
          roomId: '@'
        },
        link : function($scope, element, attrs) {

			"use strict";

			var scene = new THREE.Scene(),
			renderer = window.WebGLRenderingContext ?  new THREE.WebGLRenderer({ antialias: true }) : new THREE.CanvasRenderer(),
			mouseX = 0, mouseY = 0,
			windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2,
			light1, light2, light3, light4, // lights
			camera,
			textGeo, textMesh, textMaterial, // text
			back; // walls

			// Wall Prototype
			function Wall(name, xDegree, yDegree, zDegree, posX, posY, posZ, width, height, transparent, opacity){
				
				var material= new THREE.MeshLambertMaterial({
										color: 0x1ed2ed,
										shininess: 1,
										transparent: transparent,
										opacity: opacity,
										shading: THREE.SmoothShading,
										side: THREE.FrontSide
									});

				var geometry = new THREE.BoxGeometry(width, .5, height);

				this.plane = new THREE.Mesh( geometry, material );

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

			function initScene(){

				renderer.setSize(window.innerWidth, window.innerHeight);
				document.getElementById($scope.roomId).appendChild(renderer.domElement);

				camera = new THREE.PerspectiveCamera(
				             50,
				             window.innerWidth / window.innerHeight,
				             29,
				             130
				             );
				camera.setLens(125, 35);
				camera.position.set(0,0,90);
				scene.add(camera);

				new Wall("back", 90, 0, 0, 0, 0, -10, 100, 100, false, 1);

				light1 = new PointLight(1.2,138,134,107,false);
				light2 = new SpotLight(.01, 25, 10 * Math.PI / 180,-110,-121,0, false, false,0.5);
				light3 = new SpotLight(.01, 25, 10 * Math.PI / 180,-19.8,-35,20, false, false,0.5);
				light4 = new SpotLight(.0001, 0, 10 * Math.PI / 180,-27,8,172,true, true,0.2);

				createText("A birthday is always", 7.5, -9, 1.5);
				createText("better with balloons.", 5, -9, 1.5);

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
				mouseX = ( evt.clientX - windowHalfX ) / 30;
				mouseY = ( evt.clientY - windowHalfY ) / 30;
			}

			function render(){
				camera.position.x += ( mouseX - camera.position.x );
				camera.position.y += ( - mouseY - camera.position.y );
				camera.lookAt( scene.position );

				renderer.render(scene, camera);
				requestAnimationFrame(render);
			}

			initScene();
			render();

			renderer.domElement.addEventListener( 
			    'mousemove', 
			    handleMouseMove
			);

		}

	}

}]);