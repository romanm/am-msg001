var app = angular.module('myApp', []);
var initApp = function($scope, $http){
	console.log('initApp')
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
		}
	}
}

var Exe_fn = function($scope, $http){
	this.httpGet=function(progr_am){
		$http
		.get(progr_am.url, {params:progr_am.params})
		.then(progr_am.then_fn)
	}
}

var readSql = function(params, obj){
	if(!obj) obj = params
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	params,
	function(response) {
		obj.list = response.data.list
		if(obj.afterRead)
			obj.afterRead(response)
	}))
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}