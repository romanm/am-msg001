app.controller('myCtrl', function($scope) {
	initApp()
    $scope.firstName= "John";
    $scope.lastName= "Doe";
    console.log($scope)
});