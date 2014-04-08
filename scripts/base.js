$(document).ready(function() {

   if (navigator.mozApps) {
      var checkIfInstalled = navigator.mozApps.getSelf();
      checkIfInstalled.onsuccess = function () {
        if (checkIfInstalled.result) {
            $("#install").remove();
            $("#buttons").addClass("installed");
        }
      };
   } else {
      $("#install").remove();
      $("#buttons").addClass("installed");
   }

   $("#buttons").addClass("visible");

   var map = L.map("map").setView([48.20946, 16.371174], 13);
   var markerLayer;
   var currentPositionLayer;

   L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org" target="blank">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="blank">CC-BY-SA</a>, Station data <a href="http://citybik.es" target="blank">CityBik.es</a>',
      maxZoom: 18
   }).addTo(map);

   $(".leaflet-control-container a").each(function() {
      $(this).attr("target", "blank");
   });

   // Define markers - http://mapicons.nicolasmollet.com/category/markers/sports/cycling/
   var redIcon = L.icon({
      iconUrl: './lib/images/marker-red.png',
      iconSize: [32, 37],
      iconAnchor: [16, 36],
      popupAnchor: [0, -34]
   });

   var yellowIcon = L.icon({
      iconUrl: './lib/images/marker-yellow.png',
      iconSize: [32, 37],
      iconAnchor: [16, 36],
      popupAnchor: [0, -34]
   });

   var greenIcon = L.icon({
      iconUrl: './lib/images/marker-green.png',
      iconSize: [32, 37],
      iconAnchor: [16, 36],
      popupAnchor: [0, -34]
   });

   var loadStations = function(mode) {
      if (markerLayer) {
         map.removeLayer(markerLayer);
      }

      $.ajax({
         url: "http://api.citybik.es/citybike-wien.json?callback=getBikes",
         dataType: "jsonp",
         cache: false,
         jsonpCallback: "getBikes"
      }).done(function(data) {
         var markers = [];
         data.forEach(function(station) {
            var boxText = [
               "<h2>", station.name, "</h2>",
               (station.description ? "<p class='description'>" + station.description + "</p>" : ""),
               "<p class='bikes'>Freie Räder: ", station.bikes, "</p>",
               "<p class='boxes'>Freie Boxen: ", station.free , "</p>",
               "<p class='total'>Gesamt: ", station.boxes , "</p>",
               "<p>Status: ", station.status, "</p>"
            ];

            var icon = greenIcon;
            if (mode > 0) {
               icon = (station.bikes > 4 ? greenIcon : (station.bikes > 0 ? yellowIcon : redIcon));
            } else {
               icon = (station.boxes > 4 ? greenIcon : (station.boxes > 0 ? yellowIcon : redIcon));
            }

            markers.push(L.marker([station.lat / 1000000, station.lng / 1000000], {
               icon: icon
            }).bindPopup(boxText.join(""), {
               maxWidth: 160
            }));
         });
         markerLayer = L.layerGroup(markers);
         map.addLayer(markerLayer);
      });
   };

   $("#locate").on("click", function(event) {
      if ("geolocation" in navigator) {
         // Geolocation
         navigator.geolocation.getCurrentPosition(function (position) {
            if (currentPositionLayer) {
               map.removeLayer(currentPositionLayer);
            }
            currentPositionLayer = L.layerGroup([L.circleMarker(
               [position.coords.latitude, position.coords.longitude],
               {
                  radius: "8",
                  color: "#24C8FF",
                  fillColor: "#9EE7FF",
                  fillOpacity: 0.8
               }
            )]);

            map.addLayer(currentPositionLayer);
            map.setView([position.coords.latitude, position.coords.longitude], 15);
         },
         function (positionError) {
            var message = positionError.message;

            if (message === undefined) {
               switch (positionError.code) {
                  case 1: message = "Permission denied."; break;
                  case 2: message = "Position unavailable."; break;
                  case 3: message = "Request timed out."; break;
                  default: message = "Unknown error: " + positionError.code;
               }
            }

            alert(message);
         });
      } else {
         alert("Your device does not support geolocation.");
      }
   });

   $("#ausborgen").on("click", function(event) {
      loadStations(1);
      $("#map").addClass("borrow").removeClass("return");
   });

   $("#abstellen").on("click", function(event) {
      loadStations(-1);
      $("#map").removeClass("borrow").addClass("return");
   });

   $("#refresh").on("click", function(event) {
      loadStations($("#ausborgen").prop("checked") ? 1 : -1);
   });

   if ($("#ausborgen").prop("checked")) {
      $("#ausborgen").trigger("click");
   } else {
      $("#abstellen").trigger("click");
   }

});