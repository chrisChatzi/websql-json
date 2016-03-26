(function(){
    'use strict';

    var localStorage = require("./websqlClass");

    var localStorageObj = "";

    function connect(data, callback){
    	if(!localStorageObj) localStorageObj = new localStorage();
    	localStorageObj.setCredentials(data, callback);
    };
    function transaction(type, data, callback){
    	if(!localStorageObj) localStorageObj = new localStorage();
    	localStorageObj.openDatabase();
    	type = type.toLowerCase();
    	switch(type){
    		case "create": 
    			localStorageObj.setDB(type, data, callback); 
    		break;
    		case "drop": 
    			localStorageObj.setDB(type, data, callback); 
    		break;
    		case "insert": 
    			localStorageObj.setDB(type, data, callback); 
    		break;
    		case "update": 
    			localStorageObj.setDB(type, data, callback); 
    		break;
    		case "delete": 
    			localStorageObj.setDB(type, data, callback); 
    		break;
    		case "find": 
    			localStorageObj.setDB(type, data, callback); 
    		break;
    	}
    };

    module.exports = {
    	connect : connect,
    	transaction : transaction
    };
})();