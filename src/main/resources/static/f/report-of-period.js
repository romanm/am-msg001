var app = angular.module('myApp', ['ngSanitize']);
var sql_lib = {sql_read_table : "SQL для зчитуваня даних"}
app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	init($scope, $http)
	$scope.table_reports = {}
	$scope.table_reports.seek_parameters = {}
	$scope.table_reports.date_today = new Date()
	$scope.table_reports.seek_parameters.year = $scope.table_reports.date_today.getFullYear()
	$scope.table_reports.seek_parameters.month = 1+$scope.table_reports.date_today.getMonth()
	$scope.table_reports.seekMonth = function(){
		read_239($scope)
		read_238($scope)
		read_239239_236($scope)
	}
	$scope.table_reports.setSeekYear = function(year){
		$scope.table_reports.seek_parameters.year = year
	}
	$scope.table_reports.setSeekMonth = function(month){
		$scope.table_reports.seek_parameters.month = month
	}

	readSql({
		sql:sql_lib.sql_for_table(),
		afterRead:function(response){
			sql_lib.sql_read_table = response.data.list[0].docbody
//			console.log(sql_lib.sql_read_table)
			read_months($scope)
			read_years($scope)
			read_239($scope)
			read_238($scope)
			read_239239_236($scope)
		}
	})
})

sql_lib.sql_read_order_239_236 = function(){
	return "SELECT * " +
	"FROM (" + sql_lib.sql_read_wmyy() + ") x " +
	"WHERE yy=:year AND m=:month ORDER BY col_238,col_239,col_236"
}
function read_239239_236($scope){
	readSql({
		sql:sql_lib.sql_read_order_239_236(),
		month:$scope.table_reports.seek_parameters.month,
		year:$scope.table_reports.seek_parameters.year,
		afterRead:function(response){
			$scope.table_reports.order_239_236_list = response.data.list
			console.log($scope.table_reports.order_239_236_list)
		},
	})
}
sql_lib.sql_read_group_238 = function(){
	return "SELECT col_238, count(col_238) cnt_238, sum(col_240) sum_240 " +
	"FROM (" + sql_lib.sql_read_wmyy() + ") x " +
	"WHERE yy=:year AND m=:month GROUP BY col_238 ORDER BY col_238 "
}
function read_238($scope){
//	console.log(sql_lib.sql_read_group_238())
	readSql({
		sql:sql_lib.sql_read_group_238(),
		month:$scope.table_reports.seek_parameters.month,
		year:$scope.table_reports.seek_parameters.year,
		afterRead:function(response){
			console.log(response.data.list)
			$scope.table_reports.group_238_list = response.data.list
			$scope.table_reports.group_238 = {}
			angular.forEach(response.data.list, function(v){
				if(v.col_238){
					$scope.table_reports.group_238[v.col_238] = v
				}
			})
			console.log($scope.table_reports.group_238)
		},
	})
}

sql_lib.sql_read_group_239 = function(){
	return "SELECT col_239, count(col_239) cnt_239, sum(col_240) sum_240 " +
			"FROM (" + sql_lib.sql_read_wmyy() + ") x " +
			"WHERE yy=:year AND m=:month GROUP BY col_238,col_239 ORDER BY col_238,col_239"
}
function read_239($scope){
//	console.log(sql_lib.sql_read_group_239())
	readSql({
		sql:sql_lib.sql_read_group_239(),
		month:$scope.table_reports.seek_parameters.month,
		year:$scope.table_reports.seek_parameters.year,
		afterRead:function(response){
			console.log(response.data.list)
			$scope.table_reports.group_239_list = response.data.list
			$scope.table_reports.group_239 = {}
			angular.forEach(response.data.list, function(v){
				if(v.col_239){
					$scope.table_reports.group_239[v.col_239] = v
				}
			})
			console.log($scope.table_reports.group_239)
		},
	})
}

sql_lib.sql_read_wmyy = function(){
	return "SELECT col_236 dt, EXTRACT(WW from col_236) w, EXTRACT(M FROM col_236) m, EXTRACT(yy FROM col_236) yy, * " +
	"FROM (" +sql_lib.sql_read_table +") x"
}
sql_lib.sql_for_table = function(){
	return "SELECT * FROM doc,docbody WHERE doc_id=docbody_id AND parent = 235 AND doctype=19"
}

var init = function($scope, $http){
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
		}	}

	exe_fn.httpGet({
		url:'/r/principal',
		then_fn:function(response){
			$scope.principal = response.data.m
			console.log($scope.principal)
			/*
			 * 
			$scope.pageVar.site_config
				= response.data.config
			if($scope.pageVar.site_config)
				if($scope.pageVar.site_config.colortheme){
					$scope.pageVar.colortheme.theme
						= $scope.pageVar.site_config.colortheme.theme
					console.log($scope.pageVar.site_config.colortheme)
				}
			//exe_fn.httpGet($scope.lastDbRead.requestToImport)
			$interval( function(){ exe_fn.httpGet($scope.lastDbRead.requestToImport) }, $scope.lastDbRead.timeout)
			 */
		},
	})

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

function Exe_fn($scope, $http){
	this.httpGet=function(progr_am){
		if(progr_am.error_fn)
			$http
			.get(progr_am.url, {params:progr_am.params})
			.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http
			.get(progr_am.url, {params:progr_am.params})
			.then(progr_am.then_fn)
	}
	this.httpPost=function(progr_am){
		if(progr_am.error_fn)
			$http.post(progr_am.url, progr_am.data)
			.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http.post(progr_am.url, progr_am.data)
			.then(progr_am.then_fn)
	}
}

sql_lib.sql_read_group_yy = function(){
	return "SELECT yy, COUNT(yy) cnt_yy FROM (" + sql_lib.sql_read_wmyy() + ") x GROUP BY yy ORDER BY yy DESC"
}
function read_years($scope){
	readSql({
		sql:sql_lib.sql_read_group_yy(),
		afterRead:function(response){
//			console.log(response.data.list)
			$scope.table_reports.group_yy_list = response.data.list
			$scope.table_reports.group_yy = {}
			angular.forEach(response.data.list, function(v){
				if(v.yy){
					$scope.table_reports.group_yy[v.yy] = v
				}
			})
//			console.log($scope.table_reports.group_yy)
		},
	})
}

sql_lib.sql_read_group_m = function(){
	return "SELECT m, COUNT(m) cnt_m FROM (" + sql_lib.sql_read_wmyy() + ") x GROUP BY m ORDER BY m DESC"
}
function read_months($scope){
	readSql({
		sql:sql_lib.sql_read_group_m(),
		afterRead:function(response){
//			console.log(response.data.list)
			$scope.table_reports.group_m_list = response.data.list
			$scope.table_reports.group_m = {}
			angular.forEach(response.data.list, function(v){
				if(v.m){
					$scope.table_reports.group_m[v.m] = v
				}
			})
//			console.log($scope.table_reports.group_m)
		},
	})
}
