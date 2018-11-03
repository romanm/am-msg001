var initFilter = function($scope, $http){
	console.log('initFilter')
	$scope.filter = {}
	$scope.filter.filterOnPayment = function(sourceObject,addObjectName){
		this.sql = $scope.patientList.config.sql_read_table_data
		console.log(this.payment_privilege)
		if(this.minPayment && !this.maxPayment){
			this.maxPayment = 99999
		}else
		if(!this.minPayment && this.maxPayment){
			this.minPayment = 1
		}
		if(this.minPayment && this.maxPayment){
			this.sql = sql.read_table_payment().replace(':read_table_sql',this.sql)
		}
		if(this.payment_privilege){
			this.sql = sql.read_table_privilege().replace(':read_table_sql',this.sql)
		}
		if(this.apparat_type){
			this.sql = sql.read_table_apparat_type().replace(':read_table_sql',this.sql)
		}
		if(this.payment_type){
			console.log(this.payment_type)
			if('ІНШЕ'==this.payment_type){
				console.log(sql.read_table_payment_type2())
				this.sql = sql.read_table_payment_type2().replace(':read_table_sql',this.sql)
			}else{
				this.sql = sql.read_table_payment_type().replace(':read_table_sql',this.sql)
			}
//			this.sql = sql.read_table_payment_type().replace(':read_table_sql',this.sql)
		}
		if(this.fromDate_ts){
			this.fromDate_sql = this.fromDate_ts.toISOString().split('T')[0]
			console.log(this.fromDate_sql)
			if(!this.toDate){
				this.toDate_ts = new Date(this.fromDate_ts)
			}
			console.log(this.toDate_ts)
			this.toDate_ts.setDate(this.toDate_ts.getDate()+1)
			this.toDate_sql = this.toDate_ts.toISOString().split('T')[0]
			this.sql = sql.read_table_betweenDates().replace(':read_table_sql',this.sql)
		}
		if(this.group){
			this.sql = sql.read_table_group_col(this.group).replace(':read_table_sql',this.sql)
		}
		console.log(this)
	//	console.log(this.sql)
		if($scope.patientList.pl)
			$scope.patientList.pl.afterRead = function(response){
//				console.log(response.data)
				console.log($scope.patientList.pl)
				if(sourceObject){
					sourceObject[addObjectName] = 
						response.data
				}
			}
		readSql(this, $scope.patientList.pl)
	}
}
