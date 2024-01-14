var apiKey = 'c306678275aec1852958520523d18a4a';
var defaultCity = "Arlington";
var currentDate = moment().format('dddd, MMMM Do YYYY');
var currentDateTime = moment().format('YYYY-MM-DD HH:MM:SS');
var searchHistory = [];
var searchButton = $('.search');
var todayCardBody = $('.cardBodyToday');
var fiveDayForecastContainer = $('.fiveForecast');

searchButton.on("click", function (event) {
    event.preventDefault();
    var enteredCity = $(this).parent('.btnPar').siblings('.textVal').val().trim();

    if (enteredCity === "") {
        return;
    }
    searchHistory.push(enteredCity);
    localStorage.setItem('city', JSON.stringify(searchHistory));

    clearForecast();
    updateHistory();
    getWeatherToday(enteredCity);
});

function getWeatherToday(city) {
    var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    todayCardBody.empty();

    $.ajax({
        url: currentWeatherUrl,
        method: 'GET',
    }).then(function (response) {
        $('.cardTodayCityName').text(response.name);
        $('.cardTodayDate').text(currentDate);
        $('.icons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
        appendWeatherInfo('Temperature', response.main.temp);
        appendWeatherInfo('Feels Like', response.main.feels_like);
        appendWeatherInfo('Humidity', response.main.humidity + ' %');
        appendWeatherInfo('Wind Speed', response.wind.speed + ' MPH');

        var cityLon = response.coord.lon;
        var cityLat = response.coord.lat;

        var uvIndexUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=hourly,daily,minutely&appid=${apiKey}`;

        $.ajax({
            url: uvIndexUrl,
            method: 'GET',
        }).then(function (response) {
            var uvIndex = response.current.uvi;
            var uvIndexElement = $('<p>').text('UV Index: ').append($('<span>').text(uvIndex));

            todayCardBody.append(uvIndexElement);
            colorCodeUVIndex(uvIndex);
        });
    });

    getFiveDayForecast(city);
}

function updateHistory() {
    var searchHistoryList = $('#search-history-list');
    searchHistoryList.empty();

    for (var i = 0; i < searchHistory.length; i++) {
        var listItem = $('<li>').text(searchHistory[i]);
        listItem.on("click", function () {
            getWeatherToday($(this).text());
        });

        searchHistoryList.append(listItem);
    }
}

function getFiveDayForecast(city) {
    var fiveDayForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: fiveDayForecastUrl,
        method: 'GET',
    }).then(function (response) {
        var fiveDayArray = response.list;
        var myWeather = [];

        $.each(fiveDayArray, function (index, value) {
            var testObj = {
                date: value.dt_txt.split(' ')[0],
                time: value.dt_txt.split(' ')[1],
                temp: value.main.temp,
                feels_like: value.main.feels_like,
                icon: value.weather[0].icon,
                humidity: value.main.humidity
            };

            if (value.dt_txt.split(' ')[1] === "12:00:00") {
                myWeather.push(testObj);
            }
        });

        displayFiveDayForecast(myWeather);
    });
}

function displayFiveDayForecast(weatherData) {
    for (let i = 0; i < weatherData.length; i++) {
        var cardElement = $('<div>').addClass('card text-white bg-primary mb-3 cardOne').attr('style', 'max-width: 200px;');
        var headerElement = $('<div>').addClass('card-header').text(moment(`${weatherData[i].date}`).format('MM-DD-YYYY'));
        var bodyElement = $('<div>').addClass('card-body');
        var iconElement = $('<img>').addClass('icons').attr('src', `https://openweathermap.org/img/wn/${weatherData[i].icon}@2x.png`);

        appendWeatherInfoElement(bodyElement, iconElement);
        appendWeatherInfoElement(bodyElement, $('<p>').text(`Temperature: ${weatherData[i].temp} °F`));
        appendWeatherInfoElement(bodyElement, $('<p>').text(`Feels Like: ${weatherData[i].feels_like} °F`));
        appendWeatherInfoElement(bodyElement, $('<p>').text(`Humidity: ${weatherData[i].humidity} %`));

        fiveDayForecastContainer.append(cardElement.append(headerElement).append(bodyElement));
    }
}

function appendWeatherInfoElement(container, element) {
    container.append(element);
}

function clearForecast() {
    fiveDayForecastContainer.empty();
}

function initializeApplication() {
    var storedCityHistory = JSON.parse(localStorage.getItem('city'));

    if (storedCityHistory !== null) {
        searchHistory = storedCityHistory;
    }

    updateHistory();
    getWeatherToday(defaultCity);
}

initializeApplication();
