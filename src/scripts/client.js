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

    //make $studioMapContainer centered
    $studioMapContainer.css("position", "absolute");
    $studioMapContainer.css("height", "windowHeight");
    $studioMapContainer.css("top", ($(window).height() - $($studioMapContainer).outerHeight() / 2) + 
                                                $(window).scrollTop() + "px");
    $studioMapContainer.css("left", ($(window).width() - $($studioMapContainer).outerWidth() / 2) + 
                                                $(window).scrollLeft() + "px");

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
    var width = 4000;
    var height = 4000;
    var studioWidth = 500;
    var studioHeight = 500;

    //add coordinate info to each studio object
    for (var i = 0; i < json.length; i++) {
      var eachStudio = json[i];

      eachStudio.x = (Math.random() * (width - studioWidth));
      eachStudio.y = (Math.random() * (height - studioHeight));
    }

    //create an svg on the dom
    var studioMap = d3.select("#map-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "map-svg");

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
        
    //the real deal studio maker using foreign object cause all the text
    container.append("g")
      .selectAll("foreignObject")
        .data(json)
      .enter().append("foreignObject")
        .attr("width", studioWidth)
        .attr("height", studioHeight)
        .attr("x", function(d) { return d.x })
        .attr("y", function(d) { return d.y })
      .append("xhtml:body")
        .attr("class", "studio")
        .html(function(d) { return d.html });
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
      minScale: 0.5,
      maxScale: 7,
    });


    //set up focal point zoom with mouse scroll wheel or touchpad
    //shouts to to timmywil for this function 
    (function() {
      $studioMap.parent().on('mousewheel.focal', function( e ) {
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        $studioMap.panzoom('zoom', zoomOut, {
          increment: 0.03,
          animate: false,
          focal: e,
          contain: "invert"
        });
      });
    })();

  });

});
