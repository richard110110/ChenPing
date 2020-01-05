const zomatoKey = "2a352dc74247e7f44da46d2405cd9f02";
const hotelKey = "3e6ae58f1f4304d575cb1a739147986f";
const weatherKey = "b40fcac67f4795e36979264e1d4bb3f4";


function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('searchPlace');
    var searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            alert("nothing found, please reenter a valid place");
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        var geocoder = new google.maps.Geocoder();
        var address = document.getElementById('searchPlace').value;

        geocoder.geocode({ 'address': address }, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                console.log(latitude + " " + longitude);

                listWeather(latitude, longitude);
                listRestaurant(latitude, longitude);
                listHotel(latitude, longitude);

            } else {
                alert("please reenter a valid place");
            }
        });

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            console.log(place);
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}


function convertKelvinToCelsius(kelvin) {
    if (kelvin < (0)) {
        return Math.floor(kelvin);
    } else {
        return Math.floor(kelvin - 273.15);
    }
}







function listRestaurant(latitude, longitude) {
    var zomato_url = `https://developers.zomato.com/api/v2.1/geocode?lat=${latitude}&lon=${longitude}&count=20`;

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
            showRestaurant(restaurantData);

        })

}

function showRestaurant(restaurantData) {

    var restaurantContainer = document.createElement('div');
    restaurantContainer.setAttribute("id", "localRestaurant");
    restaurantContainer.setAttribute("class", "nearbyRestaurant");

    for (let i = 0; i < restaurantData.nearby_restaurants.length; i++) {
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
                // console.log(data.featured_image);

                restaurantContainer.innerHTML += `<div id="each-Restaurant"><div class="featured-Image" style="background-image:url(${data.featured_image})">` +
                    `<div class="rating" style="background-color:#${restaurantData.nearby_restaurants[i].restaurant.user_rating.rating_color}">` +
                    `<div class="rates">${restaurantData.nearby_restaurants[i].restaurant.user_rating.aggregate_rating}</div></div>` +
                    `</div>` +
                    `<div class="restaurant-Name-Container">` +
                    `<i class="fas fa-utensils"></i>` +
                    `<div class="restaurant-Name"><a href="${restaurantData.nearby_restaurants[i].restaurant.url}">${restaurantData.nearby_restaurants[i].restaurant.name}</a></div>` +
                    `</div>` + `<div class="restaurant-Address-Container">` +
                    `<i class="fas fa-map-marker-alt"></i>` +
                    `<div class="restaurant-Address">${restaurantData.nearby_restaurants[i].restaurant.location.address}</div>` +
                    `</div>` +
                    `<div class="restaurant-Cuisine-Container">` +
                    `<div class="restaurant-Cuisine">Cuisine: ${restaurantData.nearby_restaurants[i].restaurant.cuisines}</div>` +
                    `</div>` + `<div class="restaurant-Cost-Container">` +
                    `<i>${restaurantData.nearby_restaurants[i].restaurant.currency}</i>` +
                    `<div class="restaurant-Cost">${restaurantData.nearby_restaurants[i].restaurant.average_cost_for_two}</div>` +
                    `</div>` +
                    `</div>`;

            })

        document
            .getElementById("restaurant")
            .appendChild(restaurantContainer);

    }

}

function listWeather(latitude, longitude) {
    var openweathermap_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherKey}`;
    fetch(openweathermap_url).then(function(weather) {
        return weather.json();

    }).then(function(weatherData) {
        console.log(weatherData);
        showWeather(weatherData);
    })

}

function showWeather(weatherData) {
    var i;
    for (i = 0; i < weatherData.list.length; i++) {
        if (weatherData.list[i].dt_txt.includes("15:00")) {

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

function listHotel(latitude, longitude) {
    var hotel_url = `https://engine.hotellook.com/api/v2/lookup.json?query=${latitude},${longitude}&lang=en&lookFor=hotel&limit=10&token=${hotelKey}`;
    fetch(hotel_url).then(function(weather) {
        return weather.json();

    }).then(function(hotelData) {
        console.log(hotelData);
        showHotel(hotelData.results.hotels);
    })
}




function generateEachHotelPhoto(hotelPhoto) {
    var iteratorPhoto = hotelPhoto.values();
    var imageContainer = document.createElement('div');
    imageContainer.setAttribute("class", "hotelImageShow");

    for (let eachPhoto of iteratorPhoto) {
        imageContainer.innerHTML += `<div class="hotelImageShow" style="background-image:url('${eachPhoto.url}')"></div>`;
    }
    return imageContainer.innerHTML;
}

function generateEachFacility(hotelFacility) {
    var iteratorFacility = hotelFacility.values();
    var facility = document.createElement('label');

    for (let eachFacility of iteratorFacility) {
        facility.innerHTML += `<label>${eachFacility}</label>`
    }
    return facility.innerHTML;
}

function generateStar(hotelStar) {
    var star = document.createElement('div');
    star.setAttribute("class", "hotelStar");
    for (let i = 0; i < hotelStar; i++) {
        star.innerHTML += `<i class="fas fa-star"></i>`;
    }
    return star.innerHTML;
}

function showHotel(hotelData) {
    console.log(hotelData.length);
    var hotelContainer = document.createElement('div');
    hotelContainer.setAttribute("id", "hotelList");
    hotelContainer.setAttribute("class", "hotel-info");
    // console.log(hotelData.results.hotels.length);

    for (let i = hotelData.length - 1; i < hotelData.length; i++) {
        console.log("test it");
        // console.log(hotelData.results.hotel[i].locationId);


        fetch(`https://engine.hotellook.com/api/v2/static/hotels.json?locationId=${hotelData[i].locationId}&token=${hotelKey}`).then(function(hotel) {
            return hotel.json();
        }).then(function(hotelList) {

            // generateHotelData(hotelList);
            console.log(hotelList);
            // console.log(hotelList.hotels);
            // console.log(hotelList.hotels.length);




            for (let j = 0; j < hotelList.hotels.length; j++) {
                if (hotelList.hotels[j].stars != 0 && hotelList.hotels[j].pricefrom != 0 && hotelList.hotels[j].rating != 0 && hotelList.hotels[j].photos.length > 1) {
                    console.log(hotelList.hotels[j]);
                    console.log(hotelList.hotels[j].photos);
                    var iteratorPhoto = hotelList.hotels[j].photos.values();
                    for (let eachPhoto of iteratorPhoto) {
                        console.log(eachPhoto.url);
                    }

                    console.log(hotelList.hotels[j].shortFacilities.values());

                    var iteratorFacility = hotelList.hotels[j].shortFacilities.values();
                    for (let eachFacility of iteratorFacility) {
                        console.log(eachFacility);
                    }


                    hotelContainer.innerHTML += `<div id="each-Hotel">` +
                        `<div class="hotel-Image-Container">` +
                        `<div id="scrollmenu">` +
                        // generateHotelPhoto(hotelList.hotels[j].photos) +
                        generateEachHotelPhoto(hotelList.hotels[j].photos) +






                        `</div>` +
                        `</div>` +
                        `<div class="infoContainer">` +
                        `<div class="hotelName">` +
                        `<i class="fas fa-hotel"></i>` +
                        `${hotelList.hotels[j].name.en}` +
                        `</div>` +
                        `<div class="hotelAddress">` +
                        `<i class="fas fa-map-marker-alt"></i>` +
                        `${hotelList.hotels[j].address.en}</div>` +
                        `<div class="hotelPrice">` +
                        `<i class="fas fa-dollar-sign"></i>` +
                        `${hotelList.hotels[j].pricefrom}` +
                        `</div>` +
                        `<div class="hotelCheckIn">` +
                        `<i>CheckIn: </i>` +
                        `${hotelList.hotels[j].checkIn}` +
                        `</div>` +
                        `<div class="hotelCheckOut">` +
                        `<i>CheckOut: </i>` +
                        `${hotelList.hotels[j].checkOut}` +
                        `</div>` +
                        `<div class="facilityShow">` +
                        `<label>Service:</label>` +
                        generateEachFacility(hotelList.hotels[j].shortFacilities) +
                        `</div>` +
                        `<div class="hotelStar">` +
                        `<label>Stars:</label>` +
                        generateStar(hotelList.hotels[j].stars) +
                        `</div>` +

                        `</div>` +
                        `</div>`;
                    // for (let k = 0; k < hotelList.hotels[j].photos.length; k++) {

                    //     var hotelImage = document.createElement('div');
                    //     hotelImage.setAttribute("id", "hotel-Image");
                    //     hotelImage.setAttribute("class", "hotelImageShow");

                    //     hotelImage.style.backgroundImage += `url('${hotelList.hotels[j].photos[k].url}')`;

                    //     if (document.getElementById("hotel-Image") != null) {
                    //         document.getElementById("scrollmenu").appendChild(hotelImage);
                    //     } else {
                    //         console.log(`failed: ` + document.getElementById("hotel-Image"));
                    //     }

                    //     console.log(hotelImage);

                    //     hotelContainer.innerHTML += `<div id="each-Hotel">` +
                    //         `<div class="hotel-Image-Container">` +
                    //         `<div id="scrollmenu">` +
                    //         // generateHotelPhoto(hotelList.hotels[j].photos) +

                    //         `<div class="hotelImageShow" style="background-image:url('${hotelList.hotels[j].photos[k].url}')"></div>` +



                    //         `</div>` +
                    //         `</div>` +
                    //         `</div>`;
                    //     console.log(`this is hotel id:  ${j} and has ${k} photos`);

                    // }

                    // hotelContainer.innerHTML += `<div id="each-Hotel">` +
                    //     `<div class="hotel-Image-Container">` +
                    //     `<div id="scrollmenu">` +
                    //     generateHotelPhoto(hotelList.hotels[j].photos) +

                    //     `<div class="hotelImageShow" style="background-image:url('${hotelList.hotels[j].photos[k].url}')"></div>` +



                    //     `</div>` +
                    //     `</div>` +
                    //     `</div>`;

                    // for (let k = 0; k < hotelList.hotels[j].photos.length; k++) {
                    //     hotelContainer.innerHTML += `<div id="each-Hotel">` +
                    //         `<div class="hotel-Image-Container">` +
                    //         `<div id="scrollmenu">` +
                    //         // generateHotelPhoto(hotelList.hotels[j].photos) +

                    //         `<div class="hotelImageShow" style="background-image:url('${hotelList.hotels[j].photos[k].url}')"></div>` +



                    //         `</div>` +
                    //         `</div>` +
                    //         `</div>`;
                    // }


                    // hotelContainer.innerHTML += `<div id="each-Hotel">` +
                    //     `<div class="hotel-Image-Container">` +
                    //     `<div id="scrollmenu">` +
                    //     generateHotelPhoto(hotelList.hotels[j].photos) +




                    //     `</div>` +
                    //     `</div>` +
                    //     `</div>`;




                }
            }
            document.getElementById("localHotel").appendChild(hotelContainer);

        })

    }

}