Angular WebSql Service
====================
Helps you generating websql simple queries without writing any sql code.

Setup
---------------------
1. `bower install angular-websql`
2. Include the `angular-websql.js` script, and this script's dependencies are included in your app.
3. Add `paulocaldeira17.angular.websql` as a module dependency to your app.

Methods
---------------------
### Create Table
#### `Websql.createTable(string tableName, object fields)`
#### Example:
```javascript
Websql.createTable('user', {
  "id":{
    "type": "INTEGER",
    "null": "NOT NULL",
    "primary": true, // primary
    "auto_increment": true // auto increment
  },
  "created":{
    "type": "TIMESTAMP",
    "null": "NOT NULL",
    "default": "CURRENT_TIMESTAMP" // default value
  },
  "username":{
    "type": "TEXT",
    "null": "NOT NULL"
  },
  "password": {
    "type": "TEXT",
    "null": "NOT NULL"
  },
  "age": {
    "type": "INTEGER",
    "null": "NOT NULL"
  }
})
```
### Drop Table
#### `Websql.dropTable(string tableName)`
### Insert
#### `Websql.insert(string tableName, object fields)`
#### Example:
```javascript 
Websql.insert('user', {"username": 'pc', "password": '1234', 'age': 22})
```
```sql 
INSERT INTO user (username, password, age) VALUES('pc', '1234', 22)
```
### Update
#### `Websql.update(string tableName, object fields)`
#### Examples:
```javascript 
Websql.update("user", {"username": 'paulo.caldeira'}, {
  'id': 1
})
```
```sql 
UPDATE user SET username='paulo.caldeira' WHERE id=1
```
```javascript 
Websql.update("user", {"age": 23}, {
  "username": {
    "operator":'LIKE',
    "value":'paulo.*'
    "union":'AND' // condition suffix
  },
  "age": 22
})
```
```sql 
UPDATE user SET age=23 WHERE username LIKE 'paulo.*' AND age=22
```
### Delete
#### `Websql.delete(string tableName, object where)`
```javascript 
Websql.del("user", {"id": 1})
```
```sql 
DELETE user WHERE id=1
```
### Select
### `Websql.select(string tableName, object where)`
```javascript 
Websql.select("user", {
  "age": {
    "value":'IS NULL',
    "union":'AND'
  },
  "username":'IS NOT NULL'
})
```
```sql 
SELECT * FROM user WHERE age IS NULL AND username IS NOT NULL
```

### `Websql.selectAll(string tableName)`
```javascript 
Websql.selectAll("user")
```
```sql 
SELECT * FROM user
```
Operators
---------------------
Your can use common operators like `=`, `>=`, `<=` and `LIKE`. You can use also `NULL` and `NOT NULL` as condition values.
