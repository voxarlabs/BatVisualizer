class BatViewer{
	
	constructor(width, height){
		this.width = width;
		this.height = height;

		this.scene;
	}

	loadFile(path){
		d3.json(path, function(error, data) {
		if (error) { throw error; }

		data.bats.sort(function(a, b){
		  if(a.track[0].f < b.track[0].f)
		    return -1;
		  else if(a.track[0].f > b.track[0].f)
		    return 1;
		  else 
		    return 0;
		});

		this.scene = new Scene(data, this.width, this.height);
			this.scene.init();
			this.scene.animate();
		}.bind(this));		
	}

	setInterval(f1, f2){
		this.scene.initialFrame = f1;
		this.scene.finalFrame = f2;
		this.scene.frame = f1;
		this.scene.renderBatsUsingFrameInterval = true;
	}

	receiveBatLabels(labels){
		this.scene.labels = labels;
		this.scene.labelIndex = 0;
		this.scene.renderBatsUsingFrameInterval = false;
	}
}