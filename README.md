Angular WebSql Service
====================
Helps you generate websql simple queries and run them without writing any sql code.

Setup
---------------------
1. `bower install angular-websql`
2. Include the `angular-websql.min.js` and angular itself.
3. Add `angular-websql` as a module dependency to your app.

Usage
---------------------
1- Add ```$webSql``` provider to a controller.  
2- Open a database. See [method](#open-database).  
3- Use returned database object's methods.

Methods
---------------------
### Open Database
#### `$webSql.openDatabase(dbName, version, desc, size)`
#### Example:
```javascript
$scope.db = $webSql.openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024); 
```
1- Database name  
2- Version number  
3- Text description  
4- Size of database  

#### Returns
An object, containing database operation methods, is returned with ```openDatabase``` method.
All methods return a promise which takes query result object as parameter.
These methods are:  
- [createTable()](#create-table)  
- [createOrAlterTable()](#create-or-alter-table)  
- [dropTable()](#drop-table)  
- [update()](#update)  
- [delete()](#delete)  
- [select()](#select)  
- [selectLimit()](#select-limit)  
- [selectAll()](#select-all)  
- [selectAllLimit()](#select-all-limit)  
- [selectOne()](#select-one)  

## Database Methods
### Create Table
#### `createTable(string tableName, object fields)`
#### Example:
```javascript
createTable('user', {
  "id":{
    "type": "INTEGER",
    "null": "NOT NULL", // default is "NULL" (if not defined)
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
    "type": "INTEGER"
  }
})
```
### Create or Alter Table
#### `createOrAlterTable(string tableName, object fields)`
#### Example:
```javascript
createTable('user', {
  "id":{
    "type": "INTEGER",
    "null": "NOT NULL", // default is "NULL" (if not defined)
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
    "type": "INTEGER"
  },
  "newAddedField": {
    "type": "TEXT"
  }
})
```
### Drop Table
#### `dropTable(string tableName)`
### Insert
#### `insert(string tableName, object fields, boolean replace)`
#### Example:
```javascript 
$scope.db.insert('user', {"username": 'pc', "password": '1234', 'age': 22}).then(function(results) {
  console.log(results.insertId);
})
```
```sql 
INSERT INTO user (username, password, age) VALUES('pc', '1234', 22)
```
### Update
#### `update(string tableName, object fields)`
#### Examples:
```javascript 
$scope.db.update("user", {"username": 'paulo.caldeira'}, {
  'id': 1
})
```
```sql 
UPDATE user SET username='paulo.caldeira' WHERE id=1
```
```javascript 
$scope.db.update("user", {"age": 23}, {
  "username": {
    "operator":'LIKE',
    "value":'paulo.*',
    "union":'AND' // condition suffix
  },
  "age": 22
})
```
```sql 
UPDATE user SET age=23 WHERE username LIKE 'paulo.*' AND age=22
```
### Delete
#### `del(string tableName, object where)`
```javascript 
$scope.db.del("user", {"id": 1})
```
```sql 
DELETE user WHERE id=1
```
### Select
#### `select(string tableName, object where)`
```javascript 
$scope.db.select("user", {
  "age": {
    "value":'IS NULL',
    "union":'AND'
  },
  "username":'IS NOT NULL'
}).then(function(results) {
  $scope.users = [];
  for(i=0; i < results.rows.length; i++){
    $scope.users.push(results.rows.item(i));
  }
})
```
```sql 
SELECT * FROM user WHERE age IS NULL AND username IS NOT NULL
```
### Select with limit
#### `selectLimit(string table, object where, int limit)`
```javascript 
$scope.db.selectLimit("user", {
  "age": {
    "value":'IS NULL',
    "union":'AND'
  },
  "username":'IS NOT NULL'
}, 10).then(function(results) {
  $scope.users = [];
  for(i=0; i < results.rows.length; i++){
    $scope.users.push(results.rows.item(i));
  }
})
```
```sql 
SELECT * FROM user WHERE age IS NULL AND username IS NOT NULL LIMIT 10
```
### Select All
#### `selectAll(string tableName)`
```javascript 
$scope.db.selectAll("user").then(function(results) {
  $scope.users = [];
  for(var i=0; i < results.rows.length; i++){
    $scope.users.push(results.rows.item(i));
  }
})
```
```sql 
SELECT * FROM user
```
### Select All with limit
#### `selectAllLimit(string tableName, int limit)`
```javascript 
$scope.db.selectAllLimit("user", 10).then(function(results) {
  $scope.users = [];
  for(var i=0; i < results.rows.length; i++){
    $scope.users.push(results.rows.item(i));
  }
})
```
```sql 
SELECT * FROM user LIMIT 10
```
### Select One
#### `selectOne(string tableName)`
```javascript 
$scope.db.selectOne("user")
```
```sql 
SELECT * FROM user LIMIT 1
```
Operators
---------------------
Your can use common operators like `=`, `>=`, `<=` and `LIKE`. You can use also `IS NULL` and `NOT NULL` as condition values.

Contributors
---------------------
Thanks to github community, our libraries do not depend only from our work but also from work of contributors. I want to thank all those who in any way participated in the development of this library. 

Special thanks to these contributors:
* @gfauchart 
* @dbtek

Changelog
---------------------
### v1.0.2
* prevent empty operator in where clause
* insert method update with replace flag to "INSERT OR REPLACE" queries

### v1.0.1
* escape single quote or double quote value(s)
* changing callback to angular promise
