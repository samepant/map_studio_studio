var Handlebars = require("Handlebars");
var $ = require("jquery");
var Panzoom = require("./panzoom.js");

document.addEventListener("DOMContentLoaded", function(e) {
  var studioSheetURL = "https://spreadsheets.google.com/feeds/list/1DWrXq6f31keb00q2KTU2xC1lyvpOkcKjXU6RDJ2WFW0/1/public/values?alt=json";
  var studioTemplateSource = document.getElementById("studio-info").innerHTML;
  var studioTemplate = Handlebars.compile(studioTemplateSource);
  var $studioMapContainer = $("#studio-map-container");
  var studioMap = document.getElementById("studio-map");
  var $studioMap = $("#studio-map");
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

  function setupContainerandMap () {
    //make $studioMap big
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    $studioMap.height(windowHeight+3000);
    $studioMap.width(windowWidth+3000);

    //make $studioMapContainer centered
    $studioMapContainer.css("position", "absolute");
    $studioMapContainer.css("top", ($(window).height() - $($studioMapContainer).outerHeight() / 2) + 
                                                $(window).scrollTop() + "px");
    $studioMapContainer.css("left", ($(window).width() - $($studioMapContainer).outerWidth() / 2) + 
                                                $(window).scrollLeft() + "px");

  };

  setupContainerandMap();

  //set up PANZOOM
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
        contain: true
      });
    });
  })();

  //arrange studios randomly around the center of the map
  //gets called after json is retrieved and processed

  function spreadStudios (studioArray) {
    //get center of map
    var mapLimitX = $studioMap.offset().left + $studioMap.width();
    var mapLimitY = $studioMap.offset().top + $studioMap.height();

    for (var i = 0; i < studioArray.length; i++) {
      var studio = $(studioArray[i]);

      //generate a random offset (i wish this was better)
      var xRand = Math.random() * (mapLimitX - 0) + 0;
      var yRand = Math.random() * (mapLimitY - 0) + 0;

      studio.css("position", "absolute");
      studio.css("top", yRand);
      studio.css("left", xRand);
    }

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
    var cleanStudios = {'studios':[]};

    for (var i = 0; i < infoRaw.length; i++) {
      var studioRaw = infoRaw[i];
      var studioClean = {
        'name': studioRaw.gsx$name.$t,
        'location': studioRaw.gsx$location.$t,
        'practical': studioRaw.gsx$practical.$t,
        'conceptual': studioRaw.gsx$conceptual.$t,
        'timestamp': studioRaw.gsx$timestamp.$t
      };

      cleanStudios.studios.push(studioClean);
    }

    return cleanStudios;
  };

  //get JSON and clean the object for handlebars.js
  getJSONFromSpreadsheet(studioSheetURL, function (data) {
    studioList = makeNiceJSON(data);

    //Build and insert handlebar template
    var html = studioTemplate(studioList);
    $studioMap.html(html);

    //Build array of Studios
    var $studios = $(".studio").toArray();
    spreadStudios($studios);
  });

});
