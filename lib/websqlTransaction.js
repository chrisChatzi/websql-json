(function(){
    'use strict';

    var counter = 0;
    var i = 0;

    var transaction = function(data) {
        this.tx = '';
        this.query = '';
        this.queryType = '';
        this.queryCreate = [];
        this.queryDrop = [];
        this.queryInsert = [];
        this.values = '';
        this.queryInsertValues = [];
        this.callback = '';
        this.callbackData = '';
        this.successMsg = '';
        this.failMsg = '';
    };

    transaction.prototype = {
        setTransaction: function(data) {
            this.tx = data.tx;
            this.query = data.query;
            this.queryType = data.queryType;
            this.queryCreate = data.queryCreate;
            this.queryDrop = data.queryDrop;
            this.queryInsert = data.queryInsert;
            this.values = data.values;
            this.queryInsertValues = data.queryInsertValues;
            this.callback = data.callback;
            this.callbackData = data.callbackData;
            this.successMsg = data.successMsg;
            this.failMsg = data.failMsg;
        },
        doTransaction: function() {
            var self = this;

            if (['create', 'drop', 'insert'].includes(this.queryType)) {
                var queryKey = 'query' + this.queryType.charAt(0).toUpperCase() + this.queryType.substr(1);
                counter = 0;

                for (i = 0; i < this[queryKey].length; i++) {
                    this.tx.executeSql(
                        this[queryKey][i],
                        this.queryType === 'insert' ? this[queryKey + 'Values'][i] : this.values,
                        function(tx, result) {
                            counter++;

                            if (counter === self[queryKey].length) {
                                self.callbackFunction(true, { message: self.successMsg, callbackData: self.callbackData });
                            }
                        },
                        function(error) {
                            self.callbackFunction(false, { message: self.failMsg });
                        }
                    );
                }
            } else {
                this.tx.executeSql(
                    this.query,
                    this.values,
                    function(tx, result) {
                        if (self.queryType === 'find') {
                            self.callbackFunction(true, { message: self.successMsg, rows: result.rows });
                        } else {
                            self.callbackFunction(true, { message: self.successMsg, callbackData: self.callbackData });
                        }
                    },
                    function(error) {
                        self.callbackFunction(false, { message: self.failMsg });
                    }
                );
            }
        },
        callbackFunction: function(flag, callbackData) {
            callbackData.done = flag;
            callbackData.queryType = this.queryType;
            this.callback(callbackData);
        },
    };

    module.exports = transaction;
})();