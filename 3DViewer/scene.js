
class Scene{

	constructor(data, width, height){
		this.width = width;
		this.height = height;

		this.objects = [];

		this.container;
	    this.camera;
	    this.controls;
	    this.scene;
	    this.renderer;
	    
	    this.initialFrame = 0;
	    this.frame = this.initialFrame;
	    this.finalFrame = data.total;
	    this.bats = data;
	    this.cave = this.createCave();

	    this.batScale = 10;
	    this.lastMilisec = new Date().getMilliseconds();
	    this.diff = 0;
	    this.frameRenderInterval = 1000/data.fps;

	    this.renderBatsUsingFrameInterval = true;

	    this.labels = [];
	    this.labelIndex = 0;
	    this.trackIndex = 0;
	    this.labelDictionary = {};
	}

	init() {
		this.container = document.getElementById( 'threejsviewer' );
		this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 1, 10000 );//new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1000;
		this.controls = new THREE.TrackballControls( this.camera, this.container );
		this.controls.rotateSpeed = 5.0;
		this.controls.zoomSpeed = 1.2;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = true;
		this.controls.dynamicDampingFactor = 0.3;
		this.scene = new THREE.Scene();
		this.scene.add( new THREE.AmbientLight( 0x505050 ) );
		var light = new THREE.SpotLight( 0xffffff, 1.5 );
		light.position.set( 0, 500, 2000 );
		light.castShadow = true;
		light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
		light.shadow.bias = - 0.00022;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		this.scene.add( light );
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setClearColor( 0xf0f0f0 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize(this.width, this.height);//( window.innerWidth, window.innerHeight );
		this.renderer.sortObjects = false;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.container.appendChild( this.renderer.domElement );
		var dragControls = new THREE.DragControls( this.objects, this.camera, this.renderer.domElement );
		dragControls.addEventListener( 'dragstart', function ( event ) { this.controls.enabled = false; }.bind(this) );
		dragControls.addEventListener( 'dragend', function ( event ) { this.controls.enabled = true; }.bind(this) );

		for ( var i = 0; i < this.bats.bats.length; i ++ )
	    	this.labelDictionary[this.bats.bats[i].label] = this.bats.bats[i];
	}

  	createCave(){
  		var data = this.bats;
  		var aMin = 999999;
  		var aMax = -999999;

  		var averageZ = 0;

  		for(var i=0; i<data.bats.length; i++){
  			var z = 0;
			for(var k=0; k < data.bats[i].track.length; k++){
				z += data.bats[i].track[k].a;
			}
			z /= data.bats[i].track.length;

			averageZ += z;
  		}

  		averageZ /= data.bats.length;

  		for(var i=0; i<data.bats.length; i++){
  			var z = 0;
			for(var k=0; k < data.bats[i].track.length; k++){
				z += data.bats[i].track[k].a;
			}
			z /= data.bats[i].track.length;

			if(z > 4*averageZ)
				continue;

  			aMin = aMin < z ? aMin : z;
  			aMax = aMax > z ? aMax : z;
  		}

  		var cave = {xMin:0, xMax:data.width, yMin:0, yMax:data.height, zMin:aMin, zMax:aMax};
  		return cave;
  	}

  	fillBatScene(){
  		this.clearScene();

  		this.objects = [];
  		this.scene = null;
	    this.scene = new THREE.Scene();

  		this.drawCave();
	    this.drawGrid();
	    this.drawBats();
	}

	clearScene(){
		for(var i = 0; i < this.objects.length; i++) {
			this.scene.remove(this.objects[i]);

			if (!(this.objects[i].geometry === undefined)) {
				this.objects[i].geometry.dispose();
			}
			if (!(this.objects[i].material === undefined)) {
				this.objects[i].material.dispose();
			}
		}
	}

	drawCave(){
	    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
	    var materialL = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	    var materialR = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
		var leftWall = new THREE.Mesh( geometry, materialL );
		var rightWall = new THREE.Mesh( geometry, materialR );
		//debugger;
		var scaleX = 5;
		var scaleY = this.cave.yMax-this.cave.yMin;
		var scaleZ = this.cave.zMax-this.cave.zMin;
		var maxScale = scaleX > scaleY ? scaleX : scaleY;
		maxScale = 10;//maxScale > scaleZ ? maxScale : scaleZ;

		leftWall.position.x = this.cave.xMin-scaleX/2-this.batScale/2;
		leftWall.position.y = this.cave.yMin + scaleY/2;
		leftWall.position.z = this.cave.zMin + scaleZ/2;
		leftWall.scale.x = scaleX;
		leftWall.scale.y = scaleY + this.batScale;
		leftWall.scale.z = scaleZ + this.batScale;

		rightWall.position.x = this.cave.xMax+scaleX/2+this.batScale/2;
		rightWall.position.y = this.cave.yMin + scaleY/2;
		rightWall.position.z = this.cave.zMin + scaleZ/2;
		rightWall.scale.x = scaleX;
		rightWall.scale.y = scaleY + this.batScale;
		rightWall.scale.z = scaleZ + this.batScale;

		this.scene.add(leftWall);
		this.scene.add(rightWall);
		this.objects.push(leftWall);
		this.objects.push(rightWall);
	}

	drawGrid(){
		//size of the grid cube
		var gridCubeSize = 200;
		//how many grid cubes we will plot in each axis
		var nCubes = 20;
		var y = this.cave.yMin;
		for(var i=-nCubes/2; i<(nCubes/2)+1; i++){
			//Horizontal
			var geometryH = new THREE.Geometry();
			geometryH.vertices.push(new THREE.Vector3( -gridCubeSize*nCubes/2,  y, i*gridCubeSize));
			geometryH.vertices.push(new THREE.Vector3( gridCubeSize*nCubes/2,  y, i*gridCubeSize));
			var materialH = new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } );
			var lineH = new THREE.Line(geometryH, materialH);
			this.scene.add(lineH);
			this.objects.push(lineH);

			// geometryH.dispose();
			// materialH.dispose();

			//Vertical
			var geometryV = new THREE.Geometry();
			geometryV.vertices.push(new THREE.Vector3( i*gridCubeSize,  y, -gridCubeSize*nCubes/2));
			geometryV.vertices.push(new THREE.Vector3( i*gridCubeSize, y, gridCubeSize*nCubes/2));
			var materialV = new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } );
			var lineV = new THREE.Line(geometryV, materialV);
			this.scene.add(lineV);
			this.objects.push(lineV);

			// geometryV.dispose();
			// materialV.dispose();
		}
	}

	drawBats(){
		if(this.renderBatsUsingFrameInterval)
	    	this.drawBatsInsideFrameInterval();
	    else
	    	this.drawBatsUsingLabels();
	}

	drawBatsInsideFrameInterval(){
		//console.log(this.initialFrame + " QWE " + this.finalFrame + " ZXC " + this.frame);
		var data = this.bats;
	    var light = new THREE.DirectionalLight( 0xffffff, 1 );
	    light.position.set( 1, 1, 1 ).normalize();
	    this.scene.add(light);
	    this.objects.push(light);

	    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
	   
	    for ( var i = 0; i < data.bats.length; i ++ ) {
			
			var tracks = data.bats[i].track;
			if(this.frame < tracks[0].f)
				break;

			//if this bat should not be renderer in
			//this frame continue to the next bat
			if(this.frame < tracks[0].f || this.frame > tracks[tracks.length-1].f)
				continue;

			var materialO = new THREE.MeshLambertMaterial( { color: i*0xffffff } );
			var object = new THREE.Mesh( geometry, materialO );

			var z = 0;
			for(var k=0; k < tracks.length; k++){
				z += tracks[k].a;
			}
			z /= tracks.length;

			//find the track interval of the current frame
			for(var j = 0; j < tracks.length; j ++ ){
				
				object.position.x = tracks[j].x;
				object.position.y = tracks[j].y;
				object.position.z = z;//tracks[j].z;
				object.rotation.x = 0;
				object.rotation.y = 0;
				object.rotation.z = 0;
				object.scale.x = this.batScale;
				object.scale.y = this.batScale;
				object.scale.z = this.batScale;

				if((this.frame == tracks[j].f) || (j+1 < tracks.length && this.frame < tracks[j+1].f))
					break;
				else
				{
					var pathLine = new THREE.Geometry();
					pathLine.vertices.push(new THREE.Vector3( tracks[j].x, tracks[j].y, z));
					pathLine.vertices.push(new THREE.Vector3( tracks[j+1].x, tracks[j+1].y, z));
					var materialLine = new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } )
					var line = new THREE.Line(pathLine, materialLine);
					this.scene.add(line);
					this.objects.push(line);
				}
			}
			
			this.scene.add(object);
			this.objects.push(object);
	    }
	}
	
	drawBatsUsingLabels(){

		if(this.labelIndex >= this.labels.length){
			return;
		}

	    var light = new THREE.DirectionalLight( 0xffffff, 1 );
	    light.position.set( 1, 1, 1 ).normalize();
	    this.scene.add( light );
	    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
	    
	    var bat = this.labelDictionary[this.labels[this.labelIndex]];

	    if(this.trackIndex >= bat.track.length){
	    	this.labelIndex++;
	    	this.trackIndex = 0;
	    	return;
	    }

	    var materialO = new THREE.MeshLambertMaterial( { color: 0xffffff } );
		var object = new THREE.Mesh( geometry, materialO );

		var z = 0;
		for(var k=0; k < bat.track.length; k++){
			z += bat.track[k].a;
		}
		z /= bat.track.length;


		object.position.x = bat.track[this.trackIndex].x;
		object.position.y = bat.track[this.trackIndex].y;
		object.position.z = z;
		object.rotation.x = 0;
		object.rotation.y = 0;
		object.rotation.z = 0;
		object.scale.x = this.batScale;
		object.scale.y = this.batScale;
		object.scale.z = this.batScale;

		for(var j=0; j<this.trackIndex; j++){
			var pathLine = new THREE.Geometry();
			pathLine.vertices.push(new THREE.Vector3( bat.track[j].x, bat.track[j].y, z));
			pathLine.vertices.push(new THREE.Vector3( bat.track[j+1].x, bat.track[j+1].y, z));
			var materialLine = new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } );
			var line = new THREE.Line(pathLine, materialLine);
			this.scene.add(line);
			this.objects.push(line);
		}
	
		
		this.scene.add(object);
		this.objects.push(object);

		this.trackIndex++;
	}

	animate() {
		requestAnimationFrame( this.animate.bind(this) );
		this.render();
	}
	
	render() {
		var d = new Date();
    	var n = d.getMilliseconds();
		if(n < this.lastMilisec || (this.lastMilisec + this.frameRenderInterval)%1000 <= n){
			this.lastMilisec = n;

			if(this.frame < this.finalFrame)
				this.frame++;
			else
				this.frame = this.initialFrame;

			this.fillBatScene(this.bats, this.frame);
		}
		
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
	}
}
