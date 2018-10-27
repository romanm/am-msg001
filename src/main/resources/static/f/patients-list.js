app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)

	if(true || 'analytics'==pathNameValue){
		$scope.db_validation = {
			removeDupletRows:function(){
				var data = {
					sql : sql.duplet_rows_remove(),
					dataAfterSave:function(response){
						console.log(response)
					}
				}
				writeSql(data)
			},
			duplet_rows_count:null,
			sql:sql.duplet_rows_count(),
			afterRead:function(response){
				this.duplet_rows_count = 
					response.data.list[0].cnt
			}
		}
		readSql($scope.db_validation)
	}

	$scope.ekkr = {}
	$scope.ekkr.config = {}
	$scope.ekkr.config.change_addPaymentId = function(){
		$scope.ekkr.config.newPaymentId
			= $scope.ekkr.config.currentPaymentId
			+ $scope.ekkr.config.addPaymentId
	}
	$scope.ekkr.config.set_newPaymentId = function(){
		delete $scope.ekkr.config.addPaymentId
		if($scope.ekkr.config.newPaymentId
		> $scope.ekkr.config.currentPaymentId
		) writeSql({
				sql : 'ALTER SEQUENCE paymentid RESTART WITH '
					+ $scope.ekkr.config.newPaymentId,
					dataAfterSave:function(response){
						$scope.ekkr.config.read_paymentId()
					}
			})
	}
	$scope.ekkr.config.read_paymentId = function(){
		$scope.ekkr.config.ask_paymentId("SELECT CURRVAL('paymentId')", "currentPaymentId")
	}
	$scope.ekkr.config.ask_paymentId = function(sql, sql_var){
		readSql({
			sql:sql+" "+sql_var,
			afterRead:function(response){
				$scope.ekkr.config[sql_var] 
				= response.data.list[0][sql_var]
				$scope.ekkr.config.newPaymentId
				= $scope.ekkr.config[sql_var]
			},
		})
	}
	$scope.ekkr.config.change_paymentId = function(){
		this.config_tab_click('sequence_paymentId')
		if(this.config_tab == 'sequence_paymentId')
			$scope.ekkr.config.read_paymentId()
	}
	$scope.ekkr.config.config_tab_click = function(tab){
		if(this.config_tab == tab)
			this.config_tab = null
		else
			this.config_tab = tab
	}
	$scope.ekkr.zReport = function(){ $scope.ekkr.xzReport('/getZReport2') }
	$scope.ekkr.xReport = function(){ $scope.ekkr.xzReport('/getXReport2') }
	$scope.ekkr.xzReport = function(url){
		console.log('--xzReport------------'+url)
		exe_fn.httpGet({
			url:url,
			then_fn:function(response){
				console.log(response.data)
			},
			error_fn:function(response){
				console.error('-----error-----------')
				$scope.ekkr.error = response.data
				console.error(response.data)
			},
		})
	}

	$scope.gui = {
		filterOnDate:'виборка по даті:',
		filterOnPrivilege:'виборка по пільгам:',
		filterOnPayment:'виборка по платежу:',
	}

	$scope.filter = {}
	
	$scope.filter.filterOnPrivilegeClean = function(){
		this.payment_privilege = null
	}
	$scope.filter.filterOnDateClean = function(){ }
	$scope.filter.filterOnPaymentClean = function(){
		this.maxPayment = null
		this.minPayment = null
	}
	$scope.filter.filterToExcellCsv = function(){
		var csvFile = ''
		angular.forEach($scope.patientList.col_keys, function(v,k){
			csvFile += v.trim()+','
		})
		csvFile += '\r\n'
		angular.forEach($scope.patientList.pl.list, function(v){
			angular.forEach($scope.patientList.col_keys, function(vCol,k){
				var vC
				if(typeof(v[k])=='string')
					if(v[k].indexOf(',')>0)
						vC = '"'+v[k].trim()+'"'
					else
						vC = v[k].trim()
				else if(k=='col_236')
					vC = $filter('date')(new Date(v[k]), 'yyyy-MM-dd HH:mm')
				else if(v[k])
					vC = v[k]
				else
					vC = ''
				csvFile += vC+','
			})
			csvFile += '\r\n'
		})
//		console.log(csvFile)
		
		loadVarAsFile(csvFile, 'exportCsv', 'text/csv;charset=utf-8')
	}
	$scope.filter.filterOnPayment = function(){
		this.sql = $scope.patientList.config.sql_read_table_data
		console.log(this.payment_privilege)
		if(this.minPayment && this.maxPayment){
			this.sql = sql.read_table_payment().replace(':read_table_sql',this.sql)
		}
		if(this.payment_privilege){
			this.sql = sql.read_table_privilege().replace(':read_table_sql',this.sql)
		}
	//		console.log(this)
		console.log(this.sql)
		readSql(this, $scope.patientList.pl)
	}
	$scope.filter.blurDate = function(dateName){
		var date = this.checkDate(dateName)
		console.log(date)
		var s = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear()
		console.log(s)
		this[dateName+'_ts'] = date
		this[dateName] = s
	}
	$scope.filter.checkDate = function(dateName){
		var date = new Date()
		date.setHours(10)
		var checkDate = this[dateName]
		console.log(checkDate)
		checkDate = checkDate.replace(/-/g,' ')
		var checkDateSplit = checkDate.split(' ')
		console.log(checkDateSplit)
		date.setDate(checkDateSplit[0])
		if(checkDateSplit[1]){
			var m = checkDateSplit[1]*1-1
			console.log(m)
			date.setMonth(m)
	//			date.setDate(checkDateSplit[2])
		}
		console.log(date.toISOString())
		return date
	}

	$scope.date = {
		today : new Date(),
		seekDay : new Date(),
		addDayUrl:function(addDay){
			if($scope.request.parameters.addDay)
				return addDay + $scope.request.parameters.addDay*1
			return addDay
		},
		setDay_pl_data:function(){
			$scope.patientList.pl_data.year=$scope.date.seekDay.getFullYear()
			$scope.patientList.pl_data.month=$scope.date.seekDay.getMonth()+1
			$scope.patientList.pl_data.day=$scope.date.seekDay.getDate()
		},
		seekDayReadSql:function(){
			this.setDay_pl_data()
			readSql($scope.patientList.pl_data, $scope.patientList.pl)
		},
		addDayToSeekDay:function(addDay){
			this.seekDay.setDate(this.seekDay.getDate() + addDay)
		},
	}

$scope.lastDbRead = {
	timeout : 15*60*1000,
	lastCallTime : new Date(),
	importCnt:0,
	requestToImport:{
//		url:'/f/js/li159-10-test1.json',
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
//		this.importCnt++
		this.maxInDB = this.list[0].max
		console.log($filter('date')(new Date(this.maxInDB), 'medium'))
		console.log($scope.dataToImport.max)
		if($scope.dataToImport.max>this.maxInDB){
			console.log('--------importToDb-------------')
			var i = 0
			angular.forEach($scope.dataToImport.rows, function(rowObj){
				if(true || i++<1){
//					console.log(rowObj)
					var col_data = $scope.patientList.config.json_create_table
					col_data.nextDbIdCounter = 3
					col_data.sql_row = ''
//					console.log(col_data)
					rowObj.col_236 = $filter('date')(new Date(rowObj.visit_ts), 'yyyy-MM-ddTHH:mm')
					rowObj.col_237 = rowObj.patient_pip
					rowObj.col_238 = rowObj.cabinet.split(' ')[1]
					rowObj.col_239 = rowObj.examination
					rowObj.col_241 = rowObj.physician
					rowObj.col_242 = rowObj.referral
					rowObj.col_415 = rowObj.sales
					/build_sqlJ2c_row_insert(rowObj, col_data)
					var data = {
						sql:col_data.sql_row,
						table_id:col_data.table_id,
					}
//					console.log(data)
					writeSql(data)
				}
			})
		}
//		exe_fn.httpGet($scope.lastDbRead.requestToImport)
	},
	reread:function(){
		console.log($filter('date')(new Date(this.maxInDB), 'medium'))
		exe_fn.httpGet($scope.lastDbRead.requestToImport)
	},
}


$scope.callDbImport = function() {
	if($scope.patientList){
		if($scope.patientList.pl){
			$scope.lastDbRead.lastCallTime = new Date()
			console.log($scope.patientList.pl)
			console.log($scope.patientList.pl.sql)
			$scope.lastDbRead.sql =
				sql.read_table_max_min_date()
				.replace(':read_table_sql',$scope.patientList.config.sql_read_table_data)
				readSql($scope.lastDbRead)
		}
	}
}
//	$interval( function(){ $scope.callDbImport(); }, $scope.lastDbRead.timeout)

	$scope.$watch('patientList.seek',function(newValue){ if(true){
		if($scope.patientList.pl){
			var data = {
				seek :'%'+newValue+'%',
				sql : sql.read_table_seek().replace(':read_table_sql',$scope.patientList.config.sql_read_table_data),
			}
			readSql(data, $scope.patientList.pl)
		}
	}})

	$scope.patientList = {
		tableId:235,
		sql:sql.read_table_config(),
		config:{},
		afterRead:function(){
			angular.forEach($scope.patientList.list, function(v){
				if(19==v.doctype)
					$scope.patientList.config.sql_read_table_data = v.docbody
				if(20==v.doctype)
					$scope.patientList.config.json_create_table = JSON.parse(v.docbody)
			})
			var sql_table_data =
				sql.read_table_day_date_desc().replace(':read_table_sql',
					$scope.patientList.config.sql_read_table_data
				)
//			console.log(sql_table_data)
			$scope.patientList.pl = {}
			$scope.patientList.pl_data = {
				sql:sql_table_data,
				afterRead:function(){
					console.log($scope.patientList.pl)
					$scope.patientList.rowMap = {}
					console.log($scope.patientList.pl.list.length)
					angular.forEach($scope.patientList.pl.list, function(v){
						$scope.patientList.rowMap[v.row_id] = v
					})
				}
			}
			if($scope.request.parameters.addDay) {
				$scope.date.addDayToSeekDay($scope.request.parameters.addDay*1)
			}
			$scope.date.setDay_pl_data()
			readSql($scope.patientList.pl_data, $scope.patientList.pl)
		},
		col_keys:{
			col_236:'дата-час обстеженя',
			col_237:' П.І.Б.',
			col_238:' аппарат ',
			col_239:' дослідження ',
			col_240:' вартість ',
			col_241:' лікар ',
			col_242:' ЗОЗ направленя ',
		},
	}
	readSql($scope.patientList)

	$scope.pageVar = {}
	$scope.pageVar.getCheckFile = function(){
		if(!this.o)
			return ''
		//return this.o.row_id 
		return $scope.ekkr.config.nextPaymentId
		+'|' + this.o.col_239 
		+' |' + this.toPay() + '|'
	}
	
	$scope.pageVar.makeCheckFile = function(){
		$scope.ekkr.config.ask_paymentId("SELECT NEXTVAL('paymentId')", "nextPaymentId")
	}
	$scope.pageVar.saveCheckFile = function(){
		
		console.log(this.o)
		var csv = this.getCheckFile()

//		var bom = decodeURIComponent("%EF%BB%BF");// "\uFEFF\n";
//		var byteArray = [];
//		csv = bom + csv;

		var csvA = new Uint16Array(csv.split('').map( function(k, v){
			return k.charCodeAt(0);
		}));

		this.o.saveCheckFile = csvA

//		filename = '/home/roman/algoritmed/git-1/am-msg001-config/check',
		var blob = new Blob([this.o.saveCheckFile], {type: 'text/csv;charset=UTF-16LE;'}),
//		var blob = new Blob([this.o.saveCheckFile], {type: 'text/csv;charset=utf-16'}),
//		var blob = new Blob([this.o.saveCheckFile], {type: 'text/plain;charset=utf-16'}),
//		var blob = new Blob([this.o.saveCheckFile], {type: "text/plain;charset=utf-8"});
		filename = 'chek.txt',
		e = document.createEvent('MouseEvents'),
		a = document.createElement('a')

		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(blob, filename);
		}
		else{
			var e = document.createEvent('MouseEvents'),
			a = document.createElement('a');

			a.download = filename;
			a.href = window.URL.createObjectURL(blob);
			a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
			e.initEvent('click', true, false, window,
					0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(e);
		}

		exe_fn.httpPost({ url:'/saveCheckFile',
			then_fn:function(response) {
				console.log(response.data)
			},
			data:this.o,
		})
	}

	$scope.pageVar.paymentData_F_P = {no:1}
	$scope.pageVar.saveEKKR = function(){
		console.log(345)
	}
	$scope.pageVar.saveUpdate = function(){
		this.o.col_240 = this.price
		this.o.col_3311 = this.procent
		this.o.col_5218 = this.payment_privilege
		var col_data = {}
		col_data.nextDbIdCounter = 3
		col_data.sql_row = ''
		col_data[240] = $scope.patientList.config.json_create_table[240]
		col_data[3311] = $scope.patientList.config.json_create_table[3311]
		col_data[5218] = $scope.patientList.config.json_create_table[5218]
		var rowObj = this.o
		angular.forEach(col_data, function(v_col_type,n){
			var k = 'col_'+n
			var v = rowObj[k]
			console.log(n+'/'+k)
			build_sqlJ2c_cell_write(v,k,n,col_data,rowObj)
		})
		col_data.sql_row += sql.read_table_one_row()
			.replace(':read_table_sql',$scope.patientList.config.sql_read_table_data)
		var data = {
			sql : col_data.sql_row,
			row_id : rowObj.row_id,
			dataAfterSave: function(response){
				var list = response.data.list1
				|| response.data.list2
				|| response.data.list3
				|| response.data.list4
				|| response.data.list5
				|| response.data.list6
				$scope.pageVar.o = list[0]
			},
		}
		writeSql(data)
	}
	$scope.pageVar.saveUpdate2 = function(){
		var toPay = this.toPay()
		var service = this.o.col_239
		var code = $scope.ekkr.config.nextPaymentId
		var paymentData = {
			F:[
				{S:{
					code:code,
					price:toPay,
					name:service,
					tax:5,
				}},
				{P:{no:$scope.pageVar.paymentData_F_P.no}},
			],
			IO:[
				{IO:{sum:toPay}},
			],
		}
		var C = {C:{cm:'КАСИР: Касир 1'}}
		paymentData.F.push(C)
		paymentData.IO.push(C)
		console.log(paymentData)
		exe_fn.httpPost
		({ url:'/toPaymentApparatus2',
			then_fn:function(response) {
				console.log(response.data)
			},
			error_fn:function(response) {
				console.error('---error----помилка-------')
				console.error(response.data)
			},
			data:paymentData,
		})
	}

	$scope.pageVar.toPay = function(){
		return this.price-(this.price*this.procent/100)
	}

	$scope.pageVar.openEditRow = function(o){
		$scope.ekkr.config.ask_paymentId("SELECT NEXTVAL('paymentId')", "nextPaymentId")
		this.ngStyleModal = {display:'block'}
		console.log(o)
		this.payment_privilege = o.col_5218
		console.log(this)
		//console.log($scope.patientList.config.json_create_table)
		if(this.row_id != o.row_id){
			this.price = o.col_240
			this.procent = o.col_3311
			this.o = o
			this.row_id = o.row_id
		}
		$scope.priceCalcHelpData = {}
	//			console.log($scope.priceCalcHelpData)
	//			console.log(o.col_239)
		$scope.priceCalcHelpData.examination = {}
		readSql({
				examination:o.col_239,
				sql:sql.read_examination_prices(),
			},
			$scope.priceCalcHelpData.examination
		)
		$scope.priceCalcHelpData.destination = {}
		console.log(sql.read_examination_prices())
		console.log(o.col_242)
		readSql({
			destination:o.col_242,
			sql:sql.read_destination_procents(),
		}, $scope.priceCalcHelpData.destination)

	}

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

			exe_fn.httpGet($scope.lastDbRead.requestToImport)
			$interval( function(){ exe_fn.httpGet($scope.lastDbRead.requestToImport) }, $scope.lastDbRead.timeout)

		},
	})

	$scope.random3=getRandomInt(3)
});

var sql = {
	table_data_row_insert:function(){
		return "INSERT INTO doc (doc_id, parent, doctype) VALUES (:nextDbId1 , :table_id , 4) ;"
	},
	table_data_cell_update:function(){
		return "UPDATE :fieldtype SET value =:value WHERE :fieldtype_id=:cell_id ;"
	},
	table_data_cell_insert:function(){
		return "INSERT INTO doc (doc_id, parent, reference, doctype) VALUES (:nextDbId2, :row_id , :column_id,  5) ;" +
		"INSERT INTO :fieldtype (value,:fieldtype_id) VALUES (:value, :nextDbId2 ) ;"
	},
	read_destination_procents:function(){
		return "SELECT * FROM ( SELECT COUNT(value) cnt, value FROM ( SELECT d.* FROM ( \n" +
		"SELECT * FROM doc, integer WHERE reference =3311 AND doc_id=integer_id \n" +
		") d, ( \n" +
		"SELECT * FROM doc, string WHERE reference =242 AND doc_id=string_id AND value = :destination \n" +
		") x WHERE x.parent=d.parent ) x GROUP BY value ) x ORDER BY cnt DESC"
	},
	read_examination_prices:function(){
		return "SELECT * FROM ( " +
		"SELECT COUNT(value) cnt, value FROM ( " +
		"SELECT d.* FROM ( \n" +
		"SELECT * FROM doc, integer WHERE reference =240 AND doc_id=integer_id \n" +
		") d, (" +
		"SELECT * FROM doc, string WHERE reference =239 AND doc_id=string_id AND value = :examination \n" +
		") x " +
		"WHERE x.parent=d.parent " +
		") x GROUP BY value " +
		") x ORDER BY cnt DESC"
	},
	read_table_one_row:function(){
		return "SELECT * FROM ( \n" +
		":read_table_sql " +
		" ) x WHERE row_id = :row_id"
	},
	read_table_privilege:function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_5218 = :payment_privilege"
	},
	read_table_payment:function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_240 > :minPayment AND col_240 <= :maxPayment "
	},
	read_table_seek:function(){
		return "SELECT * FROM ( " +
		":read_table_sql" +
		" ) x WHERE LOWER(col_237) LIKE LOWER(:seek)" +
		" OR LOWER(col_238) LIKE LOWER(:seek) " +
		" OR LOWER(col_239) LIKE LOWER(:seek) " +
		" OR LOWER(col_240) LIKE LOWER(:seek) " +
		" OR LOWER(col_241) LIKE LOWER(:seek) " +
		" OR LOWER(col_242) LIKE LOWER(:seek) " +
		" ORDER BY col_236 DESC"
	},
	read_table_day_date_desc:function(){
		return "SELECT * FROM ( \n" +
		":read_table_sql " +
		") x WHERE MONTH(col_236)=:month AND YEAR(col_236)=:year AND DAY(col_236)=:day ORDER BY col_236 DESC"
	},
	read_table_date_desc:function(){
		return "SELECT * FROM ( \n" +
		":read_table_sql" +
		") x ORDER BY col_236 DESC"
	},
	read_table_max_min_date:function(){
		return "SELECT min(col_236) min, max(col_236) max, count(*) FROM (" +
		":read_table_sql" +
		") x"
	},
	read_table_config:function(){
		return "SELECT * FROM doc d, docbody s \n" +
		"WHERE parent = :tableId AND s.docbody_id=d.doc_id AND doctype!=4"
	},
	duplet_rows_count:function(){
		return "SELECT count(*) cnt FROM (" +
		this.duplet_rows() +
		") x"
	},
	duplet_rows_remove:function(){
		return "DELETE FROM doc WHERE parent IN (" + this.duplet_rows() +");\n" +
		"DELETE FROM doc WHERE doc_id IN (" + this.duplet_rows() +");\n" +
		"DELETE FROM doc WHERE doc_id IN (" +
		"SELECT d.doc_id FROM doc d LEFT JOIN doc d2 ON d2.parent=d.doc_id " +
		"WHERE d.parent = 235 AND d.doctype=4 AND d2.doc_id IS NULL " +
		");"
	},
	duplet_rows:function(){
		return "SELECT max FROM ( " +
		"SELECT * FROM ( " +
		"SELECT MIN(doc_id) min, MAX(doc_id) max, COUNT(value) cnt, value  FROM ( " +
		"SELECT d2.*, ts.* FROM timestamp ts, doc d1, doc d2 " +
		"WHERE d2.parent=235 AND d2.doctype=4 AND d2.doc_id=d1.parent AND d1.doc_id=timestamp_id " +
		") x GROUP BY value " +
		") x WHERE min!=max " +
		") x " +
		"LEFT JOIN (SELECT d2.*, i.* FROM integer i, doc d1, doc d2 " +
		"WHERE d1.reference=240 AND d2.parent=235 AND d2.doctype=4 AND d2.doc_id=d1.parent AND d1.doc_id=integer_id) y ON max=y.doc_id " +
		"LEFT JOIN (SELECT d2.*, i.* FROM integer i, doc d1, doc d2 " +
		"WHERE d1.reference=240 AND d2.parent=235 AND d2.doctype=4 AND d2.doc_id=d1.parent AND d1.doc_id=integer_id) z ON max=z.doc_id " +
		"WHERE z.doc_id IS NULL AND y.doc_id IS NULL "
	},
}

var sql_1c = sql

