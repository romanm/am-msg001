app.controller('myCtrl', function($scope, $http) {
	initApp($scope, $http)
    $scope.firstName= "John";
    $scope.lastName= "Doe";

	$scope.$watch('patientList.seek',function(newValue){ if(true){
		console.log(newValue)
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
//    				console.log($scope.patientList.pl.sql)
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
