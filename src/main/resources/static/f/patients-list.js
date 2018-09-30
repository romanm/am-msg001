app.controller('myCtrl', function($scope, $http) {
	initApp($scope, $http)
    $scope.firstName= "John";
    $scope.lastName= "Doe";

	$scope.$watch('patientList.seek',function(newValue){ if(true){
		if($scope.patientList.pl){
			var data = {
				seek :'%'+newValue+'%',
				sql : sql.read_table_seek().replace(':read_table_sql',$scope.patientList.pl.sql),
			}
			readSql(data, $scope.patientList.pl)
		}
	}})

    $scope.random3=getRandomInt(3)
    $scope.patientList
    = {
    	tableId:235,
    	sql:sql.read_table_sql(),
    	afterRead:function(){
    		$scope.patientList.pl = {
    			sql:$scope.patientList.list[0].docbody,
    			afterRead:function(){
    				console.log($scope.patientList)
    				$scope.patientList.rowMap = {}
    				angular.forEach($scope.patientList.pl.list, function(v){
    					$scope.patientList.rowMap[v.row_id] = v
    				})
    			}
    		}
    		readSql($scope.patientList.pl)
    	},
    	col_keys:{
    		col_236:'дата-час обстеженя',
    		col_237:' ПІП ',
    		col_238:' аппарат ',
    		col_239:' дослідження ',
    		col_240:' вартість ',
    		col_241:' лікар ',
    		col_242:' ЗОЗ направленя ',
    	}
    }
    readSql($scope.patientList)
    $scope.pageVar = {
		saveUpdate:function(){
			this.o.col_240 = this.price
		},
		openEditRow:function(o){
			this.ngStyleModal = {display:'block'}
			if(this.row_id != o.row_id){
				this.price = o.col_240
				this.o = o
				this.row_id = o.row_id
			}
		}
	}
});

var sql = {
	read_table_seek:function(){
		return "SELECT * FROM ( " +
				":read_table_sql" +
				" ) x WHERE LOWER(col_237) LIKE LOWER(:seek)" +
				" OR LOWER(col_240) LIKE LOWER(:seek)"
	},
	read_table_sql:function(){
		return "SELECT * FROM docbody where docbody_id in ( \n" +
				"SELECT doc_id FROM doc where doctype=19 and parent = :tableId)"
	},
}
