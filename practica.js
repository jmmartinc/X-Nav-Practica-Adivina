$(document).ready(function() {
    var time = 10000;
    var imgShown = 0;
    var coordinates = "";
    var point = "";
    var latitude = 0;
    var longitude = 0;
	var game = "Capitales";
	var score = 0;
	
    var map = null;
    var marker = null;
    var correctMarker = null;
    var maxPhotos = 20;
    var timeoutImages = null;
    var maxDistance = 15409;
	var jsonData = null;
	var historyID = 0;
	var firstRound = true;

    newGame(game);
	
    function newGame(g) {
		if (!firstRound)
			addHistoryEntry();
		resetResult();
		firstRound = true;
		game = g;
		if (jsonData == null){
			getData(game);
		}
		newRound();
		//printHistory();
    }
	
	function newRound() {
		$("#solution").html("");
        $("#distance").html("");
        $("#next").hide();
		getRandomPoint();
        printNewMap();
        printPhotos(point);
	}

    function getData(game) {
        $.ajax({ 
            url: "juegos/"+normalize(game)+".json", 
            dataType: 'json',  
            async: false, 
            success: function(data){
                jsonData = data;
				console.log(jsonData);
            } 
        });
    }

	function getRandomPoint() {
		n = Math.floor(Math.random() * jsonData.features.length);
		point = jsonData.features[n].properties.name;
		latitude = jsonData.features[n].geometry.coordinates[1];
		longitude = jsonData.features[n].geometry.coordinates[0];
	}
	
	function resetResult() {
		score = 0;
		distance = 0;
        $("#score").html(0);
        $("#distance").html(0);
	}

    function printNewMap() {
        if (map != null) {
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

    function printPhotos(tag) {
        resetPhotos();
        $.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?tags=' +
        tag + '&tagmode=any&format=json&jsoncallback=?', function(data){
            var item = data.items.splice(0,maxPhotos);
            $("#image").attr('src',item[imgShown].media.m);
            timeoutImages = setInterval(function(){     // Cambia
                imgShown++;
                $("#image").attr('src',item[imgShown % maxPhotos].media.m);
            }, time);
        });
    }

    function resetPhotos() {
        if (timeoutImages != null) {
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
		s = 1000 - imgShown*50 - Math.floor(1000*(getDistance()/maxDistance))
		if (s < 0)
			return 0;
        else
			return s;
    }
	
	function addHistoryEntry(){
		data={date: new Date(),
			game: game,
			name: point,
			score: score
		}
		history.pushState(data, "state", location.href);
		text= '<a id="'+historyID+'" class="list-group-item his">'+" Juego: "+data.game +'</br> Puntuación: '+data.score+'</br> Hora: '+data.date.getHours()+":"+data.date.getMinutes()+":"+data.date.getSeconds()+'</a>'
		$("#history").append(text);
		$("#"+historyID).click(function(){
			var id = $(this).attr("id"); 
			goHistory(id);
		});
		historyID ++;
	}
	
	function goHistory(id){
		var go = id - historyID;
		if(go != 0){
			//addHistoryEntry();
			//historyID = go;
			//replace();
			history.go(go);
		}else{
			alert("Ya estas en ese juego");
		}
	}
	
	$('#games li a').on('click', function(){
		jsonData = null;
		newGame($(this).text());
	});

    $("#easy").click(function(){
        $("#easy").hide();
        $("#medium").show();
        $("#hard").show();
        time = 10000;
        newGame(game);
    });

    $("#medium").click(function(){
        $("#easy").show();
        $("#medium").hide();
        $("#hard").show();
        time = 5000;
        newGame(game);
    });

    $("#hard").click(function(){
        $("#easy").show();
        $("#medium").show();
        $("#hard").hide();
        time = 1000;
        newGame(game);
    });

    $("#accept").click(function(){
        if (marker.getLatLng().lat != 0 || marker.getLatLng().lng != 0) {
            correctMarker.setOpacity(1);
            drawLine();
			score += getScore();
            $("#solution").html(point);
            $("#score").html(score);
            $("#distance").html(Math.floor(getDistance()) + " Km");
            resetPhotos();
            $("#next").show();
			if (firstRound)
				firstRound = false;
			//addHistoryEntry();
        }
    });

    $("#next").click(function(){
        newRound();
    });
	
	function normalize(str) {
		var from = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
		to = "abcdefghijklmnnopqrstuvwxyzaaaaaeeeeiiiioooouuuuaaaaaeeeeiiiioooouuuunncc",
		mapping = {};

		for(var i = 0, j = from.length; i < j; i++ )
			mapping[ from.charAt( i ) ] = to.charAt( i );

		var ret = [];
		for( var i = 0, j = str.length; i < j; i++ ) {
			var c = str.charAt( i );
			if( mapping.hasOwnProperty( str.charAt( i ) ) )
				ret.push( mapping[ c ] );
			else
				ret.push( c );
		}      
		return ret.join( '' );

	};
});
