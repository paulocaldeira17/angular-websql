/**
 * angular-websql
 * Helps you generate and run websql queries with angular services.
 * © MIT License
 * @version 1.0.2
 */
/**
 * angular-websql
 * Helps you generate and run websql queries with angular services.
 * © MIT License
 * @version 1.0.2
 */
"use strict";
angular.module("angular-websql", []).factory("$webSql", ["$q",
	function($q) {
		return {
			openDatabase: function(dbName, version, desc, size) {
				try {
					var db = openDatabase(dbName, version, desc, size);
					if (typeof(openDatabase) == "undefined")
						throw "Browser does not support web sql";
					return {
						executeQuery: function(query, values) {
                            var deferred = $q.defer();
							db.transaction(function(tx) {
								tx.executeSql(query, values, function(tx, results) {
									deferred.resolve(results);
								}, function(tx, e){
									console.log("There has been an error: " + e.message);
									deferred.reject();
								});
							});
							return deferred.promise;
						},
						executeQueries: function(queries, values) {
                            var deferred = $q.defer();
                            db.transaction(function(tx) {
								for(var idx = 0; idx < queries.length; ++idx) {
                                    tx.executeSql(queries[idx], values[idx], function(tx, results) {
                                    }, function(tx, e){
                                        console.log("There has been an error: " + e.message);
                                        deferred.reject();
                                    });
                                }
							},
                            function(tx, err) {
                                console.log("There has been an error: " + err);
                                deferred.reject();
                            },
                            function(tx, err) {
                                deferred.resolve(err);
                            });
							return deferred.promise;
						},
						insert: function(c, e, r) {
							var f = (typeof r === "boolean" && r) ? "INSERT OR REPLACE" : "INSERT";
							f += " INTO `{tableName}` ({fields}) VALUES({values});";
							var a = "",
							b = "",
							v = [];
							for (var d in e) {
								a += (Object.keys(e)[Object.keys(e).length - 1] == d) ? "`" + d + "`" : "`" + d + "`, ";
								b += (Object.keys(e)[Object.keys(e).length - 1] == d) ? "?" : "?, ";
								v.push(e[d]);
							}
							return this.executeQuery(this.replace(f, {
								"{tableName}": c,
								"{fields}": a,
								"{values}": b
							}), v);
						},
						bulkInsert: function(table, objects, r) { 
                            var deferred = $q.defer();
                            var self = this;
                            if(!(objects instanceof Array)) {
                                return this.insert(table, objects, r)
                            } else if(typeof objects === 'undefined' || objects.length <= 0) {
                                deferred.reject();
                            } else {
                                var query = (typeof r === "boolean" && r) ? "INSERT OR REPLACE" : "INSERT";
                                query += " INTO `{tableName}` ({fields}) VALUES({values});";
                                db.transaction(function(tx) {
                                    for (var idx in objects) {
                                        var object = objects[idx]
                                        var a = "",
                                        b = "",
                                        values = [];
                                        for (var d in object) {
                                            a += (Object.keys(object)[Object.keys(object).length - 1] == d) ? "`" + d + "`" : "`" + d + "`, ";
                                            b += (Object.keys(object)[Object.keys(object).length - 1] == d) ? "?" : "?, ";
                                            values.push(object[d]);
                                        }
                                        query = self.replace(query, {
                                            "{tableName}": table,
                                            "{fields}": a,
                                            "{values}": b
                                        })
                                        tx.executeSql(query, values, function(tx, results) {
                                        }, function(tx, e){
                                            console.log("There has been an error: " + e.message);
                                            deferred.reject();
                                        });
                                    }
                                },
                                function(tx, err) {
                                    console.log("There has been an error: " + err);
                                    deferred.reject();
                                },
                                function(tx, res) {
                                    deferred.resolve(res);
                                });
                            }
                            return deferred.promise;                            
						},
						update: function(b, g, c) {
							var f = "UPDATE `{tableName}` SET {update} WHERE {where}; ";
							var e = "";
							var v = [];
							for (var d in g) {
								e += (Object.keys(g)[Object.keys(g).length - 1] == d) ? "`" + d + "`= ?" : "`" + d + "`= ?,";
								v.push(g[d]);
							}
							var a = this.whereClause(c);
							return this.executeQuery(this.replace(f, {
								"{tableName}": b,
								"{update}": e,
								"{where}": a.w
							}), v.concat(a.p));
						},
						del: function(b, c) {
							if (c){
								var d = "DELETE FROM `{tableName}` WHERE {where}; ";
								var a = this.whereClause(c);
							}else{
								var d = "DELETE FROM `{tableName}`;";
								var a = {p : []};
							}
							return this.executeQuery(this.replace(d, {
								"{tableName}": b,
								"{where}": a.w
							}), a.p);
						},
						select: function(b, c) {
							var d = "SELECT * FROM `{tableName}` WHERE {where}; ";
							var a = this.whereClause(c);
							return this.executeQuery(this.replace(d, {
								"{tableName}": b,
								"{where}": a.w
							}), a.p);
						},
						selectLimit: function(table, where, limit) {
							var d = "SELECT * FROM `{tableName}` WHERE {where} LIMIT {limit}; ";
							var a = this.whereClause(where);
                            if (isNaN(limit))
                            {
                                throw "Limit must be a number.";
                            }
							return this.executeQuery(this.replace(d, {
								"{tableName}": table,
								"{where}": a.w,
                                "{limit}": limit
							}), a.p);
						},
						selectAll: function(table, options) {
                            var query = "SELECT * FROM `{tableName}` ";
                            var extras = ""
                            if( typeof options !== "undefined" && options.length > 0) {
                            	query += " {extras} ";
                            	for (var sidx in options) {
                            		extras += " "+options[sidx].operator+" ";
	                                for(var idx in options[sidx].columns) {
	                                    extras += "`"+options[sidx].columns[idx] + "`,";
	                                }
	                                extras = extras.substring(0, extras.length - 1)+" ";
	                                if( typeof options[sidx].postOperator !== "undefined"){
	                                	query += options[sidx].postOperator+" ";
	                                }
                            	}
                                query += ";";
                            }
                            return this.executeQuery(this.replace(query, {
								"{tableName}": table,
								"{extras}": extras
							}), []);
						},
						selectAllLimit: function(table, limit) {
                            if (isNaN(limit))
                            {
                                throw "Limit must be a number.";
                            }
							return this.executeQuery("SELECT * FROM `" + table + "` LIMIT " + limit + "; ", []);
						},
						selectOne: function(table) {
							return this.selectAllLimit(table,1);
						},
						whereClause: function(b) {
							var a = "",
							v = [];
							for (var c in b) {
								if(typeof b[c] !== "undefined" && typeof b[c] !== "object" && typeof b[c] === "string" && !b[c].match(/NULL/ig)) v.push(b[c]);
								else if(typeof b[c] !== "undefined" && typeof b[c] !== "object" && typeof b[c] === "number") v.push(b[c]);
								else if(typeof b[c]["value"] !== "undefined" && typeof b[c] === "object" && (typeof b[c]["value"] === "number" || !b[c]["value"].match(/NULL/ig))) v.push(b[c]["value"]);
								a += (typeof b[c] === "object") ? 
												(typeof b[c]["union"] === "undefined") ? 
													(typeof b[c]["value"] === "string" && b[c]["value"].match(/NULL/ig)) ? 
														"`" + c + "` " + b[c]["value"] : 
														(typeof b[c]["operator"] !== "undefined")?
															"`" + c + "` " + b[c]["operator"] + " ? " : 
															"`" + c + "` = ?" : 
													(typeof b[c]["value"] === "string" && b[c]["value"].match(/NULL/ig)) ? 
															"`" + c + "` " + b[c]["value"] + " " + b[c]["union"] + " " : 
															(typeof b[c]["operator"] !== "undefined") ? 
																"`" + c + "` " + b[c]["operator"] + " ? " + b[c]["union"] + " " : 
																"`" + c + "` = ? " + b[c]["union"] + " " : 
												(typeof b[c] === "string" && b[c].match(/NULL/ig)) ? 
													"`" + c + "` " + b[c] : 
													"`" + c + "` = ?"
							}
							return {w:a,p:v};
						},
						replace: function(a, c) {
							for (var b in c) {
								a = a.replace(new RegExp(b, "ig"), c[b])
							}
							return a;
						},
                        addColumns: function(tableName, newColumns) {
                            var queries = [];
                            var values = [];
                            for(var e in newColumns) {
                                var b = "ALTER TABLE `{tableName}` ADD COLUMN {fields}; ";
                                var l = "{type} {null}";
                                var c = [];
                                var a = "`" + e + "` ";
                                if(typeof newColumns[e]["null"]==="undefined") newColumns[e]["null"]="NULL";
								for (var k in newColumns[e]) {
									l = l.replace(new RegExp("{" + k + "}", "ig"), newColumns[e][k])
								}
                                a += l;
								if (typeof newColumns[e]["default"] !== "undefined") {
									a += " DEFAULT " + newColumns[e]["default"]
								}
								if (typeof newColumns[e]["primary"] !== "undefined") {
									a += " PRIMARY KEY"
								}
								if (typeof newColumns[e]["auto_increment"] !== "undefined") {
									a += " AUTOINCREMENT"
								}
								if (Object.keys(newColumns)[Object.keys(newColumns).length - 1] != e) {
									a += ","
								}
								if (typeof newColumns[e]["primary"] !== "undefined" && newColumns[e]["primary"]) {
									c.push(e)
								}                                
                                var d = {
                                    tableName: tableName,
                                    fields: a
                                };
                                for (var f in d) {
                                    b = b.replace(new RegExp("{" + f + "}", "ig"), d[f])
                                }
                                queries.push(b);
                                values.push([]);
                            }                            
                            return this.executeQueries(queries, values);                            
                        },
						createTable: function(j, g) {
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
							return this.executeQuery(b, []);
						},
                        createOrAlterTable: function(tableName, iColumns) {
							var self = this;
                            return self.select("sqlite_master", {
                                "type": {
                                    "value": 'table',
                                    "union": 'AND'
                                },
                                "tbl_name": tableName
                            }).then(function(results) {
                                if(results.rows.length <= 0) {
                                    return self.createTable(tableName, iColumns)
                                } else {
                                    for(var i=0; i < results.rows.length; ++i) {
                                        var sql = results.rows.item(i).sql
                                        var regexp = new RegExp("`[^`]+`", "ig")
                                        var currentColumns = sql.replace(/(CREATE TABLE `.*` \(|\))/gi, "").match(regexp)                                        
                                        var newColumns = {};
                                        for(var newColIdx in iColumns) {                                            
                                            if(currentColumns.indexOf("`" + newColIdx + "`") == -1) {
                                                newColumns[newColIdx] = iColumns[newColIdx];
                                            }
                                        }
                                        return self.addColumns(tableName, newColumns)                                    
                                    }
                                }
                            })
                        },
						dropTable: function(a) {
							return this.executeQuery("DROP TABLE IF EXISTS `" + a + "`; ", []);
						},
					};
				} catch (err) {
					console.error(err);
				}
			}
		}
	}
]);
