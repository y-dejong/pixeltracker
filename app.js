const express = require("express"),
	  sqlite = require("sqlite3").verbose(),
	  fs = require("fs"),
	  path = require("path");
const app = express();

app.use(express.urlencoded({ extended: true }));

//sqlite init
var dbFile = "./.data/sqlite.db";
var db = new sqlite.Database(dbFile);
db.serialize(function() {
	if(!fs.existsSync(dbFile)) {
		db.run("CREATE TABLE Pixels (id INTEGER PRIMARY KEY NOT NULL, name TEXT, dateAccessed TEXT, dateCreated NOT NULL, customUrl TEXT)");
		db.run("CREATE TABLE Accesses (date TEXT, pixelId INTEGER)");
		console.log("Made tables");
	}
});

//Static files
console.log(path.join(__dirname, "static"));
app.use(express.static(path.join(__dirname, "static")));
app.use(express.static(path.join(__dirname, "scripts")));

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/images/:id.png", function(req, res) {
	db.serialize(function() {
		var row = {};
		row.accessDate = new Date(Date.now()).toISOString();
		if(isNaN(req.params.id)) {
			console.log("Got access to invalid id: " + req.params.id);
		} else {
			row.id = Number(req.params.id);
			db.run(`INSERT INTO Accesses (date, pixelId) VALUES ("${row.accessDate}", ${row.id})`);
			db.run(`UPDATE Pixels SET dateAccessed = "${row.accessDate}" WHERE id=${row.id}`);
			console.log("Got access to " + req.params.id + " at " + row.accessDate);
			res.sendFile(path.join(__dirname, "/static/transparent.png"));
		}
	});
});

app.get("/getPixels", function(req, res) {
	console.log("Got req");
	db.all("SELECT * FROM Pixels", function(err, rows) {
		res.send(JSON.stringify(rows, null, 2));
	});
});

app.post("/addPixel", function(req, res) {
	var row = {};
	db.serialize(function() {
		db.get("SELECT id FROM Pixels ORDER BY id DESC", function(err, toprow) {
			if (err) {
				console.log("Error reading from Pixels table: " + err);
			} else {
				console.log("Not an error");
				if(toprow == undefined) row.id = 0;
				else row.id = toprow.id + 1;
			}

			console.log("body is " + req.body.name);
			row.name = req.body.name;
			row.dateCreated = new Date(Date.now()).toISOString();
			console.log(`INSERT INTO Pixels (id, name, dateCreated) VALUES (${row.id}, "${row.name}", "${row.dateCreated}")`);
			db.run(`INSERT INTO Pixels (id, name, dateCreated) VALUES (${row.id}, "${row.name}", "${row.dateCreated}")`);
			res.end();
		});
	});
});

var listener = app.listen(8082, function() {
	console.log("Your app is listening on port " + 8082);
});
