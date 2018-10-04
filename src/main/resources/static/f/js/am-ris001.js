var app = angular.module('myApp', ['ngSanitize']);
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

	$scope.highlight = function(text, search){
		if (!text) return
		if (!search) return text;
		return (''+text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
	}
}

function Exe_fn($scope, $http){
	this.httpGet=function(progr_am){
		$http
		.get(progr_am.url, {params:progr_am.params})
		.then(progr_am.then_fn)
	}
}

function readSql(params, obj){
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

function build_cell_sql_insert(v,k,n,col_data){
	var cellId_v = $scope.pageVar.rowObj[k+'_id']
	console.log(k+'/'+v+'/'+cellId_v)
	if(cellId_v){
		col_data.sql = sql_1c.table_data_cell_update()
		col_data.sql = col_data.sql.replace(':cell_id', cellId_v)
		var cell_v = ('string'==col_data[n].fieldtype)? "'"+v+"'":v
			if('timestamp'==col_data[n].fieldtype){
				var cell_v = "'"+v+":00.0'"
				console.log(cell_v)
			}
		col_data.sql = col_data.sql.replace(':value', cell_v)
		col_data.sql = col_data.sql.replace(':fieldtype', col_data[n].fieldtype)
		.replace(':fieldtype', col_data[n].fieldtype)
		col_data.sql_row += col_data.sql
	}else if(v){
		col_data.sql = sql_1c.table_data_cell_insert()
		col_data.sql = col_data.sql.replace(':column_id', n)
		while(col_data.sql.indexOf(':nextDbId2')>0){
			col_data.sql = col_data.sql.replace(':nextDbId2', ':nextDbId'+col_data.nextDbIdCounter)
		}
		col_data.nextDbIdCounter++
		var cell_v = ('string'==col_data[n].fieldtype)? "'"+v+"'":v
		var cell_v = ('timestamp'==col_data[n].fieldtype)? "'"+v+"'":v
		col_data.sql = col_data.sql.replace(':value', cell_v)
		col_data.sql = col_data.sql.replace(':fieldtype', col_data[n].fieldtype)
		.replace(':fieldtype', col_data[n].fieldtype)
		col_data.sql_row += col_data.sql
	}
}
