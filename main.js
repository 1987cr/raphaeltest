// Initialize container when document is loaded
$(document).ready(function () {

	// var w = window.innerWidth;
	// var h = window.innerHeight;
	var paper = Raphael("raphael-container", 2000, 2000);
	

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
	var circle;
	for(var i=1; i<=100; i++) {
		for(var j=1; j<=100; j++) {

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
		}
		
	}

	// Svg-zoom-pan
	var svgElement = document.querySelector('#raphael-container > svg')
	var panZoomTiger = svgPanZoom(svgElement, {
      zoomEnabled: true,
      fit: true,
      center: true,
      minZoom: 0.1,
      contain: true,
      onPan: onPan
	});
	
	function onPan(newPan) {
		ph.popover('hide');
	}
	
});