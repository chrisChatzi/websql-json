Web sqlite access library. Communicate easy and clean with JSON strings.
    
## Usage
 
> var local = require("websqlInterface");
 
**Connect:**

Use this method in order to connect to the database

**If you call the _connect_ method at start, 
you do not need to include the name field on the transactions.**
 
    local.connect(data, callback);
 
    var data = {
        name : "database_name",
        version : "1.0",
        descr : "database_description",
        size : 500000
    };
 
    or
 
    var data = {
        name : "database_name"
    };
 
    _version_, _descr_ and _size_ fields can be empty or ignored.
    Default value for _version_ is '1.0'. It can only be '1.0' or '2.0'.
    Default value for _descr_ will be the same as the name of the database.
    Default value for _size_ is 500000. Its maximum value is 52428000.
    _name_ field is mandatory.
  
**Create:**

Use this method in order create a table

    local.transaction("create", data, callback);  
 
    var data = {
        name : "database_name",
        table : "table_name",
        columns : ["col1", "col2", "col3", ...]
    };
    
    _columns_ field must be an array of strings.
 
**Drop:**

Delete a table and all its data
 
    local.transaction("drop", data, callback);  

    var data = {
        name : "database_name",
        table : "table_name"
    };

**Insert:**

Insert data to a table. Multirow insertion is also possible.

    local.transaction("insert", data, callback);    

    var data = {
        name : "database_name",
        table : "table_name",
        data : [
            {
                col1 : val1,
                col2 : val2,
                ...
            },
            {
                col1 : val1,
                col2 : val2,
                ...
            },
        ]  
    };

    _data_ must be an array of JSON objects. e.g.
    var data = {
        name : "database_name",
        table : "DEVICES",
        data : [
            {
                name : "device 1",
                type : "ctrl"
            },
            {
                name : "device 2",
                type : "ctrl"
            }
        ]
    }

**Delete:**

Delete data from a table.

    local.transaction("delete", data, callback);

    var data = {
        name : "database_name",
        table : "table_name",
        data : {
            col1 : val1
        }
    };

    delete where "col1" has value "val1"

    or

    var data = {
        name : "database_name",
        table : "table_name",
        data : {}
    };

    delete all from this table

**Update:**

Update data of a table.

    local.transaction("update", data, callback);

    var data = {
        name : "database_name",
        table : "table_name",
        data : {
            set : {
                col1 : val1,
                col2 : val2,
                ...
            },
            where : {
                col3 : val3,
                col4 : val4,
                ...
            }
        }
    };

    set and where must be JSON objects with one or many key value pairs
    e.g.
    var data = {
        name : "database_name",
        table : "DEVICES",
        data : {
            set : {
                name : "new_device"
            },
            where : {
                type : "ctrl",
                mac : "ff"
            }
        }
    };
    is equal to:
    UPDATE DEVICES SET name='new_device' WHERE type='ctrl' AND mac='ff'

    _set_ JSON cannot be empty
    _where_ JSON can be empty. In this case the set condition is applied to all rows of the table.

**Find:**

Search database.

    local.transaction("find", data, callback);

    var data = {
        name : "database_name",
        table : "table_name",
        data : {
            col1 : val1
        }
    };

    find data where "col1" has value "val1"

    or

    var data = {
        name : "database_name",
        table : "table_name",
        data : {}
    };

    find all data in this table
