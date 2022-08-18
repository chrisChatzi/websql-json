Web SQLite access library. Communicate easily and cleanly using JSON objects.

## Usage

```js
var local = require('websql-json');
```

**Connect:**

- Use this method in order to connect to the database

**If you call the `connect` method at the start, you do not need to include the `name` field on subsequent transactions.**

```js
local.connect(data, callback);

var data = {
    name: 'database_name',
    version: '1.0',
    descr: 'database_description',
    size: 500000,
};

// or

var data = {
    name: 'database_name',
};
```

- The `name` field is mandatory and must be defined.
- `version`, `descr` and `size` are all optional fields.
  - The default value for `version` is `1.0`. It can only be `1.0` or `2.0`.
  - The default value for `descr` will be the same as the name of the database.
  - The default value for `size` is `500000`. Its maximum value is `52428000`.

**Create:**

- Use this method in order to create a table

```js
local.transaction('create', data, callback);

// The `columns` field must be an array of strings

var data = {
    name: 'database_name',
    data: [
        {
            table: 'table_a',
            columns: ['col1', 'col2'],
        },
        {
            table: 'table_b',
            columns: ['col3', 'col4'],
        },
    ],
    inserts: [
        name: 'database_name',
        data: [
            {
                table: 'table_a',
                data: {
                    col1: 'val1',
                    col2: 'val2',
                },
            },
            {
                table: 'table_b',
                data: {
                    col3: 'val3',
                    col4: 'val4',
                },
            },
        ],
    ],
};
```

**Drop:**

- Use this method in order to delete a table and all of its contents

```js
local.transaction('drop', data, callback);

var data = {
    name: 'database_name',
    data: [
        {
            table: 'table_a',
        },
        {
            table: 'table_b',
        },
    ],
};
```

**Insert:**

- Use this method to insert data into a table
  - Multi-row insertion is also possible

```js
local.transaction('insert', data, callback);

var data = {
    name: 'database_name',
    data: [
        {
            table: 'table_a',
            data: {
                col1: 'val1',
                col2: 'val2',
            },
        },
        {
            table: 'table_b',
            data: {
                col3: 'val3',
                col4: 'val4',
            },
        },
    ],
};

// `data` must be an array of JSON objects. e.g.

var data = {
    name: 'database_name',
    data: [
        {
            table: 'devices',
            name: 'device 1',
            type: 'ctrl',
        },
        {
            table: 'devices',
            name: 'device 2',
            type: 'ctrl',
        },
    ],
};
```

**Delete:**

- Use this method in order to delete data from a table

```js
local.transaction('delete', data, callback);

// Delete data where `col1` has a value of `val1`

var data = {
    name: 'database_name',
    table: 'table_name',
    data: {
        col1: 'val1',
    },
};

// Or delete all data from the table

var data = {
    name: 'database_name',
    table: 'table_name',
    data: {},
};
```

**Update:**

- Use this method to update data in a table

```js
local.transaction('update', data, callback);

var data = {
    name: 'database_name',
    table: 'table_name',
    data: {
        set: {
            col1: 'val1',
            col2: 'val2',
        },
        where: {
            col3: 'val3',
            col4: 'val4',
        },
    },
};

// `set` and `where` must be JSON objects with one or many key value pairs. e.g.

var data = {
    name: 'database_name',
    table: 'devices',
    data: {
        set: {
            name: 'new_device',
        },
        where: {
            type: 'ctrl',
            mac: 'ff',
        },
    },
};
```

- This generates the SQL: `UPDATE devices SET name='new_device' WHERE type='ctrl' AND mac='ff';`
  - In this case the `set` condition is applied to all rows of the table.
- `set` _cannot be_ empty
- `where` _can be_ empty

**Find:**

- Use this method to search a database table for a particular piece of data

```js
local.transaction('find', data, callback);

// Find data where `col1` has a value of `val1` or `val2` or `val3` and `col2` has a value of `val4`
// Additionally join on `table_b` and select all columns from `table_b`

var data = {
    name: 'database_name',
    table: 'table_a',
    data: {
        col1: ['val1', 'val2', 'val3'],
        col2: 'val4',
    },
    join: {
        query: 'JOIN table_b on table_a.join_id = table_b.id',
    },
    selects: 'table_b.*',
    groupBy: 'join_id',
    orderBy: [
        'join_id',
        'another_column',
    ],
};

// Or find and return all data from `table_a`

var data = {
    name: 'database_name',
    table: 'table_a',
    data: {},
};
```

---

## Result

- The result of all the methods will be a JSON object

```js
var callbackData = {
    // Returned from a CREATE transaction when additional INSERT data is provided
    // This allows an INSERT transaction to proceed directly after a CREATE
    callbackData: { data: [], name: 'database_name' },

    done: flag,
    message: message,
    queryType: queryType,

    // Returned from a FIND transaction as an `SQLResultSetRowList`
    rows: [],
};
```

- `done` returns `true` if the database call is successful, or `false` if it is not
- `queryType` returns the type of query that was executed (e.g. "create", "insert", etc.)
- `message` returns a success or failure string (e.g. "Table created successfully")
- In case of a FIND transaction the result is returned under a `rows` object key