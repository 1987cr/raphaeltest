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


	const mapSize={ width: 2000, height: 2000 }
	var paper = Raphael("raphael-container", mapSize.width, mapSize.height);

	// Popover
	var ph = $('#pop-holder');
	ph.popover({
		trigger: 'manual',
		title: 'Popover Title',
		content: 'Popover Content',
		animation: false,
		html: true
  	});

	//settings componets to minimap
	var group = paper.set(),
	    marging = paper.rect(0, 0, mapSize.width, mapSize.height),
	    viewRectMiniMap,
	    scaleView,
		factorZoom

	//adding component to minimap
	group.push(marging)

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

	// Svg-zoom-pan main Container
	var svgElement = document.querySelector('#raphael-container > svg')
	var panZoomTigerContainer = svgPanZoom(svgElement, {
      zoomEnabled: false,
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
//		var zoom =  newZoom / 10
//		transformStr = "s"+zoom+","+zoom
//		console.log( transformStr, zoom, this.getSizes().realZoom)
		//viewRectMiniMap.transform(transformStr)
		return newZoom
	}	

	function setMiniMap(top, left, scale){
		//set minimap data
		var w = window.innerWidth ,
		    h = window.innerHeight,
		    width = mapSize.width * 0.1,
		    height = mapSize.height * 0.1,
		    topLeft = ",0,0"
		
		scaleView = scale ? scale : 0.1
		if (top && left){
			topLeft = ","+top+","+left
		}
		var transformString = "s" + scaleView + "," + scaleView + topLeft

		//create paper of minimap
		var miniMap = Raphael(document.getElementById("minimap"), width, height);
		// clone group 
		var miniset = group.cloneToPaper(miniMap);

		miniset.transform(transformString);
		
		viewRectMiniMap = miniMap.rect(0, 0, w * scaleView , h * scaleView)
										.data("top",0)
										.data("left",0);		
		
	}

	setMiniMap()


	function moveFocusMinimap(distance){
		//panZoomTigerContainer.pan(point)
		var dx = distance.x * scaleView,
			dy = distance.y * scaleView,
			translation = dx + "," + dy
		viewRectMiniMap.translate(translation)
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
});