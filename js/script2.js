console.log("hi")

//https://api.forecast.io/forecast/2af24699275f34e8a9b7f95cf5b6de4c/29.711642961073185,-95.38003781323678
//var baseUrl = 'https://api.forecast.io/forecast/'
//var chromeSecurityCode = '?callback=?'
//var apiKey = '2af24699275f34e8a9b7f95cf5b6de4c/'

var weatherContainer = document.querySelector('.weatherContainer')
var buttonsContainer = document.querySelector('.buttonsContainer')
var currentCityContainer = document.querySelector('.currentCityContainer')
var weekObject = {
		1: "Monday",
		2: "Tuesday", 
		3: "Wednesday", 
		4: "Thursday",
		5: "Friday", 
		6: "Saturday",
		7: "Sunday",

}
var getDayOfWeek = new Date() 
var today = getDayOfWeek.getDay()
var searchBar = document.querySelector("input")

// Two models to obtain data from two urls
var WeatherModel = Backbone.Model.extend({
	generateUrl: function(lat,lng) {
		this.url = "https://api.forecast.io/forecast/2af24699275f34e8a9b7f95cf5b6de4c/" + lat + ',' + lng + '?callback=?'
	}
})

var SearchCityModel = Backbone.Model.extend({
	generateUrl: function(searchCity) {
		this.url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + searchCity
	}
})

// Weather Views 
var CurrentSearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},

	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new CurrentView(wm)
		wm.fetch() 
	}
})

var DailySearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},

	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new DailyView(wm)
		wm.fetch() 
	}
})

var HourlySearchView = Backbone.View.extend ({
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},
	render: function(data) {
		console.log(data.attributes.results[0].geometry.location)
		var lat = data.attributes.results[0].geometry.location.lat
		var lng = data.attributes.results[0].geometry.location.lng
		console.log(lat)
		console.log(lng)
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new HourlyView(wm)
		wm.fetch() 
	}
})

// Display Views to the Dom 
var CurrentView = Backbone.View.extend({
	el: ".currentCityContainer",
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},

	render: function() {
		var currentData = this.model.attributes.currently
		var iconNumber = 0
		this.el.innerHTML =
							'<p class="currentCityTemperature">' + parseInt(currentData.temperature) + '&deg;F</p>\
							<canvas id="icon'+ iconNumber + '" width="75" height="75"></canvas>\
							<p><span class="currentCitySummary">' + currentData.summary + '</span>' +
							'<span class="currentDay">' + weekObject[today] + '</span></p>'		
		var iconString = currentData.icon
 		doSkyconStuff(iconString,iconNumber)
	}
})

var DailyView = Backbone.View.extend({
	el: ".weatherContainer",
	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},

	render: function() {
		var dailyData = this.model.attributes.daily.data
		var hmtlString = ''
		var iconNumber = 1
		for (var i = 0; i < dailyData.length; i++) {
			if (today < 7) {
				today += 1
				var dayObject = dailyData[i]
				var iconString = dayObject.icon

				hmtlString += '<div class="dailyTemperature">\
							<p class="day">' + weekObject[today].substring(0,3) + '</p>\
							<canvas class="skycon" id="icon' + iconNumber + '" width="75" height="75" data-icon="'+ iconString +'"></canvas>\
							<p class="maxAndMinTemps">' + parseInt(dayObject.temperatureMax) + '&deg; / ' + parseInt(dayObject.temperatureMin) + '&deg;</p>\
							</div>'
				iconNumber += 1
				// doSkyconStuff(iconNumber, iconString) ... however <canvas> not on page

 			} else { today = 0}
		}
		
		this.el.innerHTML =  hmtlString

		var allSkycons = document.querySelectorAll('canvas.skycon');

		for (var i = 0 ; i < allSkycons.length; i++){
			var iconDataValueForElement = allSkycons[i].dataset.icon 
			doSkyconStuff( iconDataValueForElement, i+1 )

		}

	}
})

var HourlyView = Backbone.View.extend({
	el: ".weatherContainer",
	firstHourShowing: 0,

	initialize: function(someModel) {
		this.model = someModel
		var boundRender = this.render.bind(this)
		this.model.on("sync", boundRender)
	},

	nextSeven: function(clickEvent) {
		if (clickEvent.target.value === "prev") this.firstHourShowing -= 7
		else this.firstHourShowing += 7
		if (this.firstHourShowing < 1 || this.firstHourShowing > 24) {
			this.firstHourShowing = 0
		}
		this.render()
	},

	render: function() {
		var startIndex = this.firstHourShowing
		var hourlyData = this.model.attributes.hourly.data
		var htmlString = ''
		function getHourTime (input) {
			var hour = new Date(input * 1000)
			return hour.getHours() + ":" + hour.getMinutes() + hour.getMinutes() 
		}
		for (var i = startIndex; i < startIndex + 7 ; i++) {
			var hourlyObject = hourlyData[i] 
			htmlString += '<div class="hourlyTemperature">\
							<p class="hourlyTime">' + getHourTime(hourlyObject.time) + '</p>\
							<p class="hourlySummary">' + hourlyObject.summary + '</p>\
							<p class="hourlyTemp">' + parseInt(hourlyObject.temperature) + '&deg;F / </p>\
							<p class="hourlyWind">' + parseInt(hourlyObject.windSpeed) + 'mph</p>\
							<p class="hourlyPrecip">Precip: ' + parseInt(hourlyObject.precipProbability*100) + '%</p></div>'
		}
		this.el.innerHTML = '<img class="nextButton" src="images/arrow-left.svg" value="prev">' + htmlString + '<img class="nextButton" src="images/arrow-right.svg">'
		},

	events: {
		"click .nextButton": "nextSeven"
	}
})

// Router
var WeatherRouter = Backbone.Router.extend ({
	routes: {
		"currentForecast/:searchCity": "handleCurrentSearchCity",
		"dailyForecast/:searchCity": "handleDailySearchCity",
		"hourlyForecast/:searchCity": "handleHourlySearchCity",
		"currentForecast/:lat/:lng": "handleCurrentWeather",
		"dailyForecast/:lat/:lng": "handleDailyWeather",
		"hourlyForecast/:lat/:lng": "handleHourlyWeather",
		"*default": "handleDefault"
	},

	handleCurrentWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var cv = new CurrentView(wm)
		wm.fetch() 
	},

	handleDailyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var dv = new DailyView(wm)
		wm.fetch()
	},

	handleDefault: function() {
			// get current lat long, write into the route
		var successCallback = function(positionObject) {
			var lat = positionObject.coords.latitude 
			var lng = positionObject.coords.longitude 
			location.hash = "currentForecast/" + lat + "/" + lng
		}

		var errorCallback = function(error) {
			console.log(error)
		}

		window.navigator.geolocation.getCurrentPosition(successCallback,errorCallback)
	},

	handleHourlyWeather: function(lat,lng) {
		var wm = new WeatherModel()
		wm.generateUrl(lat,lng)
		var hv = new HourlyView(wm)
		wm.fetch()
	},

	handleCurrentSearchCity: function(searchCity) {
		var scm = new SearchCityModel()
		scm.generateUrl(searchCity)
		var csv = new CurrentSearchView(scm)
		scm.fetch()
	},

		handleDailySearchCity: function(searchCity) {
		var scm = new SearchCityModel()
		scm.generateUrl(searchCity)
		var csv = new DailySearchView(scm)
		scm.fetch()
	},

		handleHourlySearchCity: function(searchCity) {
		var scm = new SearchCityModel()
		scm.generateUrl(searchCity)
		var csv = new HourlySearchView(scm)
		scm.fetch()
	},
	
	initialize: function() {
		Backbone.history.start()
	}

})



// Changing the route and hash functions 
function hashChanging(clickEvent) {
	var route = window.location.hash.substring(1),
		routeParts = route.split('/')
		// lat = routeParts[1]
		// lng = routeParts[2]
		searchCity = routeParts[1]
	var buttonClicked = clickEvent.target
	var userSearch = buttonClicked.value
	//location.hash = userSearch + "/" + lat + '/' + lng
	location.hash = userSearch + "/" + searchCity
}

function searchNewCity (keyEvent) {
	var inputEl = keyEvent.target
	if (keyEvent.keyCode === 13) {
		var newSearchQuery = inputEl.value
		var currentCity = document.querySelector(".currentCity")
		currentCity.innerHTML = '<p>' +newSearchQuery+'</p>'
		location.hash = "currentForecast/" + newSearchQuery
		inputEl.value = ''
	}
}

var myRtr = new WeatherRouter() 
searchBar.addEventListener('keydown',searchNewCity)
buttonsContainer.addEventListener('click',hashChanging)
//window.addEventListener('hashchange', weatherRouter)



var doSkyconStuff = function(iconString, iconNumber) {

	var formattedIcon = iconString.toUpperCase().replace(/-/g,"_")
	  // on Android, a nasty hack is needed: {"resizeClear": true}
	//add CANVAS DOM element on the page to list of animitable elements (finds Canvas-element on 'id' attribute)
	//    NOTE: Canvas-Element MUST be present on page  
	var skycons = new Skycons({"color": "white"});
	    		//1.DOM_element: id    2.skycon-icon-label(must be uppercase)
	skycons.add("icon" + iconNumber, Skycons[formattedIcon]);

	  // start animation!
	skycons.play();
}

