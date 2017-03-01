//set methods for 
(function (R) {
    var cloneSet; // to cache set cloning function for optimisation

    /**
     * Clones Raphael element from one paper to another
     *     
     * @param {Paper} targetPaper is the paper to which this element 
     * has to be cloned
     *
     * @return RaphaelElement
     */
    R.el.cloneToPaper = function (targetPaper) {
        return (!this.removed &&
            targetPaper[this.type]().attr(this.attr()));
    };

    /**
     * Clones Raphael Set from one paper to another
     *     
     * @param {Paper} targetPaper is the paper to which this element 
     * has to be cloned
     *
     * @return RaphaelSet
     */
    R.st.cloneToPaper = function (targetPaper) {
        targetPaper.setStart();
        this.forEach(cloneSet || (cloneSet = function (el) {
            el.cloneToPaper(targetPaper);
        }));
        return targetPaper.setFinish();
    };
}(Raphael));

// Initialize container when document is loaded
$(document).ready(function () {

	function getSvgPoint(x, y) {
		var svg = $("#raphael-container > svg")[0],
            svgDropPoint = svg.createSVGPoint();

        svgDropPoint.x = x;
        svgDropPoint.y = y;
		return svgDropPoint.matrixTransform(svg.getScreenCTM().inverse());
        //svgDropPoint = svgDropPoint.matrixTransform($(main_group_selector).getCTM().inverse());
    }


	const mapSize={ width: 2000, height: 2000 }
	var paper = Raphael("raphael-container", mapSize.width, mapSize.height);
	//group for minimap
	var group = paper.set()
	// Popover
	var ph = $('#pop-holder');
	ph.popover({
		trigger: 'manual',
		title: 'Popover Title',
		content: 'Popover Content',
		animation: false,
		html: true
  	});

	// Adding circles
	for(var i=1; i<=100; i++) {
		for(var j=1; j<=100; j++) {
			var circle;
			circle = paper.circle(i*20, j*20, 5);
			circle.node.setAttribute("fill", "#ccc");
			circle.node.setAttribute("stroke", "none");


			// Mouseover
			circle.mouseover(function(){
				this.node.setAttribute("fill", "#00f");
			});

			// Mouseout
			circle.mouseout(function(){
				this.node.setAttribute("fill", "#ccc");
			});

			// Onclick
			circle.click(function(evt){
				 var targ = $(evt.target),
			    off = targ.offset(),
			    r = parseInt(targ.attr('r')); 
			    
					// position
					ph[0].style.left = (off.left + r*2) + 'px';
					ph[0].style.top = (off.top + r) + 'px';

					ph.attr('data-original-title', targ.attr('pop-title'));
					ph.attr('data-content', this.attrs.cx + ","+this.attrs.cy);
					// show
					ph.popover('show');
			})

			//add item on group
			group.push(circle)
		}
		
	}

	//settings componets to minimap
	var marging = paper.rect(0, 0, mapSize.width, mapSize.height),
	    viewRectMiniMap,
		// testRect, // RECT TEST
	    scaleView,
		factorZoom,
		w = window.innerWidth ,
		h = window.innerHeight,
		width = mapSize.width * 0.1,
		height = mapSize.height * 0.1,
		topLeft = ",0,0",
		//create paper of minimap
		miniMap = Raphael(document.getElementById("minimap"), width, height);

	//adding component to minimap
	group.push(marging)
	scaleView = 0.1
	var transformString = "s" + scaleView + "," + scaleView + topLeft
	
	// clone group 
	var miniset = group.cloneToPaper(miniMap);
	miniset.transform(transformString);
	viewRectMiniMap = miniMap.rect(0, 0, w * scaleView , h * scaleView)
									.data("top",0)
									.data("left",0);	

	// Svg-zoom-pan main Container
	var svgElement = document.querySelector('#raphael-container > svg')
	var panZoomTigerContainer = svgPanZoom(svgElement, {
      zoomEnabled: true,
      fit: false,
      center: false,
      minZoom: 1,
      contain: false,
      //onPan: onPan
	  beforePan: beforePan,
	  beforeZoom: beforeZoom
	});

	function beforePan (oldPan, newPan){
		ph.popover('hide');
		console.log(newPan)
		var stopHorizontal = false
		, stopVertical = false
		, gutterWidth = 200
		, gutterHeight = 200
			// Computed variables
		, sizes = this.getSizes()
		, leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth
		, rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom)
		, topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight
		, bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom)
		
		customPan = {}
		customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x))
		customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y))

		customPan.x = customPan.x > 0 ? 0 : customPan.x
		customPan.y = customPan.y > 0 ? 0 : customPan.y

		
		distance = {"x": oldPan.x - customPan.x, "y": oldPan.y - customPan.y}
		moveFocusMinimap(distance)
		return customPan
	}

	function beforeZoom (oldZoom, newZoom){

		ph.popover('hide');

		var factor  = newZoom/oldZoom;
		scaleView = scaleView / factor;

		var w = window.innerWidth ,
			h = window.innerHeight,	
			width = w * scaleView,
			height = h * scaleView,
			x = (event.clientX ),// - (width / 2),
			y = (event.clientY ),// - (height / 2);
			data = viewRectMiniMap.data(),
			cursorX = (data.top  + x ) * scaleView,
			cursorY = (data.left + y) * scaleView;
			rectX = cursorX - (width/2)
			rectY = cursorY - (height/2)
			
		
		
		console.log(this.getPan().x * scaleView*-1 )	
		//console.log(data.top, x, scaleView)
		/** rect TEST 
		testRect ? testRect.remove(): null
		testRect = miniMap.rect(this.getPan().x * scaleView*-1 , this.getPan().y * scaleView*-1 ,width , height)
		testRect.node.setAttribute("fill", "#00f");*/

		viewRectMiniMap.remove()
		//console.log(getSvgPoint(x,y))
		viewRectMiniMap = miniMap.rect(this.getPan().x * scaleView*-1 , this.getPan().y * scaleView*-1 , width , height)
							.data("top",rectX)
							.data("left",rectY);	
		 

		return newZoom
	}	
		


	function moveFocusMinimap(distance){
		//panZoomTigerContainer.pan(point)
		var dx = distance.x * scaleView,
			dy = distance.y * scaleView,
			translation = dx + "," + dy,
			top = viewRectMiniMap.data('top') + dx
			left = viewRectMiniMap.data('left') + dy

		viewRectMiniMap.translate(translation)
		viewRectMiniMap.data('top', top)
		viewRectMiniMap.data('left', left)
		//console.log(viewRectMiniMap.data())
	}

	//set zoom mini map
	var minimapSVG = document.querySelector('#minimap > svg')
	var panZoomTigerMinimap = svgPanZoom(minimapSVG, {
      zoomEnabled: false,
      fit: true,
      center: false,
      minZoom: 0.1,
      contain: true,
      //onPan: onPan
	  //beforePan: beforePan
	});
	//console.log(panZoomTigerMinimap.getSizes().realZoom)
	//console.log(panZoomTigerContainer.getSizes().realZoom)
});