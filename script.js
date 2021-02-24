
google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(refreshChart);
var container = L.DomUtil.get('map');

if(container != null){
container._leaflet_id = null;
}


var tr = '';



var jsonDataChart =[];
var json_chart = {
    "OderID" : "",
    "TimeTaken": 0,
    "Priority": ""
    };  
jsonDataChart.push(json_chart);

for(var i = 0; i < 9; ++i){
    tr += '<tr><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td><td>' + "" +
                '</td></tr>';
}

var map = L.map('map',{
        minZoom: 4,
        maxZoom: 4,
        zoomControl: false
        }).setView([20.5937, 78.9629], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map); 


$('#tableContent').html(tr);

$(document).ready(function() {
    // Fetch the initial Map
    Json();
    refreshMap();
    

    // Fetch every 5 second
    setInterval(Json, 1000);
    setInterval(refreshMap, 2000);
    setInterval(refreshChart, 2500);
});

var jsonDataObject =[];
function Json(){
    jsonDataObject =[];
    $.getJSON('https://spreadsheets.google.com/feeds/list/1_j9h71_lqMXyY-bp8dA_lWZCewWWzuvgPTXJGrJ_7I8/5/public/full?alt=json', function(data) {

        //TABLE
                
        var trHTML = '';
        var length = data.feed.entry.length;
        var dispatched = 0;
        var shipped = 0;
        
        

        for(var i=0; i<length; ++i){
            if(data.feed.entry[i].gsx$orderdispatched.$t == 'Yes'){
                dispatched++
            }
            if(data.feed.entry[i].gsx$ordershipped.$t == 'Yes'){
                shipped++
            }
        }
        $('#Received').html(length);
        $('#Dispatched').html(dispatched-shipped);
        $('#Shipped').html(shipped);
        $('#Pending').html(length-dispatched);
        
        for (var i = 0; i < data.feed.entry.length; ++i) {

            var json_data = {
                "City": data.feed.entry[i].gsx$city.$t,
                "OderID" : data.feed.entry[i].gsx$orderid.$t,
                "Item" : data.feed.entry[i].gsx$item.$t,
                "Latitude": parseFloat(data.feed.entry[i].gsx$latitude.$t),
                "Longitude": parseFloat(data.feed.entry[i].gsx$longitude.$t),
                "OrderDispatched": data.feed.entry[i].gsx$orderdispatched.$t,
                "OrderShipped": data.feed.entry[i].gsx$ordershipped.$t,
                "TimeTaken": parseFloat(data.feed.entry[i].gsx$timetaken.$t),
                "Priority": data.feed.entry[i].gsx$priority.$t
            };
            jsonDataObject.push(json_data);
            
            trHTML += '<tr><td>' + data.feed.entry[i].gsx$orderid.$t + 
                          '</td><td>'  + data.feed.entry[i].gsx$orderdateandtime.$t +
                          '</td><td>' + data.feed.entry[i].gsx$item.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$priority.$t +  
                          '</td><td>'  + data.feed.entry[i].gsx$city.$t +  
                          '</td><td>' + ((data.feed.entry[i].gsx$orderdispatched.$t == "Yes") ? 'Yes' : 'No') + 
                          '</td><td>' + ((data.feed.entry[i].gsx$ordershipped.$t == "Yes") ? 'Yes' : 'No') + 
                          '</td><td>' + ((data.feed.entry[i].gsx$dispatchtime.$t != "") ? data.feed.entry[i].gsx$dispatchtime.$t : '-')+ 
                          '</td><td>' + ((data.feed.entry[i].gsx$shippingtime.$t != "") ? data.feed.entry[i].gsx$shippingtime.$t : '-') + 
                          '</td><td>' + ((data.feed.entry[i].gsx$timetaken.$t != "") ? data.feed.entry[i].gsx$timetaken.$t : '-') + 
                          '</td></tr>';
        }

        for(var i = 0; i < (9-data.feed.entry.length); ++i){
            trHTML += '<tr><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td><td>' + "" +
                      '</td></tr>';
        }

        $('#tableContent').html(trHTML);
        var trHTML = '';
        jsonDataChart=[];
        for (var i = 0; i < data.feed.entry.length; ++i) {
            var json_chart = {
              "OderID" : data.feed.entry[i].gsx$orderid.$t,
              "TimeTaken": parseFloat(data.feed.entry[i].gsx$timetaken.$t),
              "Priority": data.feed.entry[i].gsx$priority.$t
              };  
            jsonDataChart.push(json_chart);
        };

    });
}
    
function refreshMap(){

    var container = L.DomUtil.get('map');

    if(container != null){
    container._leaflet_id = null;
    }
    var map = L.map('map',{
            minZoom: 4,
            maxZoom: 4,
            zoomControl: false
            }).setView([20.5937, 78.9629], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map); 

        
        for (var j = 0; j < jsonDataObject.length; j++) {
            var color = 'red'

            if(jsonDataObject[j].OrderShipped == "Yes"){
                color = "green"
            }
            else if(jsonDataObject[j].OrderDispatched == "Yes"){
                color = "yellow"
            }

            var Icon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-'+color+'.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            var marker = L.marker(L.latLng(parseFloat(jsonDataObject[j].Latitude), parseFloat(jsonDataObject[j].Longitude)),{icon: Icon});
            marker.bindPopup(jsonDataObject[j].City, {
                    autoClose: false
            });
            map.addLayer(marker);
            marker.on('click', onClick_Marker)
            // Attach the corresponding JSON data to your marker:
            marker.myJsonData =jsonDataObject[j];
    
            function onClick_Marker(e) {
                    var marker = e.target;
                    popup = L.popup()
                    .setLatLng(marker.getLatLng())
                    .setContent("Order ID: " + marker.myJsonData.OderID + " || Item: " +   marker.myJsonData.Item)
                    .openOn(map);
                }                      

            }   
}

function refreshChart(){
    console.log(jsonDataChart);
    
    var graph_arr = [['Order ID', 'Time Taken', { role: 'style' }]];
    var bar_color = [];
      // Setting color for the coloumns of graph according to priority of items
      for(var j in jsonDataChart){
        if(jsonDataChart[j].Priority == 'HP'){
          var color =  '#FF0000';
          }
        else if(jsonDataChart[j].Priority == 'MP'){
          var color =  '#FFFF00';
          }
        else if(jsonDataChart[j].Priority == 'LP'){
          var color =  '#00FF00';
          }
        bar_color.push(color)
      }

      // Converting Json Object to JavaScript Array
      for(var j in jsonDataChart){
          graph_arr.push([jsonDataChart[j].OderID,jsonDataChart[j].TimeTaken, bar_color[j]]);
      }
      var graphArray_Final = google.visualization.arrayToDataTable(graph_arr);
    
      var data = new google.visualization.DataView(graphArray_Final); 

      var options = {
        title: 'Time Taken for items to be Shipped',
        hAxis: { title: 'Order ID'},
        vAxis: { title: 'Time Taken (s)'},
        legend: { position: "none" },
      };
      var chart = new google.visualization.ColumnChart(document.getElementById('column_chart'));
      chart.draw(data, options);	 
  }
