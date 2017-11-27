(function(){
    'use strict';

    var transactionClass = require('./websqlTransaction');
    var checkClass = require('./websqlChecks');

    var i = 0;
    var self = '';
    var transactionObj = '';
    var checkObj = '';

    var localStorage = function() {
        this.db = '';
        this.name = '';
        this.version = '1.0';
        this.descr = '';
        this.size = 500000;
        this.table = '';
        this.callback = '';
        //data
        this.fields = '';
        this.values = '';
        this.valuesArray = [];
        this.set = '';
        this.conditions = '';
        this.callbackData = {
            done: true,
            data: '',
        };
        //transaction
        this.queryType = 'rest';
        this.query = '';
        this.queryInsert = [];
        this.queryValues = '';
        this.queryValuesInsert = [];
        this.queryCallback = '';
        this.querySuccessMsg = '';
        this.queryFailMsg = '';
    };

    localStorage.prototype = {
        //OPEN
        openDatabase : function() {
            this.db = window.openDatabase(
                this.name,
                this.version,
                this.descr,
                this.size
            );
        },
        connect: function(data, callback) {
            this.callback = callback;
            //check
            if (!checkObj) {
                checkObj = new checkClass('', data, callback);
            }
            if (checkObj.checkUserData()) {
                return;
            }
            this.name = data.name;
            if (data.version) {
                this.version = data.version;
            }
            if (data.descr) {
                this.descr = data.descr;
            } else {
                this.descr = this.name;
            }
            if (data.size) {
                this.size = data.size;
            }
            if (data.table) {
                this.table = data.table;
            }
            var callbackData = {
                done: true,
                data: 'Connected to: ' + this.name,
            };
            callback(callbackData);
        },
        //SETS
        setCredentials: function(data, callback) {
            this.callback = callback;
            //check
            if (!checkObj) {
                checkObj = new checkClass('', data, callback);
            }
            if (checkObj.checkUserData()) {
                return;
            }
            this.name = data.name;
            if (data.version) {
                this.version = data.version;
            }
            if (data.descr) {
                this.descr = data.descr;
            } else {
                this.descr = this.name;
            }
            if (data.size) {
                this.size = data.size;
            }
            if (data.table) {
                this.table = data.table;
            }
        },
        setDB: function(type, data, callback) {
            if (data.name) {
                this.setCredentials(data, callback);
                this.openDatabase();
            }
            this.transaction(type, data, function(res) {
                callback(res);
            });
        },
        //TRANSACTION - fill data, on return make transaction
        transaction: function(type, data, callback) {
            self = this;
            if (data.table) {
                this.table = data.table;
            }
            this.callback = callback;
            //check
            if (!checkObj) {
                checkObj = new checkClass(type, data, callback);
            }
            if (checkObj.checkTransaction()) {
                return;
            }
            this.makeTransaction(type, data, callback, function() {
                self.db.transaction(
                    function(tx) {
                        if (!transactionObj) {
                            transactionObj = new transactionClass();
                        }
                        var transactionData = {
                            tx: tx,
                            queryType: self.queryType,
                            query: self.query,
                            values: self.queryValues,
                            queryInsert: self.queryInsert,
                            queryValuesInsert: self.queryValuesInsert,
                            callback: self.callback,
                            successMsg: self.querySuccessMsg,
                            failMsg: self.queryFailMsg,
                        };
                        transactionObj.setTransaction(transactionData);
                        transactionObj.doTransaction();
                    },
                    function(error) {
                        callback('Error with local db - Error code: ' + error);
                    }
                );
            });
        },
        makeTransaction: function(type, data, callback, returnFunction) {
            this.queryType = '';
            //create SQL query
            type = type.toLowerCase();
            switch(type) {
            case 'create':
                var string = '';
                var values = '';
                for (i = 0; i < data.columns.length; i++) {
                    string += data.columns[i] + ', ';
                    values += '?, ';
                }
                this.fields = string.substring(0, string.length - 2);
                this.values = values.substring(0, values.length - 2);

                this.query = 'CREATE TABLE IF NOT EXISTS ' + this.table + ' (' + this.fields + ')';
                this.queryValues = [];
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Table created successfully';
                this.queryFailMsg = 'Error during CREATE transaction';
                break;
            case 'drop':
                this.query = 'DROP TABLE ' + this.table;
                this.queryValues = [];
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Table dropped successfully';
                this.queryFailMsg = 'Error during DROP transaction';
                break;
            case 'insert':
                var string = '';
                var values = '';
                var array = [];
                for (i = 0; i < data.data.length; i++) {
                    string = '';
                    values = '';
                    array = [];
                    for (key in data.data[i]) {
                        string += key + ', ';
                        values += '?, ';
                        array.push(data.data[i][key]);
                    }
                    this.fields = string.substring(0, string.length - 2);
                    this.values = values.substring(0, values.length - 2);
                    this.valuesArray = array;
                    this.queryInsert.push(
                        'INSERT OR REPLACE INTO ' + this.table + ' (' + this.fields + ') VALUES (' + this.values + ')'
                    );
                    this.queryValuesInsert.push(this.valuesArray);
                }
                this.queryType = 'insert';
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Inserted successfully';
                this.queryFailMsg = 'Error during INSERT transaction';
                break;
            case 'update':
                var setConditions = '';
                var whereConditions = '';
                var array = [];
                for (key in data.data.set) {
                    setConditions += key + '=?, ';
                    array.push(data.data.set[key]);
                }
                if (Object.keys(data.data.where).length === 0) {
                    whereConditions = '';
                } else {
                    whereConditions = 'WHERE ';
                    for (key in data.data.where) {
                        whereConditions += key + '=? AND ';
                        array.push(data.data.where[key]);
                    }
                }
                this.set = setConditions.substring(0, setConditions.length - 2);
                this.conditions = whereConditions.substring(0, whereConditions.length - 4);
                this.valuesArray = array;

                this.query = 'UPDATE ' + this.table + ' SET ' + this.set + ' ' + this.conditions + '';
                this.queryValues = this.valuesArray;
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Updated successfully';
                this.queryFailMsg = 'Error during UPDATE transaction';
                break;
            case 'delete':
                if (Object.keys(data.data).length === 0) {
                    this.conditions = '';
                } else {
                    var key = Object.keys(data.data)[0];
                    var val = data.data[key];
                    this.conditions = 'WHERE ' + key + '="' + val + '"';
                }

                this.query = 'DELETE FROM ' + this.table + ' ' + this.conditions;
                this.queryValues = [];
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Deleted successfully';
                this.queryFailMsg = 'Error during DELETE transaction';
                break;
            case 'find':
                if (Object.keys(data.data).length === 0) {
                    this.conditions = '';
                } else {
                    var key = Object.keys(data.data)[0];
                    var val = data.data[key];
                    this.conditions = 'WHERE ' + key + '="' + val + '"';
                }

                this.query = 'SELECT * FROM ' + this.table + ' ' + this.conditions;
                this.queryValues = [];
                this.queryCallback = this.callback;
                this.querySuccessMsg = '';
                this.queryFailMsg = 'Error during FIND transaction';
                break;
            }

            return returnFunction();
        },
        callbackFunction: function(flag, data) {
            var callbackData = {
                done: flag,
                data: data,
            };
            this.callback(callbackData);
        },
    };

    module.exports = localStorage;
})();