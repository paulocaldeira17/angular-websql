'use strict';

/**
 * Angular Websql Service
 * @author Paulo Caldeira (@paulocaldeira17)
 * @version 0.0.1
 */
angular.module('paulocaldeira17.angular.websql', [])

  .factory('Websql', [function() {

    return {
      /**
       * Insert Query
       * example: "INSERT INTO {tableName} {fields} VALUES({values})"
       * @param tableName sql table name
       * @param obj
       * @return {string} query
       */
      insert: function(tableName, obj){
        var queryString = "INSERT INTO `{tableName}` ({fields}) VALUES({values}); ";
        // fields
        var fields='', values='';
        for(var i in obj){
          fields+=(Object.keys(obj)[Object.keys(obj).length - 1]==i)?"`"+i+"`":"`"+i+"`"+', ';
          values+=(Object.keys(obj)[Object.keys(obj).length - 1]==i)?"'"+obj[i]+"'":"'"+obj[i]+"', ";
        }
        return this.replace(queryString, {
          "{tableName}":tableName,
          "{fields}":fields,
          "{values}":values
        });
      },
      /**
       * Update Query
       * @param tableName
       * @param update obj
       * {
       *   "name":"PC",
       *   "age":"22"
       * }
       * @param where obj
       * example:
       * {
       *   "id":1
       *
       *   OR
       *
       *   "name":{
       *     "operator": "LIKE",
       *     "value": "Jo*",
       *     "union": "AND"
       *   },
       *   "age":{
       *     "operator": ">=",
       *     "value": 10
       *   }
       * }
       * @returns {string} Query
       */
      update: function(tableName, update, where){
        var queryString = "UPDATE `{tableName}` SET {update} WHERE {where}; ";
        var setString='';
        for(var i in update)
          setString+="`"+i+"`='"+update[i]+"'";
        var whereClause = this.whereClause(where);
        return this.replace(queryString,{
          "{tableName}": tableName,
          "{update}": setString,
          "{where}": whereClause
        });
      },
      /**
       * Delete Query
       * example: "DELETE FROM {tableName} WHERE {where};"
       * @param tableName
       * @param where clause
       * example:
       * {
       *   "id":1
       *
       *   OR
       *
       *   "name":{
       *     "operator": "LIKE",
       *     "value": "Jo*",
       *     "union": "AND"
       *   },
       *   "age":{
       *     "operator": ">=",
       *     "value": 10
       *   }
       * }
       * string: id=1 OR name LIKE Jo* AND age >= 10
       * @returns {string} Query
       */
      del: function(tableName, where){
        var queryString = "DELETE FROM `{tableName}` WHERE {where}; ";
        var whereClause = this.whereClause(where);
        return this.replace(queryString,{
          "{tableName}": tableName,
          "{where}": whereClause
        });
      },
      /**
       * Select element by values
       * @param tableName
       * @param where clause
       * example:
       * {
       *   "id":1
       *
       *   OR
       *
       *   "name":{
       *     "operator": "LIKE",
       *     "value": "Jo*",
       *     "union": "AND"
       *   },
       *   "age":{
       *     "operator": ">=",
       *     "value": 10
       *   }
       * }
       * string: id=1 OR name LIKE Jo* AND age >= 10
       * @returns {string} Query
       */
      select: function(tableName, where){
        var queryString = "SELECT * FROM `{tableName}` WHERE {where}; ";
        var whereClause = this.whereClause(where);
        return this.replace(queryString,{
          "{tableName}": tableName,
          "{where}": whereClause
        });
      },
      /**
       * Select all elements from table
       * @param tableName
       * @returns {string}
       */
      selectAll: function(tableName){
        return "SELECT * FROM `"+tableName+"`; ";
      },
      /**
       * Parses all where clause fields
       * @param where
       * @returns {string}
       */
      whereClause: function(where){
        var whereClause='';
        for(var i in where){
          whereClause+=(typeof where[i] === 'object')?
            (typeof where[i]["union"] === 'undefined')?
              (typeof where[i]["value"] === 'string' && where[i]["value"].match(/NULL/ig))?
                "`"+i+"` "+where[i]["value"]:
                "`"+i+"` "+where[i]["operator"]+" '"+where[i]["value"]+"'":
              (typeof where[i]["value"] === 'string' && where[i]["value"].match(/NULL/ig))?
                "`"+i+"` "+where[i]["value"]+" "+where[i]["union"]+" ":
                "`"+i+"` "+where[i]["operator"]+" '"+where[i]["value"]+"' "+where[i]["union"]+" ":
            (typeof where[i] === 'string' && where[i].match(/NULL/ig))?
              "`"+i+"` "+where[i]:
              "`"+i+"`='"+where[i]+"'";
        }
        return whereClause;
      },
      /**
       * Replace all patterns in a string
       * @param string
       * @param patterns
       * @returns {*}
       */
      replace: function(string, patterns){
        for(var h in patterns)
          string=string.replace(new RegExp(h, 'ig'), patterns[h]);
        return string;
      },

      /**
       * Create new table in schema
       * @param tableName
       * @param fields
       * example:
       * {
       *   "id":{
       *     "type": "INTEGER",
       *     "null": "NOT NULL",
       *     "primary": true,
       *     "auto_increment": true
       *   },
       *   "created":{
       *     "type": "TIMESTAMP",
       *     "null": "NOT NULL",
       *     "default": "CURRENT_TIMESTAMP"
       *   },
       *   "username":{
       *     "type": "TEXT"
       *     "null": "NOT NULL"
       *   }
       * }
       * @returns {string} Query
       */
      createTable: function(tableName, fields){
        var queryString = 'CREATE TABLE IF NOT EXISTS `{tableName}` ({fields}); ';
        var primary = []; // primary fields
        var fieldsString='';
        for(var i in fields){
          var fieldTemplate = '{type} {null}';
          // replace keys in fieldTemplate
          fieldsString+="`"+i+"` ";
          for(var key in fields[i]){
            fieldTemplate=fieldTemplate.replace(new RegExp('{'+key+'}','ig'), fields[i][key]);
          }
          fieldsString+=fieldTemplate;
          // default value
          if(typeof fields[i]["default"] !== 'undefined') fieldsString+=' DEFAULT '+fields[i]["default"];
          // primary
          if(typeof fields[i]["primary"] !== 'undefined') fieldsString+=' PRIMARY KEY';
          // auto_increment
          if(typeof fields[i]["auto_increment"] !== 'undefined') fieldsString+=' AUTOINCREMENT';
          if(Object.keys(fields)[Object.keys(fields).length - 1]!=i) fieldsString+=',';
          // primary
          if(typeof fields[i]["primary"] !== 'undefined' && fields[i]["primary"]) primary.push(i);
        }
        var replaces = {
          "tableName": tableName,
          "fields": fieldsString
        };
        for(var h in replaces){
          queryString=queryString.replace(new RegExp('{'+h+'}', 'ig'), replaces[h]);
        }
        return queryString;
      },
      /**
       * Drop Table in schema
       * @param tableName
       * @returns {string} Query
       */
      dropTable: function(tableName){
        return "DROP TABLE IF EXISTS `"+tableName+"`; ";
      }
    };
  }]);
