var apiKey = '64f2ee2a8261daa4d9f780f5b365f275';
var defaultCity = "Denver";

var currentDate = moment().format('dddd, MMMM Do YYYY');
var currentDateTime = moment().format('YYYY-MM-DD HH:MM:SS');

var searchHistory = [];

var searchButton = $('.search');

searchButton.on("click", function (event) {
    event.preventDefault();
    var enteredCity = $(this).parent('.btnPar').siblings('.textVal').val().trim();

    if (enteredCity === "") {
        return;
    }