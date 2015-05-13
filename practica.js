$(document).ready(function(){
    var map = ""
    var nimages = 20;
    var timeoutImages = "";
    var time = 10000;

    newGame();

    function newGame() {
        resetMap();
        resetImages();
        getPhotos("madrid");
    }

    function resetMap() {
        if (map != "") {
            map.remove();
        }
        map = L.map('map').setView([45, 11], 2);
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    function getPhotos(tag) {
        $.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?tags=' +
        tag + '&tagmode=any&format=json&jsoncallback=?', function(data){
            var item = data.items.splice(0,nimages);
            var i = 0;
            $("#image").attr('src',item[i].media.m);
            timeoutImages = setInterval(function(){     // Cambia
                i++;
                $("#image").attr('src',item[i % nimages].media.m);
            }, time);
        });
    }

    function resetImages(){
        if (timeoutImages != "") {
            clearTimeout(timeoutImages);
            timeoutImages = "";
        }
    }

    $("#easy").click(function(){
        time = 10000;
        newGame();
    });

    $("#medium").click(function(){
        time = 5000;
        newGame();
    });

    $("#hard").click(function(){
        time = 1000;
        newGame();
    });

    $("#accept").click(function(){
        resetImages();
    });
});
