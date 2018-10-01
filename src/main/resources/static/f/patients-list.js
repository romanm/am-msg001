app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
    $scope.firstName= "John";
    $scope.lastName= "Doe";
    $scope.random3=getRandomInt(3)

    $scope.lastDbRead = {
    	timeout : 5*60*1000,
    	lastCallTime : new Date(),
    	importCnt:0,
    	requestToImport:{
    		url:'/li159-10',
			then_fn:function(response){
				$scope.lastDbRead.importCnt++
				if(!$scope.dataToImport || response.data.max>$scope.dataToImport.max){
					$scope.dataToImport = response.data
					console.log($scope.dataToImport)
					$scope.callDbImport()
				}
			},
    	},
    	afterRead : function(){
//    		this.importCnt++
    		this.maxInDB = this.list[0].max
    		console.log($filter('date')(new Date(this.maxInDB), 'medium'))
    		if($scope.dataToImport.max>this.maxInDB){
    			console.log('--------importToDb-------------')
    		}
//    		exe_fn.httpGet($scope.lastDbRead.requestToImport)
    	},
    	reread:function(){
    		console.log($filter('date')(new Date(this.maxInDB), 'medium'))
    		exe_fn.httpGet($scope.lastDbRead.requestToImport)
    	},
    }
    exe_fn.httpGet($scope.lastDbRead.requestToImport)
    $interval( function(){ exe_fn.httpGet($scope.lastDbRead.requestToImport) }, $scope.lastDbRead.timeout)
    $scope.callDbImport = function() {
    	if($scope.patientList){
    	if($scope.patientList.pl){
    		$scope.lastDbRead.lastCallTime = new Date()
    		$scope.lastDbRead.sql =
    			 sql.read_table_max_min_date()
    	    		.replace(':read_table_sql',$scope.patientList.pl.sql)
    		readSql($scope.lastDbRead)
    	}
    	}
    }
//    $interval( function(){ $scope.callDbImport(); }, $scope.lastDbRead.timeout)

    
	$scope.$watch('patientList.seek',function(newValue){ if(true){
		if($scope.patientList.pl){
			var data = {
				seek :'%'+newValue+'%',
				sql : sql.read_table_seek().replace(':read_table_sql',$scope.patientList.pl.sql),
			}
			readSql(data, $scope.patientList.pl)
		}
	}})

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
    				console.log($scope.patientList.pl.list.length)
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
				" OR LOWER(col_238) LIKE LOWER(:seek) " +
				" OR LOWER(col_239) LIKE LOWER(:seek) " +
				" OR LOWER(col_240) LIKE LOWER(:seek) " +
				" OR LOWER(col_241) LIKE LOWER(:seek) " +
				" OR LOWER(col_242) LIKE LOWER(:seek) " +
				""
	},
	read_table_max_min_date:function(){
		return "SELECT min(col_236) min, max(col_236) max, count(*) FROM (" +
				":read_table_sql" +
				") x"
	},
	read_table_sql:function(){
		return "SELECT * FROM docbody where docbody_id in ( \n" +
				"SELECT doc_id FROM doc where doctype=19 and parent = :tableId)"
	},
}
