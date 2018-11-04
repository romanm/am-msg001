var app = angular.module('myApp', ['ngSanitize']);
var initApp = function($scope, $http){
	console.log('initApp')
	$scope.pageVar = {}
	build_request($scope)
	exe_fn = new Exe_fn($scope, $http);
	exe_fn.httpGet_j2c_table_db1_params_then_fn = function(params, then_fn){
		return {
			url : '/r/url_sql_read_db1',
			params : params,
			then_fn : then_fn,
	}	}
	$scope.highlight = function(text, search){
		if (!text) return
		if (!search) return text;
		return (''+text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
}	}

var writeSql = function(data){
	exe_fn.httpPost
	({	url:'/r/url_sql_read_db1',
		then_fn:function(response) {
//			console.log(response.data)
			if(data.dataAfterSave)
				data.dataAfterSave(response)
		},
		data:data,
	})
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

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function build_request($scope){
	$scope.request={};
	console.log($scope.request)
	$scope.request.pathNameValue = window.location.pathname.split('.html')[0].split('/').reverse()[0]
	console.log($scope.request.pathNameValue)
	$scope.request.parameters={};
	if(window.location.search.split('?')[1]){
		angular.forEach(window.location.search.split('?')[1].split('&'), function(value, index){
			var par = value.split("=");
			$scope.request.parameters[par[0]] = par[1];
		});
	}
}

function build_sqlJ2c_row_insert(rowObj,col_data){
	col_data.sql_row = sql_1c.table_data_row_insert()
//	console.log(col_data)
	build_sqlJ2c_row_write(rowObj, col_data,function(v,k,n){
		build_sqlJ2c_cell_write(v,k,n,col_data,rowObj)
	})
	while(col_data.sql_row.indexOf(':row_id')>0){
		col_data.sql_row = col_data.sql_row.replace(':row_id', ':nextDbId1')
	}
	var table_id = col_data[Object.keys(col_data)[0]].table_id
	col_data.table_id = table_id
}

function build_sqlJ2c_row_write(rowObj,col_data,fn){
	angular.forEach(rowObj, function(v,k){
		var n = k.split('col_')[1]
		if(!isNaN(n))
			fn(v,k,n,col_data,rowObj)
	})
}

function build_sqlJ2c_cell_write_parameters(col_data, v, n){
	var cell_v
	if('string'==col_data[n].fieldtype){
		cell_v = "'"+v+"'"
	}else
	if('timestamp'==col_data[n].fieldtype){
		if(19==v.length)
			cell_v = "'"+v+".0'"
		else
			cell_v = "'"+v+":00.0'"
	}else{
		cell_v = v
	}
	col_data.sql = col_data.sql.replace(':value', cell_v)
	col_data.sql = col_data.sql.replace(':fieldtype', col_data[n].fieldtype)
		.replace(':fieldtype', col_data[n].fieldtype)
	col_data.sql_row += col_data.sql
}

function build_sqlJ2c_cell_write(v,k,n,col_data, rowObj){
//	console.log(col_data[n])
	var cellId_v = rowObj[k+'_id']
//	console.log(k+'/'+v+'/'+cellId_v+'/'+n)
	if(cellId_v){
		col_data.sql = sql_1c.table_data_cell_update()
		col_data.sql = col_data.sql.replace(':cell_id', cellId_v)
		build_sqlJ2c_cell_write_parameters(col_data, v, n)
	}else if(v){
		col_data.sql = sql_1c.table_data_cell_insert()
		col_data.sql = col_data.sql.replace(':column_id', n)
		while(col_data.sql.indexOf(':nextDbId2')>0){
			col_data.sql = col_data.sql.replace(':nextDbId2', ':nextDbId'+col_data.nextDbIdCounter)
		}
		col_data.nextDbIdCounter++
		build_sqlJ2c_cell_write_parameters(col_data, v, n)
	}
}

function loadVarAsFile(data, fileName, file_MIME_type){
	var blob = new Blob([data], {type: file_MIME_type}),
	e = document.createEvent('MouseEvents'),
	a = document.createElement('a')

	if (window.navigator && window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(blob, fileName);
	}
	else{
		var e = document.createEvent('MouseEvents'),
		a = document.createElement('a');

		a.download = fileName;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
		e.initEvent('click', true, false, window,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	}
}
