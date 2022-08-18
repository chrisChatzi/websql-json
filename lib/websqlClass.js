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
        // Data
        this.fields = '';
        this.values = '';
        this.valuesArray = [];
        this.set = '';
        this.conditions = '';
        this.callbackData = {
            done: true,
            data: '',
        };
        // Transaction
        this.queryType = 'rest';
        this.query = '';
        this.queryCreate = [];
        this.queryDrop = [];
        this.queryInsert = [];
        this.queryValues = '';
        this.queryInsertValues = [];
        this.queryCallback = '';
        this.querySuccessMsg = '';
        this.queryFailMsg = '';
    };

    localStorage.prototype = {
        // Open
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
            // Check
            if (!checkObj) {
                checkObj = new checkClass('', data, callback);
            }
            if (checkObj.checkUserData(data)) {
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
        // Sets
        setCredentials: function(data, callback) {
            this.callback = callback;
            // Check
            if (!checkObj) {
                checkObj = new checkClass('', data, callback);
            }
            if (checkObj.checkUserData(data)) {
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
                if (callback) {
                    callback(res);
                }
            });
        },
        // Transaction - fill data, on return make transaction
        transaction: function(type, data, callback) {
            self = this;
            if (data.table) {
                this.table = data.table;
            }
            this.callback = callback;
            // Check
            if (!checkObj) {
                checkObj = new checkClass(type, data, callback);
            }
            if (checkObj.checkTransaction(data, type)) {
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
                            queryCreate: self.queryCreate,
                            queryDrop: self.queryDrop,
                            queryInsert: self.queryInsert,
                            queryInsertValues: self.queryInsertValues,
                            callback: self.callback,
                            callbackData: self.callbackData,
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
            // Create SQL query
            type = type.toLowerCase();
            switch(type) {
            case 'create':
                // Ensure backwards compatibility
                if (data.data === undefined) {
                    data = { name: data.name, data: [{ table: data.table, columns: data.columns }] };
                }

                if (data.inserts) {
                    this.callbackData = data.inserts;
                }

                this.queryCreate = [];
                for (i = 0; i < data.data.length; i++) {
                    this.table = data['data'][i]['table'];
                    this.fields = data['data'][i]['columns'];
                    this.queryCreate.push(
                        'CREATE TABLE IF NOT EXISTS ' + this.table + ' (' + this.fields + ')'
                    );
                }
                this.queryType = 'create';
                this.queryValues = [];
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Table created successfully';
                this.queryFailMsg = 'Error during CREATE transaction';
                break;
            case 'drop':
                // Ensure backwards compatibility
                if (data.data === undefined) {
                    data = { name: data.name, data: [{ table: data.table }] };
                }
                this.callbackData = [];
                this.queryDrop = [];
                for (i = 0; i < data.data.length; i++) {
                    this.table = data['data'][i]['table'];
                    this.queryDrop.push('DROP TABLE IF EXISTS ' + this.table);
                }
                this.queryType = 'drop';
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Table' + (data.data.length === 1 ? '' : 's') + ' dropped successfully';
                this.queryFailMsg = 'Error during DROP transaction';
                break;
            case 'insert':
                var string = '';
                var values = '';
                var array = [];
                this.queryInsert = [];
                this.queryInsertValues = [];
                this.callbackData = [];
                data.data = Array.isArray(data.data) ? data.data : [data.data];
                for (i = 0; i < data.data.length; i++) {
                    string = '';
                    values = '';
                    array = [];
                    var dataValues = data.data[i];
                    if (!data.table) {
                        dataValues = data.data[i].data;
                        this.table = data.data[i].table;
                    }
                    for (key in dataValues) {
                        string += key + ', ';
                        values += '?, ';
                        array.push(dataValues[key]);
                    }
                    this.fields = string.substring(0, string.length - 2);
                    this.values = values.substring(0, values.length - 2);
                    this.valuesArray = array;
                    this.queryInsert.push(
                        'INSERT OR REPLACE INTO ' + this.table + ' (' + this.fields + ') VALUES (' + this.values + ')'
                    );
                    this.queryInsertValues.push(this.valuesArray);
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

                this.query = 'UPDATE ' + this.table + ' SET ' + this.set + ' ' + this.conditions;
                this.queryValues = this.valuesArray;
                this.queryType = 'update';
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
                this.queryType = 'delete';
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Deleted successfully';
                this.queryFailMsg = 'Error during DELETE transaction';
                break;
            case 'find':
                this.conditions = '';
                this.orderBy    = '';

                if (Object.keys(data.data).length > 0) {
                    for (key in data.data) {
                        var val = data.data[key];

                        if (this.conditions === '') {
                            this.conditions = 'WHERE ';
                        } else {
                            this.conditions += ' AND ';
                        }

                        if (Array.isArray(val)) {
                            this.conditions += key + ' IN (';
                            this.orderBy = ' ORDER BY CASE ID';

                            var isValNumber = false;

                            for (i = 0; i < val.length; i++) {
                                this.orderBy += ' WHEN ' + val[i] + ' THEN ' + i;
                                this.conditions += i > 0 ? ', ' : '';
                                this.conditions += val[i] > 0 ? val[i] : '"' + val[i] + '"';

                                isValNumber = !isValNumber && val[i] > 0 ? true : isValNumber;
                            }

                            this.conditions += ')';
                            this.orderBy += ' END';

                            if (isValNumber) {
                                if (data.orderBy.length === 0) {
                                    this.conditions += this.orderBy;
                                } else {
                                    this.orderBy = '';
                                }
                            } else {
                                this.orderBy = '';
                            }
                        } else {
                            this.conditions += key;

                            if (typeof val === 'string' && (val.toUpperCase().startsWith('IS ') || val.toUpperCase().startsWith('LIKE '))) {
                                this.conditions += ' ' + val;
                            } else {
                                this.conditions += ' = "' + val + '"';
                            }
                        }
                    }
                }

                if (data.selects) {
                    data.selects = Array.isArray(data.selects) ? data.selects.join(', ') : data.selects;
                    this.query = 'SELECT ' + data.selects + ', ' + this.table + '.* ';
                } else {
                    if (data.join) {
                        this.query = 'SELECT *, ' + this.table + '.* ';
                    } else {
                        this.query = 'SELECT * ';
                    }
                }

                if (data.join) {
                    data.join.query = Array.isArray(data.join.query) ? data.join.query.join(' ') : data.join.query;
                    this.conditions = data.join.query + ' ' + this.conditions;
                }

                this.query += 'FROM ' + this.table + ' ' + this.conditions;

                if (data.orderBy) {
                    if (this.orderBy.length === 0) {
                        this.query += ' ORDER BY ';
                    } else {
                        this.query += ' ';
                    }

                    this.query += Array.isArray(data.orderBy) ? data.orderBy.join(', ') : data.orderBy;
                }

                this.queryValues = [];
                this.queryType = 'find';
                this.queryCallback = this.callback;
                this.querySuccessMsg = 'Data found successfully';
                this.queryFailMsg = 'Error during FIND transaction';
                break;
            }

            return returnFunction();
        },
        callbackFunction: function(flag, callbackData) {
            callbackData.done = flag;
            callbackData.queryType = this.queryType;
            this.callback(callbackData);
        },
    };

    module.exports = localStorage;
})();
