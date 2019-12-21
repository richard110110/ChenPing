const zomatoKey = "2a352dc74247e7f44da46d2405cd9f02";
const weatherKey = "b40fcac67f4795e36979264e1d4bb3f4";
const googleKey = "AIzaSyBPUUiNkS8IVOhyqfGNb-3tt9XLspxaX3Y";
const hotelKey = "3e6ae58f1f4304d575cb1a739147986f";
const airPollution = "0f14d8c1525148f2f5e51464ccbf5ed4e743e8d0";

// if (navigator.geolocation) {     navigator         .geolocation
// .getCurrentPosition(showPosition); }

let pos;
let bounds;
let service;
let currentWindow;
let panel;
let map;
let infowindow;

function initMap() {

    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator
            .geolocation
            .getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map = new google
                    .maps
                    .Map(document.getElementById('map'), {
                        center: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        zoom: 12
                    });

                var trafficLayer = new google
                    .maps
                    .TrafficLayer();
                trafficLayer.setMap(map);

                var transitLayer = new google
                    .maps
                    .TransitLayer();
                transitLayer.setMap(map);
                var address;
                var geocoder = new google.maps.Geocoder;
                var latlng = {
                    lat: parseFloat(position.coords.latitude),
                    lng: parseFloat(position.coords.longitude)
                };

                var currentWindow = new google
                    .maps
                    .InfoWindow();

                geocoder.geocode({
                    'location': latlng
                }, function(results, status) {
                    console.log(status);

                    if (status == 'OK') {
                        if (results[0]) {
                            var marker = new google
                                .maps
                                .Marker({
                                    position: latlng,
                                    map: map
                                });
                            currentWindow.setContent(results[0].formatted_address);
                            currentWindow.open(map, marker);
                        } else {
                            currentWindow.setContent("no address found");
                        }
                    }

                })

                showPosition(position);

                var service = new google
                    .maps
                    .places
                    .PlacesService(map);
                service.nearbySearch({
                    location: pos,
                    radius: 1000,
                    type: ['hotel']
                }, function(results, status, pagination) {
                    if (status !== 'OK')
                        return;
                    console.log(results);
                    console.log(results[0].photos[0].getUrl);

                });

                // infoWindow.setPosition(pos); infoWindow.setContent('Location found.');
                // infoWindow.open(map);
                map.setCenter(pos);

            }, function() {
                handleLocationError(true, infoWindow);
            });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow);
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function showPosition(position) {
    var zomato_url = `https://developers.zomato.com/api/v2.1/geocode?lat=${position.coords.latitude}&lon=${position.coords.longitude}&count=20`;

    var openweathermap_url;

    var googlePlace_url;

    console.log(zomato_url);

    fetch(zomato_url, {
            method: "GET",
            headers: {
                "user-key": zomatoKey
            }

        }).then(function(restaurant) {
            return restaurant.json();

        })
        .then(function(restaurantData) {
            console.log(restaurantData);
            console.log(restaurantData.location.city_name);
            console.log(restaurantData.location.latitude);
            console.log(restaurantData.location.longitude);
            console.log(restaurantData.nearby_restaurants);

            openweathermap_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${restaurantData.location.latitude}&lon=${restaurantData.location.longitude}&appid=${weatherKey}`;
            fetch(openweathermap_url).then(function(weather) {
                    return weather.json();

                })
                .then(function(weatherData) {

                    showWeather(weatherData);

                })
            fetch(`http://engine.hotellook.com/api/v2/lookup.json?query=${restaurantData.location.latitude},${restaurantData.location.longitude}&lang=en&lookFor=hotel&limit=10&token=${hotelKey}`).then(function(hotel) {
                    return hotel.json();
                })
                .then(function(hotelData) {
                    console.log(hotelData.results);
                })

        })
}

function convertKelvinToCelsius(kelvin) {
    if (kelvin < (0)) {
        return Math.floor(kelvin);
    } else {
        return Math.floor(kelvin - 273.15);
    }
}

function showWeather(weatherData) {
    console.log(weatherData.list);
    console.log(weatherData.list.length);

    var i;
    for (i = 0; i < weatherData.list.length; i++) {
        if (weatherData.list[i].dt_txt.includes("12:00")) {

            var weatherContainer = document.createElement('div');
            weatherContainer.setAttribute("id", "daily-weather");

            console.log(weatherData.list[i]);

            console.log(weatherData.list[i].dt_txt.split(" ")[0]);
            console.log(convertKelvinToCelsius(weatherData.list[i].main.temp));
            console.log(weatherData.list[i].weather[0].description);

            console.log(weatherData.list[i].weather[0].icon);
            console.log(weatherData.list[i].wind.speed);

            weatherContainer.innerHTML = `<div class="weather-icon" style="background-image:url(http://openweathermap.org/img/wn/${weatherData.list[i].weather[0].icon}@2x.png)"></div>` + `<div class="weather-Description">${weatherData.list[i].weather[0].description}</div>` + `<div class="temperature-Data">${convertKelvinToCelsius(weatherData.list[i].main.temp)}°</div>` + `<div class="wind-Container">` + `<i class="fas fa-wind"></i>` + `<div class="wind-Info">${weatherData.list[i].wind.speed}</div>` + `</div>` + `<div class="date-Container">` + `<i class="fas fa-calendar-alt"></i>` + `<div class="date-Info">${weatherData
                .list[i]
                .dt_txt
                .split(" ")[0]}</div>` + `</div>`;

            document
                .getElementById("localWeather")
                .appendChild(weatherContainer);

        }
    }

}

function showRestaurant(restaurantData) {}

function showAirPollution() {}

function showFlightData() {}