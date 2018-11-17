app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	initConfig($scope, $http, $interval)
	initFilter($scope, $http)
	console.log('--------5------------')
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
			$scope.date.setDay_to_obj(o.pl_data)
//			$scope.date.setDay_pl_data(o)
			o.pl_data.sql = sql.read_table_day_date_desc()
			.replace(':read_table_sql',o.config.sql_read_table_data)
			var sqlGroup = sql.read_table_group_col('col_237')
			o.pl_data.sql = sqlGroup.replace(':read_table_sql',o.pl_data.sql)
			//console.log(o.pl_data.sql)
			o.pl_data.afterRead=function(){
				console.log(o.pl)
			}
			readSql(o.pl_data, o.pl)
			o.pl_sum = {}
			o.pl_data_sum = {}
			o.pl_data_sum.sql = "SELECT " +
					"sum(sum) sum, count(sum) cnt, sum(cnt) sum_cnt, count(cnt) cnt_cnt FROM ( " + o.pl_data.sql + " ) x"
			$scope.date.setDay_to_obj(o.pl_data_sum)
			readSql(o.pl_data_sum, o.pl_sum)
		}
	})

})

