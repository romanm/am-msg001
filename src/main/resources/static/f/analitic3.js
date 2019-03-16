app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	initConfig($scope, $http, $interval)
	initFilter($scope, $http)
	$scope.filter.fromDate = ''+new Date().getDate()

	console.log($scope,$scope.filter)
	readSql({
		sql:sql.read_table_config()+' AND doctype=19',
		tableId:235,
		afterRead:function(response){
			$scope.table_sql = response.data.list[0].docbody
			$scope.patientList.config.sql_read_table_data = response.data.list[0].docbody
			//console.log(sql.read_table_day_date_desc(), '\n-\n', $scope.table_sql)
		}
	})
	$scope.patientList = {}
	$scope.patientList.config = {}

	$scope.patientList.col_group_keys={
		group_name:'імʼя групи',
		cnt:'кількість',
		sum:'cумма',
	}

	$scope.patientList.col_keys={
		col_236:'дата-час обстеженя',
		col_237:' П.І.Б.',
		col_238:' аппарат ',
		col_239:' дослідження ',
		col_240:' вартість ',
		col_241:' лікар ',
		col_242:' ЗОЗ направленя ',
	}

})

var initFilter = function($scope, $http){
	console.log(' - initFilter - ')
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
		console.log(123, this.fromDate_ts, this.fromDate)
		if(!this.fromDate_ts){
			$scope.filter.checkDate('fromDate')
			$scope.filter.blurDate('fromDate')
			console.log(123, this.fromDate_ts, this.fromDate)
		}
		if(this.fromDate_ts){
			console.log(234)
			this.fromDate_sql = this.fromDate_ts.toISOString().split('T')[0]
			if(!this.toDate){
				this.toDate_ts = new Date(this.fromDate_ts)
			}
			this.toDate_ts.setDate(this.toDate_ts.getDate()+1)
			this.toDate_sql = this.toDate_ts.toISOString().split('T')[0]
			console.log(this.fromDate_sql, this.toDate_sql)
			this.sql = sql.read_table_betweenDates().replace(':read_table_sql',this.sql)
		}
		if(this.group){
			this.sql = sql.read_table_group_col(this.group).replace(':read_table_sql',this.sql)
			console.log(this.group, '\n', this.sql)
		}
//		console.log(this)
//		console.log(this.sql)
		var thisO = this
		$scope.patientList.pl = {}
		$scope.patientList.pl.afterRead = function(response){
//			console.log(response.data)
			console.log($scope.patientList.pl)
			if(thisO.group){
				$scope.patientList.pl.calcAll = {cnt:0,sum:0,}
				angular.forEach($scope.patientList.pl.list, function(v){
					$scope.patientList.pl.calcAll.cnt += v.cnt
					$scope.patientList.pl.calcAll.sum += v.sum
				})
			}
			if(sourceObject){
				sourceObject[addObjectName] = 
					response.data
			}
		}
		readSql(this, $scope.patientList.pl)
		console.log($scope.patientList.pl)
	}
	
	$scope.filter.filterGroup = function(col_nnn){
		console.log(col_nnn)
		if(this.group != col_nnn)
			this.group = col_nnn
		else
			this.group = null
	}

	$scope.filter.blurDate = function(dateName){
		var date = this.checkDate(dateName)
		if(!date)
			return
		var s = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear()
		this[dateName+'_ts'] = date
		this[dateName] = s
	}
	$scope.filter.checkDate = function(dateName){
		var date = new Date()
		date.setHours(10)
		var checkDate = this[dateName]
		console.log(checkDate)
		if(!checkDate)
			return
		checkDate = checkDate.replace(/-/g,' ')
		var checkDateSplit = checkDate.split(' ')
		if(checkDateSplit[1]){
			var m = checkDateSplit[1]*1-1
			date.setMonth(m)
	//			date.setDate(checkDateSplit[2])
		}
		date.setDate(checkDateSplit[0])
		console.log(date.toISOString())
		return date
	}
	$scope.filter.filterOnPaymentClean = function(){
		this.maxPayment = null
		this.minPayment = null
	}
	$scope.filter.filterOnDateClean = function(){ 
		delete this.fromDate
		delete this.toDate
		delete this.fromDate_ts
		delete this.toDate_ts
	}
	$scope.filter.filterOnPrivilegeClean = function(){
		this.payment_privilege = null
	}
	$scope.filter.filterOnPayTypeClean = function(){
		this.payment_type = null
	}
	$scope.filter.filterOnApparatClean = function(){
		this.apparat_type = null
	}

	$scope.filter.filterToExcellCsv = function(){
		console.log(123)
		$scope.filter.filterToWinExcellCsv()
	}
	$scope.filter.filterToWinExcellCsv = function(){
		var csvFile = ''
//		angular.forEach($scope.patientList.col_keys, function(v,k){
//			csvFile += v.trim()+';'
////			csvFile += v.trim()+','
//		})
//			console.log($scope.patientList.config.json_create_table)
		angular.forEach($scope.patientList.config.json_create_table, function(vCol,kn){
//			console.log(vCol)
			if(vCol.fieldname)
			csvFile += vCol.fieldname.trim()+';'
		})
		csvFile += '\r\n'
		console.log($scope.patientList.config.json_create_table)
		angular.forEach($scope.patientList.pl.list, function(v){
			angular.forEach($scope.patientList.config.json_create_table, function(vCol,kn){
				var k = 'col_'+kn
			//angular.forEach($scope.patientList.col_keys, function(vCol,k){
				var vC
				if(typeof(v[k])=='string')
					if(v[k].indexOf(';')>=0)
						vC = '"'+v[k].trim()+'"'
					else
						vC = v[k].trim()
				else if(k=='col_236')
					vC = $filter('date')(new Date(v[k]), 'yyyy-MM-dd HH:mm')
				else if(v[k])
					vC = v[k]
				else
					vC = ''
				csvFile += vC+';'
//				csvFile += vC+','
			})
			csvFile += '\r\n'
		})
//		console.log(csvFile)
		var ts = new Date().toISOString().split('\.')[0]
//		loadVarAsFile(csvFileUTF16, 'export-'+ts+'.csv', 'text/csv;charset=UTF-16LE;')
//		console.log(ts)
//		console.log('\uFEFF'+csvFile)
//		console.log(ts)
		loadVarAsFile('\uFEFF'+csvFile, 'export-'+ts+'.csv', 'text/csv;charset=utf-8')
	}
	
}

sql.read_table_betweenDates=function(){
	return "SELECT * FROM ( " +
	":read_table_sql " +
	" ) x WHERE col_236 BETWEEN :fromDate_sql AND :toDate_sql "
}
sql.read_table_payment=function(){
	return "SELECT * FROM ( " +
	":read_table_sql " +
	" ) x WHERE col_240 > :minPayment AND col_240 <= :maxPayment "
}
sql.read_table_privilege=function(){
	return "SELECT * FROM ( " +
	":read_table_sql " +
	" ) x WHERE col_5218 = :payment_privilege"
}

sql.read_table_payment_type=function(){
	return "SELECT * FROM ( " +
	":read_table_sql " +
	" ) x WHERE col_18972 = :payment_type"
}
sql.read_table_payment_type2=function(){
	return "SELECT * FROM ( " +
	":read_table_sql " +
	" ) x WHERE col_18972 = 'ІНШЕ' OR col_18972 IS NULL"
}
sql.read_table_apparat_type=function(){
	return "SELECT * FROM ( " +
	":read_table_sql " +
	" ) x WHERE col_238 = :apparat_type"
}
