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
    table: 'table_name',
    columns: ['col1', 'col2', 'col3'],
};
```

**Drop:**

- Use this method in order to delete a table and all of its contents

```js
local.transaction('drop', data, callback);

var data = {
    name: 'database_name',
    table: 'table_name',
};
```

**Insert:**

- Use this method to insert data into a table
  - Multi-row insertion is also possible

```js
local.transaction('insert', data, callback);

var data = {
    name: 'database_name',
    table: 'table_name',
    data: [
        {
            col1: 'val1',
            col2: 'val2',
        },
        {
            col1: 'val1',
            col2: 'val2',
        },
    ],
};

// `data` must be an array of JSON objects. e.g.

var data = {
    name: 'database_name',
    table: 'devices',
    data: [
        {
            name: 'device 1',
            type: 'ctrl',
        },
        {
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

// Find data where `col1` has a value of `val1`

var data = {
    name: 'database_name',
    table: 'table_name',
    data: {
        col1: 'val1',
    },
};

// Or find and return all data

var data = {
    name: 'database_name',
    table: 'table_name',
    data: {},
};
```

---

## Result

- The result of all the methods will be a JSON object

```js
var callbackData = {
    done: flag,
    data: data,
};
```

- `done` returns `true` if the database call is successful, or `false` if it is not
- `data` returns a message (e.g. "Table created successfully")
- In case of a FIND transaction the result is returned in a `data.rows` array