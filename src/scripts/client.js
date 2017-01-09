var Handlebars = require("Handlebars");

document.addEventListener("DOMContentLoaded", function(e) {
  var studioSheetURL = "https://spreadsheets.google.com/feeds/list/1DWrXq6f31keb00q2KTU2xC1lyvpOkcKjXU6RDJ2WFW0/1/public/values?alt=json";
  var studioTemplateSource = document.getElementById("studio-info").innerHTML;
  var studioTemplate = Handlebars.compile(studioTemplateSource);
  var studioMap = document.getElementById("studio-map");
  var studioList;

  function getJSONFromSpreadsheet(url, success) {

    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var data = JSON.parse(request.responseText);
        success(data);
      } else {
        // We reached our target server, but it returned an error

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
    studioMap.innerHTML = html;
  });

});
