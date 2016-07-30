
var tabs = require("sdk/tabs");
var simplePrefs = require('sdk/simple-prefs')

var loginUrl = simplePrefs.prefs['loginUrl']
var keepaliveUrl = simplePrefs.prefs['keepaliveUrl']
var logoutUrl = simplePrefs.prefs['logoutUrl']

var timers = require("sdk/timers");

var intervalId = -1;

function reset(prefName){
	console.log("reset", prefName);
	loginUrl = simplePrefs.prefs['loginUrl'];
	keepaliveUrl = simplePrefs.prefs['keepaliveUrl'];
	logoutUrl = simplePrefs.prefs['logoutUrl'];
	if(intervalId != -1) {
		setTimer();
	}
}

function cancelTimer() {
	if(intervalId != -1){
 		timers.clearInterval(intervalId)
 		intervalId = -1
 	}
}

function setTimer(){
	cancelTimer()
 	intervalId = timers.setInterval(keepaliveCall, 1000 * 60 * simplePrefs.prefs['refreshInterval'])
 	console.log("intervalId: "+intervalId)
}

function keepaliveCall(){
	console.log("keepaliveCall", keepaliveUrl)
	require("sdk/request").Request(
		{
			url: keepaliveUrl,
			onComplete: function (response) {
				console.log("keepaliveCall completed", response.status)
			}
		}).get();
}

tabs.on('ready', function(tab) {
  console.log('tab is loaded', tab.title, tab.url)
  if(tab.url.startsWith(loginUrl)){
  	console.log("loginUrl")
  	setTimer()
  } else if(tab.url.startsWith(logoutUrl)){
  	console.log("logoutUrl")
  	cancelTimer()
  }
});

simplePrefs.on("", reset);

exports.onUnload = function (reason) {
	console.log("session-keepalive - onUnload");
	cancelTimer();
};
