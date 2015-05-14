$(document).ready(function() {
    var map = "";
    var marker = "";
    var correctMarker = "";
    var nimages = 20;
    var timeoutImages = "";
    var time = 10000;
    var imgShown = 0;
    var coordinates = "";
    var maxDistance = 15409;
    var items = [];
    var city = "";
    var latitude = 0;
    var longitude = 0;

    
    getData();
    newGame();

    function getData() {
        $.ajax({ 
            url: "capitales.json", 
            dataType: 'json',  
            async: false, 
            success: function(data){ 
                city = data.city[0].name;
                latitude = data.city[0].lat;
                longitude = data.city[0].lon;
            } 
        });
    }

    function newGame() {
        $("#next").hide();
        $("#score").html(0);
        $("#distance").html(0);
        resetMap();
        resetImages();
        getPhotos(city);
    }

    function resetMap() {
        if (map != "") {
            map.remove();
        }
        map = L.map('map').setView([45, 11], 2);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        marker = L.marker([0,0],{opacity:0});
        marker.addTo(map);
        map.on('click', function(pos) {
            marker.setLatLng(pos.latlng); 
            marker.setOpacity(1);
        });
        coordinates = L.latLng(latitude,longitude);
        correctMarker = L.marker([latitude,longitude],{opacity:0});
        correctMarker.addTo(map);
    }

    function drawLine() {
        var line = [];
        line.push(marker.getLatLng());
        line.push(correctMarker.getLatLng());
        var polyline = L.polyline(line, {color: '#222'}).addTo(map);
    }

    function getPhotos(tag) {
        $.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?tags=' +
        tag + '&tagmode=any&format=json&jsoncallback=?', function(data){
            var item = data.items.splice(0,nimages);
            $("#image").attr('src',item[imgShown].media.m);
            timeoutImages = setInterval(function(){     // Cambia
                imgShown++;
                $("#image").attr('src',item[imgShown % nimages].media.m);
            }, time);
        });
    }

    function resetImages() {
        if (timeoutImages != "") {
            clearTimeout(timeoutImages);
            timeoutImages = "";
            imgShown = 0;
        }
    }

    function getDistance() {
        return coordinates.distanceTo(marker.getLatLng())/1000;
    }

    function getScore() {
        if (imgShown >= 20)
            imgShown = 19;
        return Math.floor( ( (maxDistance*nimages) - (imgShown+1)*getDistance() ) * 0.0032 );
    }

    $("#easy").click(function(){
        $("#easy").hide();
        $("#medium").show();
        $("#hard").show();
        time = 10000;
        newGame();
    });

    $("#medium").click(function(){
        $("#easy").show();
        $("#medium").hide();
        $("#hard").show();
        time = 5000;
        newGame();
    });

    $("#hard").click(function(){
        $("#easy").show();
        $("#medium").show();
        $("#hard").hide();
        time = 1000;
        newGame();
    });

    $("#accept").click(function(){
        if (marker.getLatLng().lat != 0 || marker.getLatLng().lng != 0) {
            correctMarker.setOpacity(1);
            drawLine();
            $("#score").html(getScore());
            $("#distance").html(Math.floor(getDistance()) + " Km");
            resetImages();
            $("#next").show();
        }
    });

    $("#next").click(function(){
        newGame();
    });
});
