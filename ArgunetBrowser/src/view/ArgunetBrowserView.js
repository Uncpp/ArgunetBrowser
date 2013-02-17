// namespace:
this.argunet = this.argunet||{};

argunet.ArgunetBrowserView = function(htmlElement, width, height, browserId){
	this.canvasView= undefined;
	
	this.cWidth = width || 640;
	this.cHeight = height || 385;

	//canvas
	if (typeof(htmlElement)=="string") { htmlElement = $(htmlElement);}
	$(htmlElement).append("<div class='argunetBrowser loading'><canvas></canvas></div>").width(this.cWidth).height(this.cHeight);
	
	this.cWidth -=2;
	this.cHeight -=2;

	this.canvas = $(htmlElement).children(".argunetBrowser").children("canvas").get(0);
	$(this.canvas).width(this.cWidth).height(this.cHeight);
	this.canvas.width = this.cWidth;
	this.canvas.height = this.cHeight;

	
	//createjs stage
	this.stage = new createjs.Stage(this.canvas);
	this.stage.mouseEventsEnabled = true;
	this.stage.enableMouseOver(20);
	
	//check if touch is supported and enable it
	if(createjs.Touch.isSupported())createjs.Touch.enable(this.stage);
	
	//Navigation Bar
	this.navigationBar = new argunet.NavigationBarView($(this.canvas).parent());
	this.navigationOpened = false;
	
	//Debate List
	this.debateListView = new argunet.DebateListView($(this.canvas).parent(),browserId);
	this.debateListView.setHeight($(this.canvas).parent().height()-this.navigationBar.height);

	
	//Tooltip
	var tooltipLayer= new createjs.Container();
	this.stage.addChild(tooltipLayer);
	
	this.tooltip = new argunet.TooltipCanvasView(this.canvas);
	//tooltipLayer.addChild(tooltip);
	this.stage.addChild(this.tooltip);
	
	//Extra Jquery Click Handler for Navigation Bar
	var that = this;
	$(this.canvas).parent().bind("mousedown touchstart",function(){
		that.showNavigationBar();
	});
	
};

argunet.ArgunetBrowserView.prototype.showNavigationBar = function(){
	window.clearTimeout(this.navigationBarTimeout);
	if(!this.navigationOpened){
			this.navigationBar.show();
			this.navigationOpened = true;
	}
	var that = this;
	this.navigationBarTimeout = window.setTimeout( function(){
		if(that.navigationOpened && !that.debateListView.isOpen && that.stage.mouseY < that.canvas.height - that.navigationBar.height){
			that.navigationBar.hide();
			that.navigationOpened = false;
		}
		window.clearTimeout(that.navigationBarTimeout);
	}, 3500 );		
};
argunet.ArgunetBrowserView.prototype.handleEvent = function(evt){
	var that = this;
	if(evt.type == "showTooltip"){
    	this.tooltipTimeout = window.setTimeout( function(){
    		that.tooltip.setContent(evt.tooltip);
    		that.tooltip.setVisible(true);
    		that.tooltip.x = Math.min(that.stage.canvas.width-5-that.tooltip.width, that.stage.mouseX+5);
    		that.tooltip.y = Math.min(that.stage.canvas.height-5-that.tooltip.height, that.stage.mouseY+5);
    		that.stage.update();
    		window.clearTimeout(this.tooltipTimeout);
    	}, 1000 );
		
	}else if(evt.type == "hideTooltip" && !this.mouseOverTooltip){
			window.clearTimeout(this.tooltipTimeout);
			this.tooltip.setVisible(false);
			this.stage.update();
	}else if(evt.type == "mousedown"){
		if(!this.mouseOverTooltip){
			window.clearTimeout(this.tooltipTimeout);
			this.tooltip.setVisible(false);
			this.stage.update();
		}
	}else if(evt.type == "mouseover" && evt.target == this.tooltip){
		this.mouseOverTooltip = true;
	}else if(evt.type == "mouseout" && evt.target == this.tooltip){
		this.mouseOverTooltip = false;
		this.tooltip.setVisible(false);
		this.stage.update();		
	}else if(evt.type == "stagemousemove"){
		this.showNavigationBar();
	}else if (evt.type == "openDebateList"){
		this.debateListView.show();		
	}else if (evt.type == "closeDebateList"){
		this.debateListView.hide();		
		this.showNavigationBar();
	}else if (evt.type == "openFullscreen"){
    	var ab= $(this.canvas).parent().get(0);
    	var fs = ab.requestFullscreen || ab.webkitRequestFullscreen || ab.mozRequestFullScreen;
    	if(fs) fs.call(ab);		
	}else if (evt.type == "closeFullscreen"){
    	var fs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
    	if(fs) fs.call(document);
	}else if (evt.type == "fullscreenchange" || evt.type == "mozfullscreenchange" || evt.type == "webkitfullscreenchange" ){
		var c = this.canvas;
	    if(document.mozFullScreen || document.webkitIsFullScreen) {
	        var rect = c.getBoundingClientRect();
	        $(c).width(rect.width);
	        $(c).height(rect.height);
	    	this.canvas.width = rect.width;
	    	this.canvas.height = rect.height;
	    	this.debateListView.setHeight(rect.height);
	    	var that = this;
	    	window.setTimeout(function(){ //not nice, but otherwise the graph is getting distorted (height/width is too large). at least in osx.
		        var rect = c.getBoundingClientRect();
		        $(c).width(rect.width);
		        $(c).height(rect.height);
		    	that.canvas.width = rect.width;
		    	that.canvas.height = rect.height;
		    	that.debateListView.setHeight(rect.height-that.navigationBar.height+2);
	    	},2000);
	    }
	    else {
	    	$(c).width(this.cWidth);
	    	$(c).height(this.cHeight);
	    	this.canvas.width = this.cWidth;
	    	this.canvas.height = this.cHeight;
	    	this.debateListView.setHeight(this.cHeight-this.navigationBar.height+2);

	    }		
	}		
};
argunet.ArgunetBrowserView.prototype.setCanvasView = function (view){
	var that = this;
	this.stage.clear();
	this.canvasView = view;	
	this.canvasView.initialize(this.stage);
	this.tooltip.addEventListener("mouseover",this);
	this.tooltip.addEventListener("mouseout",this);
	
	this.stage.addEventListener("stagemousemove",this);
	this.navigationBar.addEventListener("openDebateList",this);
	this.navigationBar.addEventListener("closeDebateList",this);

	//Fullscreen
	document.addEventListener('fullscreenchange', this);
	document.addEventListener('mozfullscreenchange', this);
	document.addEventListener('webkitfullscreenchange', this);
	
	this.navigationBar.addEventListener("openFullscreen",this);
	this.navigationBar.addEventListener("closeFullscreen",this);
};
argunet.ArgunetBrowserView.prototype.removeLoadingSpinner = function(){
	$(this.canvas).parent().removeClass("loading");
};
