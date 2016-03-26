var $ = require("jquery");
var local = require("../lib/websqlInterface");
var template = require("./jade/main.jade");
$('body').append(template());
var resultElem = $("#result");

//**REAL EXAMPLE
	function realExample(){
		var data = {
			name : "test",
			table : "devices",
			columns : ["name", "mac", "type"]
		};
		local.transaction("create", data, function (result){		//CREATE DB and TABLE
			if(result.done){
				resultElem.append("<div>"+result.data+"</div>");
				var data = {
					table : "devices",
					data : [
							{
								name : "qwe",
								mac : "ff",
								type : "rty"
							},
							{
								name : "qwr",
								mac : "xx",
								type : "asd"
							},
						]
					
				};
				local.transaction("insert", data, function (result){		//INSERT DATA
					if(result.done){
						resultElem.append("<div>"+result.data+"</div>");
						var data = {
							table : "devices",
							data : {
								set : {
									mac : "11"
								},
								where : {
									name : "qwe",
									type : "rty"
								}
							}
						};
						local.transaction("update", data, function (result){		//UPDATE DATA
							if(result.done){
								resultElem.append("<div>"+result.data+"</div>");
								var data = {
									table : "devices",
									data : {
										name : "qwe"
									}
								};
								local.transaction("find", data, function (result){		//FIND DATA
									$.map(result.data.rows, function (item, index){
										resultElem.append("<div>Row "+(index+1)+". "+item.mac+"</div>");
									});
									// deleteDB();
									// drop();
								});
							}else msgCallback(result);
						});
					}else msgCallback(result);
				});
			}else msgCallback(result);
		});
	}
	realExample();

//**CONNECT
	function connect(){
		var data = {
			name : "test",
			// version : "3.0"
		};
		local.connect(data, msgCallback);
	};
	// connect();
//**CREATE
	function create(){
		var data = {
			name : "test",
			table : "products",
			columns : ["id", "ip", "type"]
		};
		local.transaction("create", data, msgCallback);
	}
	// create();
//**DROP TABLE
	function drop(){
		var data = {
			name : "test",
			table : "products"
		};
		local.transaction("drop", data, msgCallback);
	}
	// drop();
//**INSERT
	function insert(){
		var data = {
			name : "test",
			table : "devices",
			data : [
				{
					name : "qwe1",
					mac : "aa",
					type : "rty"
				},
				{
					name : "qwe2",
					mac : "bb",
					type : "rty"
				},
				{
					name : "qwe3",
					mac : "cc",
					type : "rty"
				},
			]
		};
		local.transaction("insert", data, msgCallback);
	}
	// insert();
//**DELETE
	function deleteDB(){
		var data = {
			name : "test",
			table : "devices",
			data : {
				// name : "qwe"
			}
		};
		local.transaction("delete", data, msgCallback);
	}
	// deleteDB();
//**FIND
	function find(){
		var data = {
			name : "test",
			table : "devices",
			data : {
				// mac : "aa"
			}
		};
		local.transaction("find", data, dataCallback);
	}
	// find();
//**UPDATE
	function update(){
		var data = {
			name : "test",
			table : "",
			data : {
				set : {
					mac : "00"
				},
				where : {
					// name : "qwe"
				}
			}
		};
		local.transaction("update", data, msgCallback);
	}
	// update();
//CALLBACKS
	function msgCallback(result){
		resultElem.append("<div>"+result.data+"</div>");
	};
	function dataCallback(result){
		if(result.done){
			$.map(result.data.rows, function(item){
				resultElem.append("<div>"+item.name+"</div>");
			});
		}else resultElem.append("<div>"+result.data+"</div>");
	};