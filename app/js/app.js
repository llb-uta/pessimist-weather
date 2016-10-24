
var pw = angular.module('pessimistWeather', ['ngMaterial'])
pw.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark();
});

pw.run(['$rootScope', '$timeout',  function($rootScope, $timeout){

	$rootScope.fullscreen = false;
	$rootScope.initialized = false;


	llb_app.addListener('window_state', function(data){
		if(data.fullscreen)
		{
			$timeout(function(){
				$rootScope.fullscreen = true
			}, 400)
			$rootScope.$apply(function(){
				//$rootScope.fullscreen = true
			})
		}
		else
		{
			$rootScope.$apply(function(){
				$rootScope.fullscreen = false
			})
		}
	})

	llb_app.request('window_dimensions')

	llb_app.addListener('window_dimensions', function(data){
		$rootScope.$apply(function(){
			$rootScope.window_dimensions = data
			$rootScope.initialized = true;
		})
	})

	$rootScope.range = function(num)
	{
		return new Array(num)
	}
}])

pw.controller('MainController', ['$rootScope', '$http', function($rootScope, $http){
	var vm = this
	vm.date = new Date()
	vm.loading = true;
	vm.location = ''

	vm.weatherdata = {}


	llb_app.addListener('location', function(result){

		if(result.status == 'failure')
		{
			vm.failed = true
			return;
		}

		$http.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20u%3D%22c%22%20and%20woeid%20in%20(SELECT%20woeid%20FROM%20geo.places%20WHERE%20text%3D%22('+result.data.latitude+'%2C'+result.data.longitude+')%22)&format=json').success(function(res){
			vm.weatherdata.current_temp = res.query.results.channel.item.condition.temp;
			vm.weatherdata.temp_max = res.query.results.channel.item.forecast[0].high;
			vm.weatherdata.temp_min = res.query.results.channel.item.forecast[0].low;

			vm.forecast = res.query.results.channel.item.forecast
			vm.location = res.query.results.channel.location.city + ', '+ res.query.results.channel.location.country

			vm.loading = false;

			vm.weatherdata.iconCode = res.query.results.channel.item.condition.code
			vm.weatherdata.description = res.query.results.channel.item.condition.text
		})
	})

	llb_app.request('location')

/*	$http.get('https://ipinfo.io/json').success(function(data){
		data.city = 'Tampere'
		data.country = 'FI'
		$http.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20u%3D"c"%20and%20woeid%20in%20(select%20woeid%20from%20geo.places%20where%20text%3D%22'+data.city+'%2C'+data.country+'%22)&format=json').success(function(res){
			
			vm.weatherdata.current_temp = res.query.results.channel.item.condition.temp;
			vm.weatherdata.temp_max = res.query.results.channel.item.forecast[0].high;
			vm.weatherdata.temp_min = res.query.results.channel.item.forecast[0].low;

			vm.forecast = res.query.results.channel.item.forecast

			vm.loading = false;
			vm.location = data.city + ', '+ data.country

			console.log(res)

			vm.weatherdata.iconCode = res.query.results.channel.item.condition.code
			vm.weatherdata.description = res.query.results.channel.item.condition.text

		})
	})

*/
	vm.getQuote = function(code)
	{
		switch(true)
		{
			case [32, 34].indexOf(parseInt(code)) > 0:
				return '"Vai niin, aurinkokin pääti tulla esille."'
			case [27,28,29,30].indexOf(parseInt(code)) > 0:
				return '"Mitä mukava sää..."'
			case [10,11,12].indexOf(parseInt(code)) > 0:
				return 'Aijaa. Taas sadetta.'
			default:
				return '"Mitä mukava sää..."'
		}
	}

	vm.getIcon = function(code)
	{
		return 'http://openweathermap.org/img/w/' + code+'.png'
/*		switch(true)
		{
			case code == 800:
				return 'img/sunny.gif'
			case [801, 802, 803, 804].indexOf(code) > 0:
				return 'img/cloudy.png'
			case [500, 501, 502, 503, 504 , 511, 520, 521, 522, 531].indexOf(code) > 0:
				return 'img/rainy.gif'
			default:
				return 'img/sunny.gif'
		}
*/
	}

}])