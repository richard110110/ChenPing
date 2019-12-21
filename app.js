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
                                .Marker({ position: latlng, map: map });
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
            showRestaurant(restaurantData);

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

function validateImage(url, id) {

    if (url == "") {
        fetch(`https://developers.zomato.com/api/v2.1/restaurant?res_id=${id}`, {
                method: "GET",
                headers: {
                    "user-key": zomatoKey
                }

            }).then(function(restaurant_Detail) {
                return restaurant_Detail.json();

            })
            .then(function(data) {
                console.log(data.featured_image);

            })

    } else {
        return url;
    }
}

function showWeather(weatherData) {


    var i;
    for (i = 0; i < weatherData.list.length; i++) {
        if (weatherData.list[i].dt_txt.includes("12:00")) {

            var weatherContainer = document.createElement('div');
            weatherContainer.setAttribute("id", "daily-weather");

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

function showRestaurant(restaurantData) {
    console.log(restaurantData);
    console.log(restaurantData.nearby_restaurants);
    console.log(restaurantData.nearby_restaurants.length);


    var restaurantContainer = document.createElement('div');
    restaurantContainer.setAttribute("id", "localRestaurant");
    restaurantContainer.setAttribute("class", "nearbyRestaurant");


    for (let i = 0; i < restaurantData.nearby_restaurants.length; i++) {




        console.log(restaurantData.nearby_restaurants[i].restaurant.name);
        console.log(restaurantData.nearby_restaurants[i].restaurant.location.address);
        console.log(restaurantData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating);
        console.log(restaurantData.nearby_restaurants[i].restaurant.user_rating.rating_color);
        console.log(restaurantData.nearby_restaurants[i].restaurant.featured_image);

        // validateImage(restaurantData.nearby_restaurants[i].restaurant.featured_image, restaurantData.nearby_restaurants[i].restaurant.id);

        // var elements = document.getElementById("each-Restaurant");


        fetch(`https://developers.zomato.com/api/v2.1/restaurant?res_id=${restaurantData.nearby_restaurants[i].restaurant.id}`, {
                method: "GET",
                headers: {
                    "user-key": zomatoKey
                }

            }).then(function(restaurant_Detail) {
                return restaurant_Detail.json();

            })
            .then(function(data) {
                // console.log(data);
                console.log(data.featured_image);

                restaurantContainer.innerHTML += `<div id="each-Restaurant"><div class="featured-Image" style="background-image:url(${data.featured_image})">` +
                    `<div class="rating" style="background-color:#${restaurantData.nearby_restaurants[i].restaurant.user_rating.rating_color}">` +
                    `<div class="rates">${restaurantData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating}</div></div>` +
                    `</div>` +
                    `<div class="restaurant-Name-Container">` +
                    `<i class="fas fa-utensils"></i>` +
                    `<div class="restaurant-Name"><a href="${restaurantData.nearby_restaurants[i].restaurant.url}">${restaurantData.nearby_restaurants[i].restaurant.name}</a></div>` +
                    `</div>` +

                    `<div class="restaurant-Address-Container">` +
                    `<i class="fas fa-map-marker-alt"></i>` +
                    `<div class="restaurant-Address">${restaurantData.nearby_restaurants[i].restaurant.location.address}</div>` +
                    `</div>` +

                    `<div class="restaurant-Cuisine-Container">` +
                    `<div class="restaurant-Cuisine">Cuisine: ${restaurantData.nearby_restaurants[i].restaurant.cuisines}</div>` +
                    `</div>` +


                    `<div class="restaurant-Cost-Container">` +
                    `<i class="fas fa-dollar-sign"></i>` +
                    `<div class="restaurant-Cost">${restaurantData.nearby_restaurants[i].restaurant.average_cost_for_two}</div>` +
                    `</div>` +

                    `</div>`;





            })





        document
            .getElementById("restaurant")
            .appendChild(restaurantContainer);




    }
}



function showHotel() {}