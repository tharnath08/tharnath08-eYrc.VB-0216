$(document).ready(function() {
    refreshContent();


    setInterval(refreshContent, 2000);
});


google.charts.load("current", {packages:['corechart']});
google.charts.setOnLoadCallback(refreshContent);


function refreshContent(){

    var jsonDataChart =[];
    var graph_arr = [['Order ID', 'Time Taken', { role: 'style' }]];
    var bar_color = [];

    var container = L.DomUtil.get('map');

    if(container != null){
    container._leaflet_id = null;
    }
        
    var map = L.map('map').setView([20.5937, 78.9629], 4);
    var jsonDataObject =[];
    
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
            $('#Dispatched').html(dispatched);
            $('#Shipped').html(shipped);
            $('#Pending').html(length-dispatched);

            for (var i = 0; i < data.feed.entry.length; ++i) {
                var myData_map, myData_order;

                trHTML += '<tr><td>' + data.feed.entry[i].gsx$orderid.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$item.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$priority.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$quantity.$t + 
                          '</td><td>'  + data.feed.entry[i].gsx$city.$t + 
                          '</td><td>'  + data.feed.entry[i].gsx$longitude.$t +
                          '</td><td>'  + data.feed.entry[i].gsx$latitude.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$orderdispatched.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$ordershipped.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$dispatchtime.$t + 
                          '</td><td>'  + data.feed.entry[i].gsx$ordertime.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$shippingtime.$t + 
                          '</td><td>' + data.feed.entry[i].gsx$timetaken.$t + 
                          '</td></tr>';

            }

            $('#tableContent').html(trHTML);
            var trHTML = '';


            //MAP

            for (var i = 0; i < data.feed.entry.length; ++i) {

                var json_data = {
                    "City": data.feed.entry[i].gsx$city.$t,
                    "OderID" : data.feed.entry[i].gsx$orderid.$t,
                    "Item" : data.feed.entry[i].gsx$item.$t,
                    "Latitude": parseFloat(data.feed.entry[i].gsx$latitude.$t),
                    "Longitude": parseFloat(data.feed.entry[i].gsx$longitude.$t)
                };
                jsonDataObject.push(json_data);
                    
                for (var j = 0; j < jsonDataObject.length; j++) {
                    var marker = L.marker(L.latLng(parseFloat(jsonDataObject[j].Latitude), parseFloat(jsonDataObject[j].Longitude)));
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
        
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map); 
                        
        
                    }
                }

            ///CHART
            for (var i = 0; i < data.feed.entry.length; ++i) {
                var json_data = {
                    "OderID" : data.feed.entry[i].gsx$orderid.$t,
                    "TimeTaken": parseFloat(data.feed.entry[i].gsx$timetaken.$t),
                    "Priority": data.feed.entry[i].gsx$priority.$t
                    };
                    jsonDataChart.push(json_data);
                };
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

            



        });	 
}	