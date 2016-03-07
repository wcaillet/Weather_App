console.log("hello my fair-weathered friend")
console.log($)

// https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE


// -----------------  Global Variables ------------------ //

// For 7day weather: 
// https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE

var apiKey = "95fddab35544148bbb14d85e5cf9278a"
var baseUrl = "https://api.forecast.io/forecast"
var latLong = "/29.7605,-95.3698"
var callbackHack = "?callback=?"
var fullUrl = baseUrl + apiKey + latLong + callbackHack

var tempContainer = document.querySelector("#tempContainer")
var currentProfileBtn_el = document.querySelector('.current')
var hourlyProfileBtn_el = document.querySelector('.hourly')
var dailyProfileBtn_el = document.querySelector('.daily')

var weatherData = null

////-----------------------------------






var successCallback = function(positionObject) {
	//console.log(positionObject)
	var lat = positionObject.coords.latitude,
		long = positionObject.coords.longitude

	var fullUrl = baseUrl + "/" + apiKey +'/' + lat + "," + long + callbackHack
	
	$.getJSON(fullUrl).then( //promise
		function(resp){
			console.log(resp)
			weatherData = resp //requests data from fullUrl and appends data to 
			handleCurrentJsonData(weatherData)
		})

}

var errorCallback = function(error) {
		console.log(error)
	}

// ---------------------------------- //

var ViewConstructor = function(dom_node_el, templateBuilder_fn){
	this._el = dom_node_el;
	this._buildHTMLString = templateBuilder_fn; //Passing the f(x)

	this.renderHTML = function(inputData){
		var target_el = document.querySelector(this._el)
		console.log(target_el)
		target_el.innerHTML = this._buildHTMLString(inputData) //Calling the f(x) here
	}
}

// var navBar = function(navArray){
// 	var htmlStr = ''
// 	for(var i=0; i<navArray.length; i++){
// 		 htmlStr += '<button class="' + navArray[i].toLowerCase() + '">' + navArray[i] + '</button>'
// 	}
// 		return htmlStr
// }

//var navViewInstance = new ViewConstructor("#nav-container", navBar)


//// ----------- Current View -- Started here

var handleCurrentJsonData = function(jsonData) {
	console.log('handling currently data....')

	// console.log(jsonData)
	// var htmlString = ""
	// var currentlyObj = jsonData.currently
	// 	for (var prop in currentlyObj) {
	// 	var value = currentlyObj[prop]
	// 	console.log(value)	
	// }

	var currentWeather = jsonData.currently  // parse 
	var htmlString = currentObjToHTML(currentWeather) // build template
	console.log(htmlString)
	console.log(tempContainer)

	tempContainer.innerHTML = htmlString // put template on DOM

}

var currentObjToHTML = function(currentObj) {

	var tempString = ""
		tempString += '<div id="weatherContainer">' 
		tempString += 	'<p class="temperature">'+ currentObj.temperature + '</p>' 
		tempString +=	'<p class="summary">' + currentObj.summary + '</p>'
		tempString += '</div>'
	
	return tempString
}

//// ----------- Hourly View 

var handleHourlyJsonData = function(jsonData) {
	console.log('handling hourly data....')
   var htmlString = "" 
   var hourlyDataArray = jsonData.hourly.data
   for (var i = 0; i < 24; i++) {
       var hourlyObj = hourlyDataArray[i]
       htmlString += hourlyObjToHTML(hourlyObj)
   }
   tempContainer.innerHTML = htmlString
}

var hourlyObjToHTML = function(jsonObj) {
//	console.log(jsonObj)
	var tempString = ""
		tempString += '<div id="weatherContainer">' 
		tempString += 	'<p class="temperature"> ' 
		tempString +=    jsonObj.time + '</p>' 
		tempString += 	'<p class="temperature"> ' 
		tempString +=    jsonObj.temperature + '</p>'
		tempString +=	'<p class="summary">' + jsonObj.summary + '</p>'
		tempString += '</div>'
		return tempString
}

//// ----------- Daily View 

var handleDailyJsonData = function(jsonData) {
	console.log('handling daily data....')

	var htmlString = ""
	var dailyDataArray = jsonData.daily.data 
	for (var i=0; i<dailyDataArray.length; i++) {
		var dailyObj = dailyDataArray[i]
		htmlString += dailyObjToHTML(dailyObj)
	}
	tempContainer.innerHTML = htmlString
}

var dailyObjToHTML = function(jsonObj) {
//	console.log(jsonObj)
	var tempString = ""
		tempString += '<div id="weatherContainer">' 
		tempString += 	'<p class="temperature">Max Temp: ' 
		tempString +=    jsonObj.temperatureMax + '</p>' 
		tempString += 	'<p class="temperature">Min Temp: ' 
		tempString +=    jsonObj.temperatureMin + '</p>' 
		tempString +=   '<i class="icon"' + jsonObj.icon + '>'
		tempString +=	'<p class="summary">' + jsonObj.summary + '</p>'
		tempString += '</div>'
		return tempString
}

// -----------------  Routing ------------------ //

var handleNavClick = function(event){
	// console.log("hiya buddy")
	// console.log(event.target)
	// console.log(event.target.className)
	window.location.hash = event.target.className
}

// var navOps = ['Current', 'Hourly', 'Daily']
// navViewInstance.renderHTML(navOps)
// view_Current.renderHTML(getWeather)

////-------------------------------------

//var navViewInstance = new ViewConstructor("#nav-container", navBar)

var view_Current = new ViewConstructor("#tempContainer", currentObjToHTML)

var view_Hourly = new ViewConstructor("#tempContainer", hourlyObjToHTML)

var view_Daily = new ViewConstructor("#tempContainer", dailyObjToHTML)


////----------- Promises, Promises

// var forecastPromiseCurrent = $.getJSON(fullUrl)
// forecastPromiseCurrent.then(handleCurrentJsonData)

// var forecastPromiseHourly = $.getJSON(fullUrl)
// forecastPromiseHourly.then(handleHourlyJsonData)

// var forecastPromiseDaily = $.getJSON(fullUrl)
// forecastPromiseDaily.then(handleDailyJsonData)


// -----------------  Kicking Things Off! ------------------ //


var routerController = function(){
	console.log(window.location.hash)

	// if( weatherData === null) { //
	//   window.location.hash = "currently"
	// 	navigator.geolocation.getCurrentPosition(successCallback,errorCallback) 
    //  } else {....
	// 

	console.log(weatherData)

	if	(window.location.hash === "hourly"){
		// view_Hourly.renderHTML(getWeather)
		// var forecastPromiseHourly = $.getJSON(fullUrl)

		handleHourlyJsonData(weatherData)

	}
	else if(window.location.hash === "daily"){
		// view_Daily.renderHTML(getWeather)
		// var forecastPromiseDaily = $.getJSON(fullUrl)
		handleDailyJsonData(weatherData)
	}
	else {
		// view_Current.renderHTML(getWeather)
		// var forecastPromiseCurrent = $.getJSON(fullUrl)
		console.log(weatherData)
		handleCurrentJsonData(weatherData)
	}
}

// routerController()  



navigator.geolocation.getCurrentPosition(successCallback,errorCallback)

currentProfileBtn_el.addEventListener("click", handleNavClick)
hourlyProfileBtn_el.addEventListener("click", handleNavClick)
dailyProfileBtn_el.addEventListener("click", handleNavClick)

window.addEventListener("hashchange", routerController) 



