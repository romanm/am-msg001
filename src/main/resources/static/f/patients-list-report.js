app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	initConfig($scope, $http, $interval)
	initFilter($scope, $http)

})
