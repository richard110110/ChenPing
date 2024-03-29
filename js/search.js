const zomatoKey = "2a352dc74247e7f44da46d2405cd9f02";
const hotelKey = "3e6ae58f1f4304d575cb1a739147986f";
const weatherKey = "b40fcac67f4795e36979264e1d4bb3f4";

const newsKey = "9ec9cdd0f4bf4ca1b3e00913ee10f819";

var date = new Date();
var googleDate = date.toISOString().split("T");

let restaurantListener = 0;

var entity_id;
var geoLatitude;
var geoLongitude;

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
                listNearby(map, latitude, longitude);

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

            if (restaurantListener == 1) {
                console.log("nearby resyaurant ready");
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



var restaurantDataAll = [];




function listRestaurant(latitude, longitude) {
    restaurantDataAll = [];
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
            if (restaurantData.code == 400) {
                console.log("null restaurants");
                restaurantShow();
            } else {
                console.log(restaurantData.location.entity_id);
                showCityRestaurant(restaurantData.location.entity_id, latitude, longitude);
                entity_id = restaurantData.location.entity_id;
                geoLatitude = latitude;
                geoLongitude = longitude;

                // showCity2Restaurant(restaurantData.location.entity_id, latitude, longitude);

                // showRestaurant(restaurantData);

            }

        })



}










function showCityRestaurant(entity_id, latitude, longitude) {
    var zomato_url = `https://developers.zomato.com/api/v2.1/search?entity_id=${entity_id}&start=0&count=20&lat=${latitude}&lon=${longitude}&radius=2000`;

    var zomato2_url = `https://developers.zomato.com/api/v2.1/search?entity_id=${entity_id}&start=21&count=20&lat=${latitude}&lon=${longitude}&radius=2000`;

    var zomato3_url = `https://developers.zomato.com/api/v2.1/search?entity_id=${entity_id}&start=41&count=20&lat=${latitude}&lon=${longitude}&radius=2000`;




    fetch(zomato_url, {
            method: "GET",
            headers: {
                "user-key": zomatoKey
            }
        }).then(function(restaurant) {
            return restaurant.json();
        })
        .then(function(restaurantData) {
            for (let i = 0; i < restaurantData.restaurants.length; i++) {
                restaurantDataAll.push(restaurantData.restaurants[i]);
            }
            console.log(zomato_url);
            console.log(restaurantData.restaurants);
            console.log(restaurantData.results_found);
            console.log(restaurantDataAll);
            showEachRestaurant(restaurantDataAll);

        })
        // console.log(restaurantDataAll);

    return restaurantDataAll;
}
// console.log(restaurantDataAll);

function restaurantShow() {
    var input = document.getElementById('searchPlace');
    var searchBox = new google.maps.places.SearchBox(input);



    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            alert("nothing found, please reenter a valid place");
            return;
        }


        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            if (restaurantListener == 1) {
                console.log("nearby resyaurant ready");
            }
            console.log(place);


            // Create a marker for each place.


            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
    });

}

function showHighlights(hightlightData) {

}



function showEachRestaurant(restaurantData) {
    var restaurantContainer = document.getElementById("localRestaurant");

    document.getElementById("localRestaurant").innerHTML = "";


    restaurantData.map(eachRestaurant => {

        restaurantContainer.innerHTML +=
            `<div id="each-Restaurant"><div class="featured-Image" style="background-image:url(${eachRestaurant.restaurant.featured_image})">` +
            `<div class="rating" style="background-color:#${eachRestaurant.restaurant.user_rating.rating_color}">` +
            `<div class="rates">${eachRestaurant.restaurant.user_rating.aggregate_rating}</div>` +
            `</div>` +
            `</div>` +
            `<div class="restaurant-Name-Container">` +
            `<i class="fas fa-utensils"></i>` +
            `<div class="restaurant-Name"><a href="${eachRestaurant.restaurant.url}">${eachRestaurant.restaurant.name}</a></div>` +
            `</div>` +
            `<div class="restaurant-Address-Container">` +
            `<i class="fas fa-map-marker-alt"></i>` +
            `<div class="restaurant-Address">` +
            `${eachRestaurant.restaurant.location.address}` +
            `</div>` +
            `</div>` +
            `<div class="restaurant-Cuisine-Container">` +
            `<div class="restaurant-Cuisine">Cuisine: ${eachRestaurant.restaurant.cuisines}</div>` +
            `</div>` + `<div class="restaurant-Cost-Container">` +
            `<i>${eachRestaurant.restaurant.currency}</i>` +
            `<div class="restaurant-Cost">${eachRestaurant.restaurant.average_cost_for_two}</div>` +
            `</div>` +
            `<div class="openingHours-Container">` +
            `<i class="fas fa-clock"></i>` +
            `<div class="restaurant-OpeningHours">` +
            `${eachRestaurant.restaurant.timings}` +
            `</div>` +
            `</div>` +
            `<ul class="hightlightsTag-Container">` +
            generateHighlights(eachRestaurant.restaurant.highlights) +
            `</ul>` +
            `</div>`;

        document
            .getElementById("restaurant")
            .appendChild(restaurantContainer);


    })

    //document.getElementById("ByIdBtn").style.background = "#3DC9A0";

    // for (let i = 0; i < restaurantData.length; i++) {
    //     // console.log(restaurantData.restaurants[i]);
    //     // console.log(restaurantData.restaurants[i].restaurant.cuisines);



    // }
}

function showAllData() {
    var restaurantContainer = document.getElementById("localRestaurant");

    document.getElementById("localRestaurant").innerHTML = "";


    restaurantDataAll.map(eachRestaurant => {

        restaurantContainer.innerHTML +=
            `<div id="each-Restaurant"><div class="featured-Image" style="background-image:url(${eachRestaurant.restaurant.featured_image})">` +
            `<div class="rating" style="background-color:#${eachRestaurant.restaurant.user_rating.rating_color}">` +
            `<div class="rates">${eachRestaurant.restaurant.user_rating.aggregate_rating}</div>` +
            `</div>` +
            `</div>` +
            `<div class="restaurant-Name-Container">` +
            `<i class="fas fa-utensils"></i>` +
            `<div class="restaurant-Name"><a href="${eachRestaurant.restaurant.url}">${eachRestaurant.restaurant.name}</a></div>` +
            `</div>` +
            `<div class="restaurant-Address-Container">` +
            `<i class="fas fa-map-marker-alt"></i>` +
            `<div class="restaurant-Address">` +
            `${eachRestaurant.restaurant.location.address}` +
            `</div>` +
            `</div>` +
            `<div class="restaurant-Cuisine-Container">` +
            `<div class="restaurant-Cuisine">Cuisine: ${eachRestaurant.restaurant.cuisines}</div>` +
            `</div>` + `<div class="restaurant-Cost-Container">` +
            `<i>${eachRestaurant.restaurant.currency}</i>` +
            `<div class="restaurant-Cost">${eachRestaurant.restaurant.average_cost_for_two}</div>` +
            `</div>` +
            `<div class="openingHours-Container">` +
            `<i class="fas fa-clock"></i>` +
            `<div class="restaurant-OpeningHours">` +
            `${eachRestaurant.restaurant.timings}` +
            `</div>` +
            `</div>` +
            `<ul class="hightlightsTag-Container">` +
            generateHighlights(eachRestaurant.restaurant.highlights) +
            `</ul>` +
            `<div class="restaurant-Image-Container">` +
            `<div class="scrollmenu">` +
            generateRestaurantPhoto(eachRestaurant.restaurant.photos) +
            `</div>` +
            `</div>` +
            `</div>`;

        document
            .getElementById("restaurant")
            .appendChild(restaurantContainer);


    })

    // document.getElementById("ByIdBtn").style.background = "#3DC9A0";

}




//根据每个数组里的不同选项进行排序的方程（可应用于任何object类型的数组）
function sortByItem(itemName) {
    return function(object1, object2) {
        var value1 = object1["restaurant"][itemName];
        console.log(value1);
        var value2 = object2["restaurant"][itemName];
        console.log(value2);
        if (value1 > value2) {
            return 1;
        } else if (value1 == value2) {
            return 0;
        } else {
            return -1;
        }
    }
}

function sortByRating(itemName) {
    return function(object1, object2) {
        var value1 = object1["restaurant"]["user_rating"][itemName];
        console.log(value1);
        var value2 = object2["restaurant"]["user_rating"][itemName];
        console.log(value2);
        if (value1 > value2) {
            return 1;
        } else if (value1 == value2) {
            return 0;
        } else {
            return -1;
        }
    }
}


function sortRestaurantByItem(item) {
    console.log(item);
    document.getElementById("localRestaurant").innerHTML = "";

    restaurantDataAll.sort(sortByItem(item)); //js 自带排序方程
    console.log(restaurantDataAll);
    showEachRestaurant(restaurantDataAll);
}

function sortRestaurantByRating(item) {
    console.log(item);
    document.getElementById("localRestaurant").innerHTML = "";

    restaurantDataAll.sort(sortByRating(item)); //js 自带排序方程
    console.log(restaurantDataAll);
    showEachRestaurant(restaurantDataAll);
}


document.getElementById('ByNameBtn').addEventListener('click', function() {
    console.log("clicked");

    sortRestaurantByItem('name');
    document.getElementById("ByPriceBtn").style.background = "#f85a06";
    document.getElementById("ByRateBtn").style.background = "#f85a06";
    document.getElementById("ByNameBtn").style.background = "#3DC9A0";





})

document.getElementById('ByPriceBtn').addEventListener('click', function() {
    console.log("clicked");

    sortRestaurantByItem('average_cost_for_two');
    document.getElementById("ByPriceBtn").style.background = "#3DC9A0";
    document.getElementById("ByRateBtn").style.background = "#f85a06";
    document.getElementById("ByNameBtn").style.background = "#f85a06";



})


document.getElementById('ByRateBtn').addEventListener('click', function() {
    console.log("clicked");

    sortRestaurantByRating("aggregate_rating");
    document.getElementById("ByPriceBtn").style.background = "#f85a06";
    document.getElementById("ByRateBtn").style.background = "#3DC9A0";
    document.getElementById("ByNameBtn").style.background = "#f85a06";



})



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
    document.getElementById("localWeather").innerHTML = "";
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


function generateHighlights(highlights) {
    var iteratorHighlights = highlights.values();
    var tagContainer = document.createElement('li');
    tagContainer.setAttribute("class", "highlightTag");

    for (let each of iteratorHighlights) {
        tagContainer.innerHTML += `<li><a href="#" class="highlightTag">${each}</a></li>`;
    }

    return tagContainer.innerHTML;


}

function generateRestaurantPhoto(restaurantPhoto) {
    var iteratorPhoto = restaurantPhoto.values();
    // console.log(iteratorPhoto);
    // console.log(restaurantPhoto.length);
    var imageContainer = document.createElement('div');
    imageContainer.setAttribute("class", "restaurantImageShow");
    for (let eachPhoto of iteratorPhoto) {
        // console.log(eachPhoto.photo.thumb_url);
        imageContainer.innerHTML += `<div class="restaurantImageShow" style="background-image:url('${eachPhoto.photo.thumb_url}')"></div>`;

    }
    return imageContainer.innerHTML;

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
    var tagContainer = document.createElement('li');
    tagContainer.setAttribute("class", "highlightTag");

    for (let eachFacility of iteratorFacility) {
        tagContainer.innerHTML += `<li><a href="#" class="highlightTag">${eachFacility}</a></li>`;;
    }
    return tagContainer.innerHTML;
}

function generateStar(hotelStar) {
    var star = document.createElement('div');
    star.setAttribute("class", "hotelStar");
    for (let i = 0; i < hotelStar; i++) {
        star.innerHTML += `<i class="fas fa-star"></i>`;
    }
    return star.innerHTML;
}

var hotelDataAll = [];

function listHotel(latitude, longitude) {
    var hotel_url = `https://engine.hotellook.com/api/v2/lookup.json?query=${latitude},${longitude}&lang=en&lookFor=hotel&limit=10&token=${hotelKey}`;
    fetch(hotel_url).then(function(weather) {
        return weather.json();

    }).then(function(hotelData) {
        console.log(hotelData);
        console.log(hotelData.results.hotels);
        for (let i = hotelData.results.hotels.length - 1; i < hotelData.results.hotels.length; i++) {
            fetch(`https://engine.hotellook.com/api/v2/static/hotels.json?locationId=${hotelData.results.hotels[i].locationId}&token=${hotelKey}`).then(function(hotel) {
                return hotel.json();
            }).then(function(hotelList) {
                for (let j = 0; j < hotelList.hotels.length; j++) {
                    if (hotelList.hotels[j].stars != 0 && hotelList.hotels[j].pricefrom != 0 && hotelList.hotels[j].rating != 0 && hotelList.hotels[j].photos.length > 1) {
                        //  console.log(hotelList.hotels[j]);
                        hotelDataAll.push(hotelList.hotels[j]);
                    }
                }
                console.log(hotelDataAll);
                showHotel(hotelDataAll);

            })
        }


        console.log(hotelDataAll.length);


    })
    return hotelDataAll;
}

function sortHotelByItem(itemName) {
    return function(object1, object2) {
        var value1 = object1[itemName];
        console.log(value1);
        var value2 = object2[itemName];
        console.log(value2);
        if (value1 > value2) {
            return 1;
        } else if (value1 == value2) {
            return 0;
        } else {
            return -1;
        }
    }
}

function sortHotelByDifferentItem(item) {
    console.log(item);
    document.getElementById("localHotel").innerHTML = "";

    hotelDataAll.sort(sortHotelByItem(item)); //js 自带排序方程
    console.log(hotelDataAll);
    showHotel(hotelDataAll);
}

document.getElementById('ByHotelNameBtn').addEventListener('click', function() {
    console.log("clicked");

    sortHotelByDifferentItem('distance');
    document.getElementById("ByPriceBtn").style.background = "#f85a06";
    document.getElementById("ByHotelRateBtn").style.background = "#f85a06";
    document.getElementById("ByHotelNameBtn").style.background = "#3DC9A0";





})

document.getElementById('ByHotelPriceBtn').addEventListener('click', function() {
    console.log("clicked");

    sortHotelByDifferentItem('pricefrom');
    document.getElementById("ByHotelPriceBtn").style.background = "#3DC9A0";
    document.getElementById("ByHotelRateBtn").style.background = "#f85a06";
    document.getElementById("ByHotelNameBtn").style.background = "#f85a06";



})


document.getElementById('ByHotelRateBtn').addEventListener('click', function() {
    console.log("clicked");

    sortHotelByDifferentItem("stars");
    document.getElementById("ByHotelPriceBtn").style.background = "#f85a06";
    document.getElementById("ByHotelRateBtn").style.background = "#3DC9A0";
    document.getElementById("ByHotelNameBtn").style.background = "#f85a06";



})


function showHotel(hotelData) {
    console.log(hotelData.length);
    document.getElementById("localHotel").innerHTML = "";
    var hotelContainer = document.createElement('div');
    hotelContainer.setAttribute("id", "hotelList");
    hotelContainer.setAttribute("class", "hotel-info");


    for (let j = 0; j < hotelData.length; j++) {

        var iteratorPhoto = hotelData[j].photos.values();
        for (let eachPhoto of iteratorPhoto) {}


        var iteratorFacility = hotelData[j].shortFacilities.values();
        for (let eachFacility of iteratorFacility) {}


        hotelContainer.innerHTML += `<div id="each-Hotel">` +
            `<div class="hotel-Image-Container">` +
            `<div class="scrollmenu">` +
            generateEachHotelPhoto(hotelData[j].photos) +






            `</div>` +
            `</div>` +
            `<ul class="infoContainer">` +
            `<div class="hotelName">` +
            `<i class="fas fa-hotel"></i>` +
            `${hotelData[j].name.en}` +
            `</div>` +
            `<div class="hotelAddress">` +
            `<i class="fas fa-map-marker-alt"></i>` +
            `${hotelData[j].address.en}</div>` +
            `<div class="hotelPrice">` +
            `<i class="fas fa-dollar-sign"></i>` +
            `${hotelData[j].pricefrom}` +
            `</div>` +
            `<div class="hotelCheckIn">` +
            `<i>CheckIn: </i>` +
            `${hotelData[j].checkIn}` +
            `</div>` +
            `<div class="hotelCheckOut">` +
            `<i>CheckOut: </i>` +
            `${hotelData[j].checkOut}` +
            `</div>` +
            `<ul class="hightlightsTag-Container">` +
            generateEachFacility(hotelData[j].shortFacilities) +
            `</ul>` +
            `<div class="hotelStar">` +
            `<label>Stars:</label>` +
            generateStar(hotelData[j].stars) +
            `</div>` +

            `</div>` +
            `</div>`;




    }
    document.getElementById("localHotel").appendChild(hotelContainer);



}



function listNews(city) {
    const newsAPI = `https://newsapi.org/v2/everything?q=bitcoin&from=${googleDate}&sortBy=publishedAt&apiKey=${newsKey}`;
    fetch(newsAPI).then(function(news) {
        return news.json();
    }).then(function(newsData) {
        console.log(newsData);
    })
}

function listNearby(map, latitude, longitude) {
    var location = new google.maps.LatLng(latitude, longitude);
    var request = {
        location: location,
        radius: '1000',
        type: ['restaurant']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);


}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        console.log(results);
    }
}