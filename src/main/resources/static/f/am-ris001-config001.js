var initConfig = function($scope, $http, $interval){
	console.log('initConfig')

	$scope.pageVar.colortheme = {}
	$scope.pageVar.colortheme.changeTheme = function(){
		this.theme = (this.theme == 'night')?'day':'night'
		console.log($scope.pageVar.site_config)
		var data = $scope.pageVar.site_config
		data.colortheme
			= $scope.pageVar.colortheme
		console.log(data)
		exe_fn.httpPost({ url:'/url_file_write',
			then_fn:function(response) {
				console.log(response.data)
			},
			data:data,
		})
	}

	$scope.lastDbRead = {
		timeout : 15*60*1000,
		lastCallTime : new Date(),
		importCnt:0,
	}

	$scope.lastDbRead.requestToImport = {
//		url:'/f/js/li159-10-test1.json',
		url:'/li159-10',
		then_fn:function(response){
			delete $scope.lastDbRead.cntImport
			$scope.dataToImport = response.data
			console.log($scope.dataToImport)
			$scope.callDbImport()
		},
	}

	$scope.callDbImport = function() {
		if($scope.patientList){
			if($scope.patientList.pl){
				$scope.lastDbRead.lastCallTime = new Date()
				$scope.lastDbRead.sql =
					sql.read_table_max_min_date()
					.replace(':read_table_sql',$scope.patientList.config.sql_read_table_data)
					readSql($scope.lastDbRead)
			}
		}
	}

	exe_fn.httpGet({
		url:'/r/principal',
		then_fn:function(response){
			$scope.principal = response.data.m
			console.log($scope.principal)
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
		},
	})
	
	$scope.date = {
		today : new Date(),
		seekDay : new Date(),
		addDayUrl : function(addDay){
			if($scope.request.parameters.addDay)
				return addDay + $scope.request.parameters.addDay*1
			return addDay
		},
		setDay_pl_data:function(o){
			o.pl_data.year=$scope.date.seekDay.getFullYear()
			o.pl_data.month=$scope.date.seekDay.getMonth()+1
			o.pl_data.day=$scope.date.seekDay.getDate()
		},
		seekDayReadSql:function(o){
			this.setDay_pl_data(o)
			readSql(o.pl_data, o.pl)
//			readSql($scope.patientList.pl_data, $scope.patientList.pl)
		},
		addDayToSeekDay:function(addDay){
			this.seekDay.setDate(this.seekDay.getDate() + addDay)
		},
	}

	$scope.tableData = {config:{}}
	$scope.tableData.tableId = 235
	$scope.tableData.readData = function(){
		readSql({
			tableId:$scope.tableData.tableId,
			sql:sql.read_table_config(),
			afterRead:function(response){
				$scope.tableData.list = response.data.list
				read_j2c_table($scope.tableData, $scope)
				console.log($scope.tableData)
				var o = $scope.tableData
				o.pl_data = {}
				o.pl_data.checkIds = '41907,41913,41914,41919,41920,41935,41936,41941,41958'
					o.pl_data.sql=sql.read_table_by_checkId()
					.replace(':read_table_sql', o.config.sql_read_table_data)
					.replace(':checkIds', o.pl_data.checkIds)
					o.pl_data.afterRead=function(){
					o.checkIdMap = {}
					console.log(o.pl.list.length)
					angular.forEach(o.pl.list, function(v){
						o.checkIdMap[v.col_14207] = v
					})
					console.log(o.checkIdMap)
				}
				o.pl = {}
				readSql(o.pl_data, o.pl)
			}
		})
	}

}

var read_j2c_table = function(o, $scope){
	angular.forEach(o.list, function(v){
		if(19==v.doctype)
			o.config.sql_read_table_data = v.docbody
		else if(20==v.doctype)
			o.config.json_create_table = JSON.parse(v.docbody)
	})
}

var sql = {}
var sql_1c = sql
sql.read_table_by_checkId=function(){
	return "SELECT * FROM ( \n" +
	":read_table_sql " +
	") x WHERE col_14207 IN (:checkIds)"
}

sql.read_table_config=function(){
	return "SELECT * FROM doc d, docbody s \n" +
	"WHERE parent = :tableId AND s.docbody_id=d.doc_id AND doctype!=4"
}
