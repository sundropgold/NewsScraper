/*
	================== The Onion News Scraper ==================

	- Server file for an app that scrapes articles off The Onion
	- Routes for home, scraping website, saving articles, deleting
	articles, adding notes to articles, deleting notes from articles
	- Articles and notes added onto page using Handlebars
*/

// DEPENDENCIES
// =============================================================
// npm packages

var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

// scraping tools
var request = require("request");
var cheerio = require("cheerio");

// required models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// set mongoose to leverage built in JS ES6 Promises
mongoose.Promise = Promise;

// APP
// =============================================================

// initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// use body parser with our app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// set up static directory 'public'
app.use("/public", express.static("./public"));

// local database configuration with mongoose
// mongoose.connect("mongodb://localhost/newsscraperdb");

// heroku database configuration with mongoose
mongoose.connect("mongodb://heroku_th6s7cz4:e0j5vil4tnv6tfnhmu1p1n2a32@ds153113.mlab.com:53113/heroku_th6s7cz4");
var db = mongoose.connection;

// show any mongoose errors
db.on("error", function(error){
	console.log("Mongoose Error: ", error);
});

// once logged in to the db through mongoose, log a success msg
db.once("open", function(){
	console.log("Mongoose connection successful!");
});

// HANDLEBARS
// =============================================================
// Provides the templates for the view

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ROUTES
// =============================================================
// The Onion News Scraper Routes

// GET - SCRAPE REQUEST
app.get("/scrape", function(req,res){

	// get the body of the html with request
	request("http://www.theonion.com/section/local/", function(error, response, html){

		// load the html body into cheerio and save it to $ for a shorthand selector
		var $ = cheerio.load(html);

		// inside the inner div, get the h2 a href & title of every article
		$("h2.headline").each(function(i, element){
		
			// save an empty result object
			var result = {};

			// save them as properties of the result object
			result.headline = $(this).children("a").attr("title");
			result.link = $(this).children("a").attr("href");

			// using the Article model, create a new entry for each new article
			var entry = new Article(result);

			// save the new Article entry to the db if it isn't there yet
			// use unique:true in Article.js to check
			Article.update({_id: entry._id}, {$addToSet:{headline:entry.headline}});
			entry.save(function(err,doc){

				// log any errors
				if (err) {
					console.log(err);
				}
				// or log the doc
				else {
					console.log(doc);
				}
			});
		});
			
	});

	// send back to the browser a message that we've finished scraping 
	res.send("ARTICLES SCRAPED");

});

// GET - STARTER PAGE
app.get("/", function(req,res){

	res.redirect("/articles");

});

// GET - INDEX PAGE & DISPLAY SCRAPES
app.get("/articles", function(req,res){

	// grab every doc in the Articles array
	Article.find({}, function(err, doc){

		// log any errors
		if (err) {
			console.log(err);
		}
		// or send the doc to the browser
		else {

			// ------ USE HANDLEBARS HERE TO DISPLAY

			// save doc inside an object
			var articleObject = {
				articles: doc
			};

			// render articles using handlebars
			res.render("index", articleObject);
		}
	});
});

// UPDATE - SAVE ARTICLES
app.put("/save/articles/:id", function(req,res){

	// save the id of the article you clicked on in the front end
	var savedID = req.params.id;
	
	// grab the doc in the Articles array that matches its ObjectID with the savedID
	Article.findOneAndUpdate({_id:savedID}, {saved:true}, function(err,doc){
	// update the saved property in the article to true

		if (err) {
			console.log(err);
		}
		else {
			console.log(doc);
		}
	});

});

// GET - SAVED ARTICLES
app.get("/saved", function(req,res){

	// grab all the docs in the Articles array that have been saved
	Article.find({saved:true}, function(err,doc){

		if (err) {
			console.log(err);
		}
		else {
			// ------ USE HANDLEBARS TO DISPLAY

			// save doc inside an object
			var articleObject = {
				articles: doc
			};

			// render articles using handlebars
			res.render("saved", articleObject);
		}

	});
});

// DELETE - REMOVE SAVED ARTICLES
app.delete("/remove/articles/:id", function(req,res){

	// grab the id of the article you want to delete
	var deleteID = req.params.id;

	// delete by id
	Article.findByIdAndRemove(deleteID, function(err,doc){

		if (err){
			console.log(err);
		}
		else {
			res.send("ARTICLE DELETED");
		}
	});
});

// GET - GET ARTICLE W/ NOTES
app.get("/articles/notes/:id", function(req,res){

	// get the associated article's id
	var articleID = req.params.id;

	Article.find({_id:articleID})
		.populate("note")
		.exec(function(err,doc){
			if (err) {
				console.log(err);
			}
			else {
				res.send(doc);
			}
		});
});

// POST - CREATE A NEW NOTE
app.post("/create/notes/:id", function(req,res){

	// get the associated article's id
	var articleID = req.params.id;

	// create a new Note object
	var newNote = new Note(req.body);

	// save the new note into the db
	newNote.save(function(err,doc){

		if (err) {
			console.log(err);
		}
		else {
			Article.findOneAndUpdate({_id:articleID}, {$push: {"note": doc._id} }, {new:true}, function(err,doc){

				if (err) {
					console.log(err);
				}
				else {
					res.send("NOTE ADDED");
				}
			});		
		}
	});
});

// DELETE - REMOVE SAVED NOTES
app.delete("/remove/notes/:id", function(req,res){

	// get the notes id for the notes you want to delete
	deleteID = req.params.id;

	Note.findByIdAndRemove(deleteID, function(err,doc){

		if (err){
			console.log(err);
		}
		else {
			res.send("NOTE DELETED");
		}
	});
});

// START APP LISTENING
// =============================================================

app.listen(PORT, function(){
	console.log("App running on Port " + PORT + "!");
});