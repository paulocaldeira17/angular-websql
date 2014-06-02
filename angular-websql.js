/**
 * angular-websql
 * Helps you generate and run websql queries with angular services.
 * © MIT License
 */
"use strict";
angular.module("angular-websql", []).factory("$webSql", [
    function() {
      return {
        openDatabase: function(dbName, version, desc, size) {
          try {
            var db = openDatabase(dbName, version, desc, size);
            if (typeof(openDatabase) == "undefined")
              throw "Browser does not support web sql";
            return {
              executeQuery: function(query, callback) {
                db.transaction(function(tx) {
                  tx.executeSql(query, [], function(tx, results) {
                    if (callback)
                      callback(results);
                  });
                });
                return this;
              },
              insert: function(c, e, callback) {
                var f = "INSERT INTO `{tableName}` ({fields}) VALUES({values}); ";
                var a = "",
                b = "";
                for (var d in e) {
                  a += (Object.keys(e)[Object.keys(e).length - 1] == d) ? "`" + d + "`" : "`" + d + "`, ";
                  b += (Object.keys(e)[Object.keys(e).length - 1] == d) ? "'" + e[d] + "'" : "'" + e[d] + "', "
                }
                this.executeQuery(this.replace(f, {
                  "{tableName}": c,
                  "{fields}": a,
                  "{values}": b
                }), callback);
                return this;
              },
              update: function(b, g, c, callback) {
                var f = "UPDATE `{tableName}` SET {update} WHERE {where}; ";
                var e = "";
                for (var d in g) {
                  e += "`" + d + "`='" + g[d] + "'"
                }
                var a = this.whereClause(c);
                this.executeQuery(this.replace(f, {
                  "{tableName}": b,
                  "{update}": e,
                  "{where}": a
                }), callback);
                return this;
              },
              del: function(b, c, callback) {
                var d = "DELETE FROM `{tableName}` WHERE {where}; ";
                var a = this.whereClause(c);
                this.executeQuery(this.replace(d, {
                  "{tableName}": b,
                  "{where}": a
                }), callback);
                return this;
              },
              select: function(b, c, callback) {
                var d = "SELECT * FROM `{tableName}` WHERE {where}; ";
                var a = this.whereClause(c);
                this.executeQuery(this.replace(d, {
                  "{tableName}": b,
                  "{where}": a
                }), callback);
                return this;
              },
              selectAll: function(a, callback) {
                this.executeQuery("SELECT * FROM `" + a + "`; ", callback);
                return this;
              },
              whereClause: function(b, callback) {
                var a = "";
                for (var c in b) {
                  a += (typeof b[c] === "object") ? (typeof b[c]["union"] === "undefined") ? (typeof b[c]["value"] === "string" && b[c]["value"].match(/NULL/ig)) ? "`" + c + "` " + b[c]["value"] : "`" + c + "` " + b[c]["operator"] + " '" + b[c]["value"] + "'" : (typeof b[c]["value"] === "string" && b[c]["value"].match(/NULL/ig)) ? "`" + c + "` " + b[c]["value"] + " " + b[c]["union"] + " " : "`" + c + "` " + b[c]["operator"] + " '" + b[c]["value"] + "' " + b[c]["union"] + " " : (typeof b[c] === "string" && b[c].match(/NULL/ig)) ? "`" + c + "` " + b[c] : "`" + c + "`='" + b[c] + "'"
                }
                return a;
              },
              replace: function(a, c, callback) {
                for (var b in c) {
                  a = a.replace(new RegExp(b, "ig"), c[b])
                }
                return a;
              },
              createTable: function(j, g, callback) {
                var b = "CREATE TABLE IF NOT EXISTS `{tableName}` ({fields}); ";
                var c = [];
                var a = "";
                for (var e in g) {
                  var l = "{type} {null}";
                  a += "`" + e + "` ";
                  if(typeof g[e]["null"]==="undefined") g[e]["null"]="NULL";
                  for (var k in g[e]) {
                    l = l.replace(new RegExp("{" + k + "}", "ig"), g[e][k])
                  }
                  a += l;
                  if (typeof g[e]["default"] !== "undefined") {
                    a += " DEFAULT " + g[e]["default"]
                  }
                  if (typeof g[e]["primary"] !== "undefined") {
                    a += " PRIMARY KEY"
                  }
                  if (typeof g[e]["auto_increment"] !== "undefined") {
                    a += " AUTOINCREMENT"
                  }
                  if (Object.keys(g)[Object.keys(g).length - 1] != e) {
                    a += ","
                  }
                  if (typeof g[e]["primary"] !== "undefined" && g[e]["primary"]) {
                    c.push(e)
                  }
                }
                var d = {
                  tableName: j,
                  fields: a
                };
                for (var f in d) {
                  b = b.replace(new RegExp("{" + f + "}", "ig"), d[f])
                }
                console.log(b);
                this.executeQuery(b, callback);
                return this;
              },
              dropTable: function(a, callback) {
                this.executeQuery("DROP TABLE IF EXISTS `" + a + "`; ", callback);
                return this;
              },
            };
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
]);