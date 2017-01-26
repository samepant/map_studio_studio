var $ = require("jquery");
var Panzoom = require("./panzoom.js");
var d3 = require("d3");

document.addEventListener("DOMContentLoaded", function(e) {
  var studioSheetURL = "https://spreadsheets.google.com/feeds/list/1DWrXq6f31keb00q2KTU2xC1lyvpOkcKjXU6RDJ2WFW0/1/public/values?alt=json";
  var $studioMapContainer = $("#map-container");
  var studioList;

  // add centering function 

  function center (element) {
    element.css("position","absolute");
    element.css("top", Math.max(0, (($(window).height() - $(element).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    element.css("left", Math.max(0, (($(window).width() - $(element).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return element;
  }

  /* make $studioMapContainer giant in preparation of PANZOOM
  /
  /   panzoom lets you pan and zoom any html element,
  /   but you can't pan on the outside of the element,
  /   so we gotta make it really big
  /
  */

  function setupContainer () {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    /*//make $studioMapContainer centered
    $studioMapContainer.css("position", "absolute");
    $studioMapContainer.css("height", "windowHeight");
    $studioMapContainer.css("top", ($(window).height() - $($studioMapContainer).outerHeight() / 2) + 
                                                $(window).scrollTop() + "px");
    $studioMapContainer.css("left", ($(window).width() - $($studioMapContainer).outerWidth() / 2) + 
                                                $(window).scrollLeft() + "px");
    */
    $studioMapContainer.css("width", (windowWidth + "px")); 
    $studioMapContainer.css("height", (windowHeight + "px"));
  };

  function getJSONFromSpreadsheet(url, success) {

    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        success(data);
      } else {
        //it returned an error

      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
    };

    request.send();

  };

  function makeNiceJSON (dataFromSpreadsheet) {
    var infoRaw = dataFromSpreadsheet.feed.entry;
    var cleanStudios = [];

    for (var i = 0; i < infoRaw.length; i++) {
      var studioRaw = infoRaw[i];
      var htmlString = "<h1>" + studioRaw.gsx$name.$t + "</h1><h2>Location</h2><p>" + studioRaw.gsx$location.$t + "</p><h2>Practical knowledge</h2><p>" + studioRaw.gsx$practical.$t + "</p><h2>Conceptual interests/questions</h2><p>" + studioRaw.gsx$conceptual.$t + "</p>";
      var studioClean = {
        'timestamp': studioRaw.gsx$timestamp.$t,
        'html': htmlString
      };

      cleanStudios.push(studioClean);
    }

    return cleanStudios;
  };

  function createStudios (json) {
    var width = 2000;
    var height = 2000;
    var studioWidth = 150;
    var studioHeight = 150;

    //add coordinate info to each studio object
    for (var i = 0; i < json.length; i++) {
      var eachStudio = json[i];

      eachStudio.x = (Math.random() * (width - studioWidth));
      eachStudio.y = (Math.random() * (height - studioHeight));
    }

    //setup drag
    var drag = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);

    //create an svg on the dom
    var studioMap = d3.select("#map-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "map-svg");

    // filter for blur

    var filter = studioMap.append("defs")
        .append("filter")
          .attr("id", "blur")
        .append("feGaussianBlur")
          .attr("stdDeviation", 5);

    //container for all the studios
    var container = studioMap.append("g");

    // x and y axis
    container.append("g")
        .attr("class", "x axis")
      .selectAll("line")
        .data(d3.range(0, width, 20))
      .enter().append("line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 0)
        .attr("x2", function(d) { return d; })
        .attr("y2", height);
 
    container.append("g")
        .attr("class", "y axis")
      .selectAll("line")
        .data(d3.range(0, width, 20))
      .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) { return d; })
        .attr("x2", width)
        .attr("y2", function(d) { return d; });
        
    //the real deal studio maker (forms the group)
    var studioGroups = container.append("g")
        .selectAll(".studioGroup")
        .data(json);

    //the svg group
    var studioGroupsEnter = studioGroups.enter().append("g")
        .attr("class", "studioGroup")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")" })
        .call(drag);

    //the background circle
    studioGroupsEnter.append("circle")
        .attr("class", "studio-circle")
        //.attr("cx", function(d) { return (d.x + (studioWidth / 2.5)) })
        //.attr("cy", function(d) { return (d.y + (studioHeight / 2.5)) })
        .attr("r", (studioWidth / 1.8))
        .attr("filter", "url(#blur)")
        .attr("style", "stroke-width: 4; fill: whitesmoke");

    //the studio info itself
    studioGroupsEnter.append("foreignObject")
        .attr("width", studioWidth)
        .attr("height", studioHeight)
        //.attr("x", function(d) { return d.x })
        //.attr("y", function(d) { return d.y })
      .append("xhtml:body")
        .attr("class", "studio")
        .html(function(d) { return d.html });     
    
    //drag functions
    function dragstarted(d) {
      d3.selectAll("body")
      .classed("grabbing", function (d, i) {
        return !d3.select(this).classed("grabbing");
      });
      d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
      d.x += d3.event.dx;
      d.y += d3.event.dy;
      d3.select(this).attr("transform", "translate(" + d.x + "," + d.y + ")");
    }

    function dragended(d) {
      d3.selectAll("body")
      .classed("grabbing", function (d, i) {
        return !d3.select(this).classed("grabbing");
      });
      d3.select(this).classed("active", false);
    }

  };  


  //get JSON and clean the object for handlebars.js
  getJSONFromSpreadsheet(studioSheetURL, function (data) {
    studioList = makeNiceJSON(data);

    //do d3 goodness here
    createStudios(studioList);

    //center container
    setupContainer();

    //set up PANZOOM
    var $studioMap = $("#map-svg")
    $studioMap.panzoom({
      startTransform: 'scale(1.2)',
      minScale: 1.1,
      maxScale: 7,
      contain: "invert"
    }).panzoom("zoom");


    //set up focal point zoom with mouse scroll wheel or touchpad
    //shouts to to timmywil for this function 
    (function() {
      $studioMap.parent().on('mousewheel.focal', function( e ) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        $studioMap.panzoom('zoom', zoomOut, {
          increment: 0.04,
          animate: false,
          focal: e,
        });
      });
    })();

    //listener for shift key which shuts off panzoom so we can drag the studios
    //also listeners for arrow keys and zoom keys
    $(window).keydown(function (event) {
      //shift key
      if (event.which === 16) {
        $studioMap.panzoom("disable");

        $("body").addClass("grab");
      }

      //left arrow
      if (event.which === 37) {
        $studioMap.panzoom("pan", 50, 0, { relative: true });
      }

      //right arrow
      if (event.which === 39) {
        $studioMap.panzoom("pan", -50, 0, { relative: true });
      }

      //up arrow
      if (event.which === 38) {
        $studioMap.panzoom("pan", 0, 50, { relative: true });
      }

      //down arrow
      if (event.which === 40) {
        $studioMap.panzoom("pan", 0, -50, { relative: true });
      }

      //dash key
      if (event.which === 187) {
        //center zoom-out in middle of screen
        var coords = {};
        coords.clientX = window.innerWidth / 2;
        coords.clientY = window.innerHeight / 2;
        $studioMap.panzoom("zoom", false, {
          focal: coords
        });
      }

      //equals key
      if (event.which === 189) {
        //center zoom-in in middle of screen
        var coords = {};
        coords.clientX = window.innerWidth / 2;
        coords.clientY = window.innerHeight / 2;
        $studioMap.panzoom("zoom", true, {
          focal: coords
        });
      }
    });

    $(window).keyup(function (event) {
       if (event.which === 16) {
        $studioMap.panzoom("enable");

        $("body").removeClass("grab");
      }
    });
  });

});
