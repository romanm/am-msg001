app.controller('myCtrl', function($scope, $http, $interval, $filter) {
	initApp($scope, $http)
	initConfig($scope, $http, $interval)
	initFilter($scope, $http)

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
	//console.log(sql.duplet_rows_count())
	readSql($scope.db_validation)

	$scope.ekkr = {}
	if('ekkr'==$scope.request.pathNameValue){
		$scope.cgi_chk_X_report = {
			sum:0,
			carte:0,
			cash:0,
			safe:0,
			safe_minus:0,
			safe_minus_sum:0,
		}
		$scope.cgi_chk_X_report.codeMap={}

		console.log($scope.cgi_chk_X_report)
		exe_fn.httpGet({
			url:'/cgi_chk',
			then_fn:function(response){
				$scope.cgi_chk = response.data
				console.log($scope.cgi_chk_X_report)
				angular.forEach($scope.cgi_chk, function(chk){
					console.log(chk)
					if(chk.IO){
						$scope.cgi_chk_X_report.safe_minus_sum
						+= chk.IO[1].IO.sum
					}else
					if(chk.F){
						$scope.cgi_chk_X_report.codeMap[chk.F[0].S.code]=chk
						if(1==chk.F[1].P.no){
							$scope.cgi_chk_X_report.cash
							+= chk.F[1].P.sum
						}else
						if(4==chk.F[1].P.no){
							$scope.cgi_chk_X_report.carte
							+= chk.F[1].P.sum
						}
						$scope.cgi_chk_X_report.sum
							+= chk.F[1].P.sum
					}
				})
				$scope.cgi_chk_X_report.safe
				= $scope.cgi_chk_X_report.sum
				- $scope.cgi_chk_X_report.carte
				+ $scope.cgi_chk_X_report.safe_minus_sum
				console.log($scope.cgi_chk_X_report)
				console.log($scope.cgi_chk_X_report.codeMap)
				console.log(Object.keys($scope.cgi_chk_X_report.codeMap))
				var checkIds = Object.keys($scope.cgi_chk_X_report.codeMap).toString()
				console.log(checkIds)
				$scope.tableData.readDataEKKR(checkIds)
			},
			error_fn:function(response){
				console.error('-----error-----------')
				$scope.ekkr.error = response.data
				console.error(response.data)
			},
		})
	}
	$scope.ekkr.config = {}
	$scope.ekkr.config.config_tab_click = function(tab){
		if(this.config_tab == tab)
			this.config_tab = null
		else
			this.config_tab = tab
	}
	$scope.ekkr.config.change_paymentId = function(){
		this.config_tab_click('sequence_paymentId')
		if(this.config_tab == 'sequence_paymentId')
			$scope.ekkr.config.read_paymentId()
	}
	$scope.ekkr.config.safeMinusSumSave = function(){
		if($scope.cgi_chk_X_report.safe_minus <= $scope.cgi_chk_X_report.safe){
			console.log($scope.cgi_chk_X_report.safe_minus)
			var paymentData = {
				IO:[
					{C:{cm:'КАСИР: Касир 1'}},
					{IO:{
						sum:0-$scope.cgi_chk_X_report.safe_minus,
						no:1,
					}},
				],
			}
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
	}
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
		$scope.ekkr.config.ask_paymentId("SELECT CURRVAL('paymentid')", "currentPaymentId")
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
		filterOnDate:'по даті:',
		filterOnPrivilege:'по пільгам:',
		filterOnPayType:'по типу оплати:',
		filterOnPayment:'по платежу:',
		filterOnApparat:'по аппаратам:',
	}

	$scope.filter.payment_type_sum = function(){
		var sum = 0
		if($scope.patientList.pl)
		angular.forEach($scope.patientList.pl.list,function(v,k){
			sum +=v.col_240
		})
		return sum
	}
	$scope.filter.filterGroup = function(col_nnn){
		if(this.group != col_nnn)
			this.group = col_nnn
		else
			this.group = null
	}
	$scope.filter.filterOnApparatClean = function(){
		this.apparat_type = null
	}
	$scope.filter.filterOnPayTypeClean = function(){
		this.payment_type = null
	}
	$scope.filter.filterOnPrivilegeClean = function(){
		this.payment_privilege = null
	}
	$scope.filter.filterOnDateClean = function(){ 
		delete this.fromDate
		delete this.toDate
		delete this.fromDate_ts
		delete this.toDate_ts
	}
	$scope.filter.filterOnPaymentClean = function(){
		this.maxPayment = null
		this.minPayment = null
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

var cntImport={
	length:0,
	lengthP:0,
	read:0,
	iuRead:0,
	insert:0,
	update:0,
	error:0,
}

$scope.lastDbRead.afterRead = function(){
console.log('-----lastDbRead.afterRead----------')
//	$scope.lastDbRead.cntImport = cntImport
		$scope.lastDbRead.cntImport = Object.assign({}, cntImport)
//		this.importCnt++
		this.maxInDB = this.list[0].max
//		console.log($filter('date')(new Date(this.maxInDB), 'medium'))
//		console.log($scope.dataToImport.max)
		if(true || $scope.dataToImport.max > this.maxInDB){
			$scope.lastDbRead.cntImport.length = $scope.dataToImport.rows.length
			$scope.lastDbRead.cntImport.lengthP = $scope.lastDbRead.cntImport.length
			console.log('--------importToDb-------------')
			var i = 0
			angular.forEach($scope.dataToImport.rows, function(rowObj){
				if(true || i++<1){
//					console.log(rowObj)
//					var visit_ts = new Date(rowObj.visit_ts)
//					rowObj.col_236 = $filter('date')(visit_ts, 'yyyy-MM-ddTHH:mm')
					rowObj.col_236 = rowObj.visit_ts_str
					rowObj.col_237 = rowObj.patient_pip
//					rowObj.col_237 = rowObj.patient_pip.replace("'","''")
					rowObj.col_238 = rowObj.cabinet.split(' ')[1]
					rowObj.col_239 = rowObj.examination
					rowObj.col_241 = rowObj.physician
					rowObj.col_242 = rowObj.referral
					rowObj.col_415 = rowObj.sales
//					rowObj.col_33504 = rowObj.patient_birthdate
					rowObj.col_33504 = "'"+rowObj.patient_birthdate.split('\.').reverse().toString().replace(/,/g,'-')+"'"
					rowObj.col_33505 = rowObj.patient_phone
					var col_data = $scope.patientList.config.json_create_table
					console.log(sql.read_table_visit()
							.replace(':read_table_sql', $scope.patientList.config.sql_read_table_data))
					readSql({
						sql:sql.read_table_visit()
							.replace(':read_table_sql', $scope.patientList.config.sql_read_table_data),
						col_236:rowObj.col_236+':00.0',
						col_237:rowObj.col_237,
						col_239:rowObj.col_239.replace(';',':'),
						//col_239:rowObj.col_239,
						afterRead:function(response){
							$scope.lastDbRead.cntImport.lengthP--
							$scope.lastDbRead.cntImport.read++
//							console.log(response.data)
							if(!response.data.list[0]){
								col_data.nextDbIdCounter = 3
								col_data.sql_row = ''
//									console.log(col_data)
								build_sqlJ2c_row_insert(rowObj, col_data)
								var data = {
									sql:col_data.sql_row,
									table_id:col_data.table_id,
									dataAfterSave:function(response){
										var nextDbId1 = response.data.nextDbId1
										readSql({
											sql:sql.read_table_one_row()
												.replace(':read_table_sql', $scope.patientList.config.sql_read_table_data),
											row_id:nextDbId1,
											afterRead:function(response){
												var r = response.data.list[0]
												r.inserted=true
												$scope.patientList.pl.list.unshift(r)
												$scope.lastDbRead.cntImport.iuRead++
											},
										})
									}
								}
								$scope.lastDbRead.cntImport.insert++
								writeSql(data)
							}else{
								var savedObj = response.data.list[0]
								console.log(savedObj)
								angular.forEach([238,239,241,242,415], function(n){
									var k = 'col_'+n
									if(savedObj[k]!=rowObj[k]){
										var v = rowObj[k]
										console.log(k+'/'+v)
										build_sqlJ2c_cell_write(v,k,n,col_data,savedObj)
//										console.log(col_data.sql)
										$scope.lastDbRead.cntImport.update++
										var data = {sql:col_data.sql,
											dataAfterSave:function(response){
												var updateRowObj = $scope.patientList.rowMap[savedObj.row_id]
												updateRowObj[k+'_update'] = response.data.update_0
												if(1==response.data.update_0){
													updateRowObj[k] = v
												}
												$scope.lastDbRead.cntImport.iuRead++
											}
										}
										writeSql(data)
									}
								})
							}
						},
					})
				}
			})
		}
//		exe_fn.httpGet($scope.lastDbRead.requestToImport)
	}

	$scope.lastDbRead.reread = function(){
		console.log(this.maxInDB)
		//console.log($filter('date')(new Date(this.maxInDB), 'medium'))
		exe_fn.httpGet($scope.lastDbRead.requestToImport)
	}

//	$interval( function(){ $scope.callDbImport(); }, $scope.lastDbRead.timeout)

	$scope.$watch('patientList.seek',function(newValue){ if(true){
		if($scope.patientList.pl){
			var sqlSeek = sql.read_table_seek().replace(':read_table_sql',$scope.patientList.config.sql_read_table_data)
			var seek = '%'+newValue+'%'
//			console.log(sqlSeek.replace(/:seek/g,"'"+seek+"'"))
			var data = { seek : seek, sql : sqlSeek + ' LIMIT 50', }
			readSql(data, $scope.patientList.pl)
			
			var sqlSeekCnt = "SELECT count(*) cnt FROM ( \n" +sqlSeek +" ) x"
			var dataCnt = { seek : seek, sql : sqlSeekCnt, 
				afterRead:function(response){
					$scope.patientList.pl.cnt = response.data.list[0].cnt
				}
			}
			readSql(dataCnt)
		}
	}})

	$scope.patientList = {config:{}}
	$scope.patientList.tableId=235,
	$scope.patientList.sql=sql.read_table_config(),
	readSql($scope.patientList)
	$scope.patientList.afterRead=function(){
		read_j2c_table($scope.patientList, $scope)
		var o = $scope.patientList
		o.pl_data = {}
		o.pl_data.sql = sql.read_table_day_date_desc().replace(':read_table_sql',
			o.config.sql_read_table_data
		)
		console.log('o.pl_data.sql\n',o.pl_data.day,o.pl_data.sql,o.pl_data)
		o.pl_data.afterRead=function(){
			console.log(o.pl)
			o.rowMap = {}
			console.log(o.pl.list.length)
			angular.forEach(o.pl.list, function(v){
				o.rowMap[v.row_id] = v
			})
		}
		if($scope.request.parameters.addDay) {
			$scope.date.addDayToSeekDay($scope.request.parameters.addDay*1)
		}
		$scope.date.setDay_pl_data(o)
		o.pl = {}
		readSql(o.pl_data, o.pl)
		var data_duplex_sql = "SELECT x.* FROM ( \n" +
		"SELECT parent, reference, COUNT(*) c, MIN(doc_id) min_id, MAX(doc_id) max_id FROM ( \n" +
		"SELECT d.* FROM doc d \n" +
		"WHERE parent IN (SELECT d.parent FROM timestamp t, doc d \n" +
		"WHERE timestamp_id=doc_id AND MONTH(t.value)=:month AND YEAR(t.value)=:year AND DAY(t.value)=:day) \n" +
		") GROUP BY parent, reference ) x \n" +
		"LEFT JOIN string s1 ON s1.string_id=min_id \n" +
		"LEFT JOIN string s2 ON s2.string_id=max_id \n" +
		"LEFT JOIN integer i1 ON i1.integer_id=min_id \n" +
		"LEFT JOIN integer i2 ON i2.integer_id=max_id \n" +
		"WHERE c>1 AND reference IN (240,18972) \n" +
		"AND (s1.value=s2.value \n" +
		"OR i1.value=i2.value)"
		console.log(data_duplex_sql)
		$scope.pl_data_duplex = {}
		$scope.pl_data_duplex.sql = data_duplex_sql
		$scope.date.setDay_to_obj($scope.pl_data_duplex)
		console.log($scope.pl_data_duplex)
		$scope.pl_data_duplex.removeAllDuplex = function(){
			var removeAllDuplex = {}
			removeAllDuplex.sql = "DELETE FROM doc WHERE doc_id IN (SELECT min_id FROM (" +data_duplex_sql+"))"
			$scope.date.setDay_to_obj(removeAllDuplex)
			console.log($scope.pl_data_duplex.list.length, $scope.pl_data_duplex.list)
			removeAllDuplex.dataAfterSave = function(response){
				console.log(response.data)
			}
			writeSql(removeAllDuplex)
		}
		$scope.pl_data_duplex.afterRead = function(response){
			$scope.pl_data_duplex.list = response.data.list
			console.log($scope.pl_data_duplex.list.length, $scope.pl_data_duplex.list)
		}
		readSql($scope.pl_data_duplex)
	}
	$scope.patientList.col_keys={
		col_236:'дата-час обстеження',
		col_237:' П.І.Б.',
		col_238:' апарат ',
		col_239:' дослідження ',
		col_240:' вартість ',
		col_241:' лікар ',
		col_242:' ЗОЗ направлення ',
	}

	if('analytics'==$scope.request.pathNameValue){
		$scope.ekkr.config.config_tab = 'dayPatientReport'
//		$scope.filter.fromDate = 3
		$scope.filter.fromDate = ''+new Date().getDate()
		$scope.filter.blurDate('fromDate')
		$scope.filter.filterGroup('col_237')
		$scope.dayPatientReport = {}
		console.log($scope.dayPatientReport)
		var unbindWatcherSql = $scope.$watch('patientList.config.sql_read_table_data',function(newValue){
			if(newValue){
				console.log($scope.dayPatientReport)
				$scope.filter.filterOnPayment($scope.dayPatientReport, 'patientList')
				unbindWatcherSql()
			}
		})
	}

//	$scope.pageVar = {}
	$scope.pageVar.multiple_examination_split = function(){
		console.log(this.o)
		var d = new Date(this.o.col_236)
		console.log(d)
		var splitExamination = this.o.col_239.split(', ')
		angular.forEach(splitExamination, function(v,k){
			var col_data = $scope.patientList.config.json_create_table
			col_data.nextDbIdCounter = 3
			col_data.sql_row = ''
			var sourceObj = $scope.pageVar.o
			if(k>0){
				d.setSeconds(k)
				console.log(d)
				console.log(v)
				var rowObj = {}
				rowObj.col_236 = $filter('date')(d, 'yyyy-MM-ddTHH:mm:ss')
				rowObj.col_237 = sourceObj.col_237
				rowObj.col_238 = sourceObj.col_238
				rowObj.col_239 = v
				rowObj.col_241 = sourceObj.col_241
				rowObj.col_242 = sourceObj.col_242
				rowObj.col_415 = sourceObj.col_415
				rowObj.col_33504 = sourceObj.col_33504
				rowObj.col_33505 = sourceObj.col_33505
				console.log(rowObj)
//					console.log(col_data)
				build_sqlJ2c_row_insert(rowObj, col_data)
				var data = {
					sql:col_data.sql_row,
					table_id:col_data.table_id,
				}
//				console.log(data)
				writeSql(data)
			}else{// k==0
				$scope.pageVar.o.col_239 = v
				var col_data = {}
				col_data[239] = $scope.patientList.config.json_create_table[239]
				$scope.pageVar.writeUpdate(col_data, $scope.pageVar.o)
			}
		})
	}
	
	$scope.pageVar.payCount = {}
	$scope.pageVar.payCount.open = function(){
		if(this.isOpened){
			this.isOpened = false
			return
		}
		this.isOpened = true
		console.log( $scope.patientList.pl.list)
		$scope.pageVar.payCount.calc = {
			cntPays:0,sumPays:0,
			cntCarte:0,sumCarte:0,
			cntCash:0,sumCash:0,
		}
		angular.forEach($scope.patientList.pl.list,function(v,k){
			if(v.col_240){
				$scope.pageVar.payCount.calc.cntPays++
				$scope.pageVar.payCount.calc.sumPays +=v.col_240
				if('ГОТІВКА'==v.col_18972){
					$scope.pageVar.payCount.calc.cntCash++
					$scope.pageVar.payCount.calc.sumCash +=v.col_240
				}else
				if('КАРТКА'==v.col_18972){
					$scope.pageVar.payCount.calc.cntCarte++
					$scope.pageVar.payCount.calc.sumCarte +=v.col_240
				}
			}
		})
		console.log($scope.pageVar.payCount.calc)
	}
	$scope.pageVar.payCount.close = function(){
		this.isOpened = false
	}
	$scope.pageVar.getCheckFile = function(){
		if(!this.o)
			return ''
		//return this.o.row_id 
		return $scope.ekkr.config.nextPaymentId
		+'|' + this.o.col_239 
		+' |' + this.toPay() + '|'
	}
	
	$scope.pageVar.makeCheckFile = function(){
		$scope.ekkr.config.ask_paymentId("SELECT NEXTVAL('paymentid')", "nextPaymentId")
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

	$scope.pageVar.removeRow = function(){
		console.log($scope.pageVar.o)
			var data = {
				sql : 'update doc set parent=55172 where doc_id=:row_id',
				row_id: $scope.pageVar.o.row_id,
				dataAfterSave:function(response){
					console.log(response)
				}
			}
		console.log(data)
			writeSql(data)
	}

	$scope.pageVar.saveUpdate = function(){
		this.o.col_240 = this.price
		this.o.col_3311 = this.procent
		this.o.col_5218 = this.payment_privilege
		this.o.col_18972 = this.paymentData_F_P.name
		var col_data = {}
		col_data[238] = $scope.patientList.config.json_create_table[238]
		col_data[240] = $scope.patientList.config.json_create_table[240]
		col_data[3311] = $scope.patientList.config.json_create_table[3311]
		col_data[5218] = $scope.patientList.config.json_create_table[5218]
		col_data[18972] = $scope.patientList.config.json_create_table[18972]
		$scope.pageVar.writeUpdate(col_data, this.o)
	}

	$scope.pageVar.writeUpdate = function(col_data, rowObj){
		col_data.nextDbIdCounter = 3
		col_data.sql_row = ''
		angular.forEach(col_data, function(v_col_type,n){
			var k = 'col_'+n
			var v = rowObj[k]
			console.log(n+'/'+k)
			build_sqlJ2c_cell_write(v,k,n,col_data,rowObj)
		})
		col_data.sql_row += sql.read_table_one_row()
			.replace(':read_table_sql', $scope.patientList.config.sql_read_table_data)
		console.log(sql.read_table_one_row()
				.replace(':read_table_sql', $scope.patientList.config.sql_read_table_data))
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
				if(list)
					$scope.pageVar.o = list[0]
				saveEKKR_in_process = false
			},
		}
		writeSql(data)
	}

	$scope.pageVar.paymentData_F_P = {no:0}
	$scope.pageVar.setPaymentData_F_P = function(v){
		if(!$scope.pageVar.o.col_14207)
			$scope.pageVar.paymentData_F_P = v
	}

	$scope.pageVar.saveEKKR = function(){
		var sql = "SELECT * FROM doc " +
		"LEFT JOIN integer ON integer_id=doc_id " +
		"WHERE parent = :row_id AND reference=14207"
		console.log(sql, this.o.row_id, this.o)
		readSql({
			sql:sql,
			row_id:this.o.row_id,
			afterRead:function(response){
				console.log(response.data)
				console.log(response.data.list[0])
				console.log(!response.data.list[0])
				if(!response.data.list[0]){
					console.log("$scope.pageVar.saveEKKR2")
					$scope.pageVar.saveEKKR2()
				}
			}
		})
	}

	var saveEKKR_in_process = false
	$scope.pageVar.saveEKKR1 = function(){
		if(!saveEKKR_in_process){
			saveEKKR_in_process = true
			pageVar.saveEKKR12()
		}
	}

	$scope.pageVar.saveEKKR2 = function(){
		console.log("$scope.pageVar.saveEKKR2")
		if(this.o.col_14207){
			console.error('--фіскальна реєстрація вже виконана---- checkId = '+this.o.col_14207)
		}else if($scope.pageVar.paymentData_F_P.no>0){
			console.log("$scope.pageVar.saveEKKR2")
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
					$scope.pageVar.o.col_14207 = $scope.ekkr.config.nextPaymentId
					var col_data = {}
					col_data[14207] = $scope.patientList.config.json_create_table[14207]
					$scope.pageVar.writeUpdate(col_data, $scope.pageVar.o)
				},
				error_fn:function(response) {
					console.error('---error----помилка-------')
					console.error(response.data)
				},
				data:paymentData,
			})
		}
	}

	$scope.pageVar.toPay = function(){
		return this.price-(this.price*this.procent/100)
	}

	$scope.pageVar.updateFromImportRow = function(o,v){
		console.log(v)
		var isToUpdate = false
		var col_data = {}
		angular.forEach([{examination:239}, {physician:241}], function(col){
			angular.forEach(col, function(colV,colK){
				if(o['col_'+colV]!=v[colK]){
					isToUpdate = true
					o['col_'+colV]=v[colK]
					col_data[colV] = $scope.patientList.config.json_create_table[colV]
				}
			})
		})
		if(isToUpdate){
			console.log(col_data)
		}
	}
	$scope.pageVar.openEditRow = function(o){
		$scope.ekkr.config.ask_paymentId("SELECT NEXTVAL('paymentid')", "nextPaymentId")
		this.ngStyleModal = {display:'block'}
		console.log(o)
		console.log(o.col_236)
		if($scope.dataToImport)
		angular.forEach($scope.dataToImport.rows, function(v,k){
			if(v.visit_ts==o.col_236){
				//$scope.pageVar.updateFromImportRow(o,v)
			}
		})
		this.payment_privilege = o.col_5218
		console.log(this)
		//console.log($scope.patientList.config.json_create_table)
		if(this.row_id != o.row_id){
			this.o = o
			this.price = o.col_240
			this.procent = o.col_3311
			this.row_id = o.row_id
			angular.forEach($scope.pageVar.site_config.payment_type, function(v,k){
				if(v.name==o.col_18972)
					$scope.pageVar.paymentData_F_P = v
			})
		}
		$scope.priceCalcHelpData = {}
		//			console.log($scope.priceCalcHelpData)
		console.log(o.col_239)
		$scope.priceCalcHelpData.examination = {}
		readSql({
				examination:o.col_239,
				sql:sql.read_examination_prices(),
			},
			$scope.priceCalcHelpData.examination
		)
		$scope.priceCalcHelpData.destination = {}
//		console.log(sql.read_examination_prices())
//		console.log(o.col_242)
		if(o.col_242){
			readSql({
				destination:o.col_242,
				sql:sql.read_destination_procents(),
			}, $scope.priceCalcHelpData.destination)
		}

		var sql_more_pays = "SELECT * FROM doc " +
				"left join integer on integer_id=doc_id " +
				"where parent = " +o.row_id +
				" and reference = 240"
				console.log(sql_more_pays)
		readSql({
			sql:sql_more_pays,
			afterRead:function(response){
				$scope.more_pays = {
					list:response.data.list
				}
				$scope.more_pays.delById = function(){
					console.log($scope.more_pays)
					var data = {
						sql : "DELETE FROM doc WHERE doc_id = " + $scope.more_pays.id_to_del,
						dataAfterSave:function(response){
							console.log(response)
						}
					}
					writeSql(data)
				}
			}
		})
		
		var sql_pay_double = "SELECT * FROM doc " +
		" LEFT JOIN string ON doc_id = string_id " +
		" WHERE reference = 18972 AND parent = "+o.row_id
		console.log(sql_pay_double)

		readSql({
			sql:sql_pay_double,
			afterRead:function(response){
				if(response.data.list.length>1){
					$scope.pay_double = {
						list:response.data.list
					}
					console.log($scope.pay_double)
				}
			}
		})

		readSql({
			sql:$scope.patientList.config.sql_read_table_data+" AND rws.doc_id = "+o.row_id,
			afterRead:function(response){
				console.log(response.data)
				if(response.data.list.length>1){
					angular.forEach(response.data.list[0], function(v,k){
						if(k.includes('col_') && k.includes('_id')){
							if(response.data.list[0][k] != response.data.list[1][k]){
								var docId_to_delete = Math.max(response.data.list[0][k], response.data.list[1][k])
								if(!$scope.sql_delete_two_check)
									$scope.sql_delete_two_check = ''
								$scope.sql_delete_two_check += 'DELETE FROM doc WHERE doc_id='+docId_to_delete+'; '
							}
						}
					})
					console.log($scope.sql_delete_two_check)
					console.log($scope.sql_delete_two_check.length)
				}
			},
		})
	}

	$scope.click_delete_two_check = function(){
		console.log($scope.sql_delete_two_check)
		var data = {
			sql:$scope.sql_delete_two_check,
		}
		console.log(data.sql)
		writeSql(data)
	}

	$scope.random3=getRandomInt(3)
});

	sql.table_data_row_insert=function(){
		return "INSERT INTO doc (doc_id, parent, doctype) VALUES (:nextDbId1 , :table_id , 4) ;"
	},
	sql.table_data_cell_update=function(){
		return "UPDATE :fieldtype SET value =:value WHERE :fieldtype_id=:cell_id ;"
	},
	sql.table_data_cell_insert=function(){
		return "INSERT INTO doc (doc_id, parent, reference, doctype) VALUES (:nextDbId2, :row_id , :column_id,  5) ;" +
		"INSERT INTO :fieldtype (value,:fieldtype_id) VALUES (:value, :nextDbId2 ) ;"
	},
	sql.read_destination_procents=function(){
		return "SELECT * FROM ( SELECT COUNT(value) cnt, value FROM ( SELECT d.* FROM ( \n" +
		"SELECT * FROM doc, integer WHERE reference =3311 AND doc_id=integer_id \n" +
		") d, ( \n" +
		"SELECT * FROM doc, string WHERE reference =242 AND doc_id=string_id AND value = :destination \n" +
		") x WHERE x.parent=d.parent ) x GROUP BY value ) x ORDER BY cnt DESC"
	},
	sql.read_examination_prices=function(){
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
	sql.read_table_visit=function(){
		return "SELECT * FROM ( \n" +
		":read_table_sql " +
		" ) x WHERE col_236 = :col_236 AND col_237 = :col_237  AND col_239 = :col_239"
	},
	sql.read_table_one_row=function(){
		return "SELECT * FROM ( \n" +
		":read_table_sql " +
		" ) x WHERE row_id = :row_id"
	},
	sql.read_table_payment_type2=function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_18972 = 'ІНШЕ' OR col_18972 IS NULL"
	},
	sql.read_table_apparat_type=function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_238 = :apparat_type"
	},
	sql.read_table_payment_type=function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_18972 = :payment_type"
	},
	sql.read_table_privilege=function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_5218 = :payment_privilege"
	},
	sql.read_table_payment=function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_240 > :minPayment AND col_240 <= :maxPayment "
	},
	sql.read_table_betweenDates=function(){
		return "SELECT * FROM ( " +
		":read_table_sql " +
		" ) x WHERE col_236 BETWEEN :fromDate_sql AND :toDate_sql "
	},
	sql.read_table_seek=function(){
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
	sql.read_table_date_desc=function(){
		return "SELECT * FROM ( \n" +
		":read_table_sql" +
		") x ORDER BY col_236 DESC"
	},
	sql.read_table_max_min_date=function(){
		return "SELECT min(col_236) min, max(col_236) max, count(*) FROM (" +
		":read_table_sql" +
		") x"
	},
	sql.duplet_rows_count=function(){
		return "SELECT count(*) cnt FROM (" +
		this.duplet_rows() +
		") x"
	},
	sql.duplet_rows_remove=function(){
		return "DELETE FROM doc WHERE parent IN (" + this.duplet_rows() +");\n" +
		"DELETE FROM doc WHERE doc_id IN (" + this.duplet_rows() +");\n" +
		"DELETE FROM doc WHERE doc_id IN (" +
		"SELECT d.doc_id FROM doc d LEFT JOIN doc d2 ON d2.parent=d.doc_id " +
		"WHERE d.parent = 235 AND d.doctype=4 AND d2.doc_id IS NULL " +
		");"
	},
	sql.duplet_rows=function(){
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
	}

