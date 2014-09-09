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
						selectAll: function(a) {
							return this.executeQuery("SELECT * FROM `" + a + "`; ", []);
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
