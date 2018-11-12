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

}
