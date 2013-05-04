$(document).ready(function() {

   if (navigator.mozApps) {
      var checkIfInstalled = navigator.mozApps.getSelf();
      checkIfInstalled.onsuccess = function () {
        if (checkIfInstalled.result) {
            $("#install").remove();
        }
      };
   } else {
      $("#install").remove();
   }

   var map = L.map("map").setView([48.20946, 16.371174], 13);
   var markerLayer;

   L.tileLayer("http://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Station data <a href="http://citybik.es">CityBik.es</a>',
      maxZoom: 18
   }).addTo(map);

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
         url: "http://api.citybik.es/wien.json?callback=getBikes",
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

            if (station.status != "aktiv") {
               icon = redIcon;
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
      // Geolocation
      navigator.geolocation.getCurrentPosition(function (position) {
         map.setView([position.coords.latitude, position.coords.longitude], 15)
      },
      function (position) {
         alert("ohhh noooo!");
      });
   });

   $("#ausborgen").on("click", function(event) {
      loadStations(1);
      $("#map").addClass("borrow").removeClass("return");
   });

   $("#abstellen").on("click", function(event) {
      loadStations(-1);
      $("#map").removeClass("borrow").addClass("return");
   });

   if ($("#ausborgen").prop("checked")) {
      $("#ausborgen").trigger("click");
   } else {
      $("#abstellen").trigger("click");
   }

});