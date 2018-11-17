app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	initConfig($scope, $http, $interval)
	initFilter($scope, $http)
	console.log('--------5------------')
	console.log($scope)
	if($scope.request.parameters.addDay) {
		$scope.date.addDayToSeekDay($scope.request.parameters.addDay*1)
	}

	readSql({
		tableId:$scope.tableData.tableId,
		sql:sql.read_table_config(),
		afterRead:function(response){
			$scope.tableData.list = response.data.list
			read_j2c_table($scope.tableData, $scope)
			console.log($scope.tableData)
			var o = $scope.tableData
			o.pl = {}
			o.pl_data = {}
			$scope.date.setDay_pl_data(o)
			o.pl_data.sql = sql.read_table_day_date_desc().replace(':read_table_sql',
				o.config.sql_read_table_data
			)
			o.pl_data.afterRead=function(){
				console.log(o.pl)
			}
			readSql(o.pl_data, o.pl)

		}
	})

})

