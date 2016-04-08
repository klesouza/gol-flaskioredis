'use strict';

var app = angular.module('mongoviz', ['ui.sortable']);
app.controller('VizController',
function($scope, $http, $location){
	$scope.fields = [];
	$scope.logAxis = false;
	$scope.aggs = ["count", "sum", "avg"];
	$scope.model = {
		server: "localhost",
		port: "27017",
		db: "test",
		collection: ""
	};
	getDataFromUrl();
	$scope.ops = ["$group", "$match", "$project", "$limit", "$sort"];
	$scope.pipeline = [];
	$scope.queryModel = {
		selectedField: '',
		selectedAgg: '',
		selectedAggField: '',
		selectedFilter: '',
		freeQuery: '',
		selectedTab: 1
	};
	$scope.showAggField = false;

	function getDataFromUrl(){
		var ps = window.location.pathname.substr(1).split("/");
		if(ps.length == 2){
			$scope.model.db= ps[0];
			$scope.model.collection= ps[1];
		}
	}

	function buildURL(){
		return '/'+$scope.model.server+'/'+$scope.model.port+'/'+$scope.model.db+'/'+$scope.model.collection;
	};
	$scope.selectField = function(target, sel, fn){
		$scope.queryModel[target] = sel;
		if(fn)
		fn(sel)
	};
	$scope.getFields = function(){
		$http({
			method: 'GET',
			url: buildURL()
		}).then(function success(response){
			$scope.fields = response.data.fields;
		},
		function error(response){
			$scope.fields = [];
		});
	};
	$scope.toggleAggField = function (sel) {
		$scope.showAggField = sel == 'sum';
	}

	$scope.plot = function(){
		if($scope.queryModel.selectedTab == 1){
			if(!validateFreeQuery())
			return;
		}
		$http({
			method: 'POST',
			url: buildURL()+'/plot',
			data: $scope.queryModel
		}).then(function success(response){
			chart(response.data);
		}, function error(response) {
			if(Array.isArray(response.data))
			for(var i in response.data)
				toastr.warning(response.data[i]);
		});
	};

	function validateFreeQuery(){
		var op = ['$group', '$project'];
		var fq = []
		$(".list-group li .input-group").removeClass('has-warning');
		var lastOp = null;
		var valid = true;
		for(var i in $scope.pipeline){
			try{
				var j = '{"'+$scope.pipeline[i].op+'": '+$scope.pipeline[i].value+'}';
				var parsed = JSON.parse(j);
				if($.inArray($scope.pipeline[i].op, op) >= 0){
					lastOp = parsed[$scope.pipeline[i].op];
				}
				fq.push(j);
			}
			catch(err){
				$(".list-group li:nth("+i+") .input-group").addClass('has-warning');
				valid = false;
				}
			}
		if(fq.length == 0){
			valid = false;
		}
		if(valid)
			$scope.queryModel.freeQuery = "["+fq.join(',')+"]";
		setTimeout(function(){$(".list-group li .input-group").removeClass('has-warning');}, 10000);
		//if(valid)
			//console.log(lastOp);
		return valid;
	}

	$scope.changeAxis = function(){
		$('#chart').highcharts().yAxis[0].update({ type: ($scope.logAxis ? 'logarithmic' : 'linear')});
	}

	$scope.addPipeline = function(sel){
		$scope.pipeline.push({op: sel, value: ''});
	}

	$scope.removePipeline = function(idx){
		$scope.pipeline.pop(idx);
	}

	$scope.savePipeline = function(name){
		if(!name){
			if(!validateFreeQuery()){
				toastr.warning("Please check your queries");
			}
			else{
				$("#modal-save").modal('show');
			}
		}
		else{
			$http({
				method: 'POST',
				url: buildURL()+'/savePipeline',
				data: {query: $scope.queryModel.freeQuery, name: name}
			}).then(function success(response){
				toastr.success('Pipeline saved');
			}, function error(response) {
				toastr.warning('Pipeline not saved: ', response.data);
			});
		}
	}

	$scope.loadPipeline = function(){

	}

	$scope.sortableOptions = {
	    update: function(e, ui) {
	    },
	    stop: function(e, ui) {
			console.log('stop');
	    }
	  };

	function chart(data){
		var opt = $.extend({title: {text: 'Viz'}}, data);
		$("#chart").highcharts(opt);
	};
});
