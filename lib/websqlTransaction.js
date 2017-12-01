(function(){
    'use strict';

    var transaction = function(data) {
        this.tx = '';
        this.query = '';
        this.queryType = '';
        this.queryInsert = [];
        this.values = '';
        this.queryValuesInsert = [];
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
            this.queryInsert = data.queryInsert;
            this.values = data.values;
            this.queryValuesInsert = data.queryValuesInsert;
            this.callback = data.callback;
            this.callbackData = data.callbackData;
            this.successMsg = data.successMsg;
            this.failMsg = data.failMsg;
        },
        doTransaction: function() {
            var self = this;
            if (this.queryType === 'insert') {
                var counter = 0;
                for (var i = 0; i < this.queryInsert.length; i++) {
                    this.tx.executeSql(
                        this.queryInsert[i],
                        this.queryValuesInsert[i],
                        function(tx, result) {
                            counter++;
                            if (counter === self.queryInsert.length) {
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