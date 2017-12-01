(function(){
    'use strict';

    var checks = function(type, data, callback) {
        this.type = type;
        this.data = data;
        this.callback = callback;
    };

    checks.prototype = {
        checkUserData: function(data) {
            if (data) {
                this.data = data;
            }
            if (!this.data.name) {
                this.callbackFunction(false, 'Name cannot be empty');

                return true;
            }
            if (this.data.version) {
                if (this.data.version !== '1.0' && this.data.version !== '2.0') {
                    this.callbackFunction(false, 'Version can only be 1.0 or 2.0');

                    return true;
                }
            }
            if (this.data.size) {
                if (this.data.size > 52428000) {
                    this.callbackFunction(false, 'Size cannot exceed 5MB');

                    return true;
                }
            }
        },
        checkTransaction: function(data, type) {
            if (data) {
                this.data = data;
            }
            if (type) {
                this.type = type;
            }
            if (!this.data.table && ['create', 'drop', 'insert'].includes(this.type) === false) {
                this.callbackFunction(false, 'Table cannot be empty');

                return true;
            }
            if (this.type === 'create') {
                // Ensure backwards compatibility
                if (this.data.data === undefined) {
                    this.data = { name: this.data.name, data: [{ table: this.data.table, columns: this.data.columns }] };
                }

                if (Object.keys(this.data.data).length === 0) {
                    this.callbackFunction(
                        false,
                        'Cannot create a table without at least one column'
                    );

                    return true;
                }
            }
            if (this.type === 'insert') {
                if (!this.data.data) {
                    this.callbackFunction(false, 'No data to insert');

                    return true;
                } else {
                    if (Object.keys(this.data.data).length === 0) {
                        this.callbackFunction(false, 'No data to insert');

                        return true;
                    }
                }
            }
            if (this.type === 'update') {
                if (!this.data.data.set) {
                    this.callbackFunction(false, 'Update what?');

                    return true;
                } else {
                    if (Object.keys(this.data.data.set).length === 0) {
                        this.callbackFunction(false, 'Update what?');

                        return true;
                    }
                }
            }
        },
        callbackFunction: function(flag, callbackData) {
            callbackData.done = flag;
            callbackData.queryType = this.queryType;
            this.callback(callbackData);
        },
    };

    module.exports = checks;
})();