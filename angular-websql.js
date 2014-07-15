/**
 * angular-websql
 * Helps you generate and run websql queries with angular services.
 * © MIT License
 */
"use strict";
angular.module("angular-websql", []).factory("$webSql", ["$q",
    function($q) {
      return {
        openDatabase: function(dbName, version, desc, size) {
          try {
            var db = openDatabase(dbName, version, desc, size),
	    models = {};
            if (typeof(openDatabase) == "undefined")
              throw "Browser does not support web sql";
            return {
              executeQuery: function(query, values) {
		var deferred = $q.defer();
                console.log(query, values);
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
              insert: function(c, e) {
                var f = "INSERT INTO `{tableName}` ({fields}) VALUES({values});";
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
                  e += "`" + d + "`= ?";
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
                var d = "DELETE FROM `{tableName}` WHERE {where}; ";
                var a = this.whereClause(c);
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
                  else if(typeof b[c]["value"] !== "undefined" && typeof b[c] === "object" && !b[c]["value"].match(/NULL/ig)) v.push(b[c]["value"]);
                  a += (typeof b[c] === "object") ? 
                          (typeof b[c]["union"] === "undefined") ? 
                            (typeof b[c]["value"] === "string" && b[c]["value"].match(/NULL/ig)) ? 
                              "`" + c + "` " + b[c]["value"] : 
                              "`" + c + "` " + b[c]["operator"] + " ? " : 
                            (typeof b[c]["value"] === "string" && b[c]["value"].match(/NULL/ig)) ? 
                              "`" + c + "` " + b[c]["value"] + " " + b[c]["union"] + " " : 
                              "`" + c + "` " + b[c]["operator"] + " ? " + b[c]["union"] + " " : 
                          (typeof b[c] === "string" && b[c].match(/NULL/ig)) ? 
                            "`" + c + "` " + b[c] : 
                            "`" + c + "`=?"
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
	      /**
	       * lodash bind function
	       * @url http://lodash.com/docs#bind
	       * @api private
	       */
	      _bind : function bind(func, context) {
		var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
		var slice            = ArrayProto.slice;
		var nativeBind         = FuncProto.bind;

		var args, bound;
		if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!isFunction(func)) throw new TypeError;
		args = slice.call(arguments, 2);
		return bound = function() {
		  if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
		  ctor.prototype = func.prototype;
		  var self = new ctor;
		  ctor.prototype = null;
		  var result = func.apply(self, args.concat(slice.call(arguments)));
		  if (Object(result) === result) return result;
		  return self;
		};
	      },

	      /**
	       * Store model for further use
	       * @param {String} {String} {Array} [{Array}]
	       */
	      addModel: function(name, table, oneToMany, manyToOne){
		var model = {};

		model.oneToMany = Object.prototype.toString.call(oneToMany) === '[object Array]'
		  ? oneToMany : [];
		model.manyToOne = Object.prototype.toString.call(manyToOne) === '[object Array]'
		  ? manyToOne : [];
		model.table = table;

		models[name] = model;
	      },

	      /**
	       * Select model from database
	       * @param {String} {Object}
	       * @return $q promise
	       */
	      selectModel: function(name, where){
		var deferred = $q.defer(),
		model = models[name],
		modelResult = [],
		that = this;

		this.select(model.table, where).then(function(res){
		  var subQueryPromises = [];

		  for(i = 0; i < res.rows.length; i++){
		    father = res.rows.item(i);
		    modelResult.push(father);

		    /* query and inject one to many */
		    for (j = 0; j < model.oneToMany.length; j++){
		      var child = model.oneToMany[j],
		      where = {};

		      where[child.foreignKey] = father[child.primaryKey];
		      var select = that.select(child["table"], where);

		      select.then(that._bind(function(subResults){
			this.father[this.insertName] = [];
			for (k = 0; k < subResults.rows.length; k++){
			  this.father[this.insertName].push(subResults.rows.item(k));
			}
		      }, {father : father, insertName : child.insertName}));;

		      subQueryPromises.push(select);
		    }

		    /* query and inject one to many */
		    for (j = 0; j < model.manyToOne.length; j++){
		      var child = model.manyToOne[j],
		      where = {};

		      where[child.primaryKey] = father[child.foreignKey];
		      var select = that.select(child["table"], where);

		      select.then(that._bind(function(subResults){
			if (subResults.rows.length > 0){
			  this.father[this.insertName] = subResults.rows.item(0);
			}
		      }, {father : father, insertName : child.insertName}));

		      subQueryPromises.push(select);
		    }
                  }

		  /* when all sub-queries completed fire main pomise */
		  $q.all(subQueryPromises).then(function(){
		    deferred.resolve(modelResult);
		  });

		});

		return deferred.promise;
	      },
            };
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
]);
