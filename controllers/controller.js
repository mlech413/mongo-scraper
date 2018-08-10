var express = require("express");
var exphbs = require("express-handlebars");
// var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");
var logger = require("morgan"); 

var router = express.Router();

var db = require("../models");

router.get("/", function(req, res) {
    res.render("index");
});

router.get("/saved", function(req, res) {
    res.render("saved");
});

router.get("/scrape", function(req, res) {
  request("https://www.nytimes.com/", function(error, response, html) {
    var $ = cheerio.load(html);

        $("article.theme-summary").each(function(i, element) {
          var result = {};
          if ( $(this).children("p.summary").text() != "" ) {

            result.title = $(this)
                .children("h2")
                .children("a")
                .text();
            result.link = $(this)
                .children("h2")
                .children("a")
                .attr("href");
            result.summary = $(this)
                .children("p.summary")
                .text();
       
            // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
            .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
            })
            .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
            });

        }
        else {
            console.log("Skipped because summary section exists but is empty.");
        }

    });
    res.render("index");
  });
});


// Route for getting saved Articles from the db
router.get("/savedarticles", function(req, res) {
    console.log("router.get /savedarticles")
    // Grab every document in the Saved Articles collection
    db.Article.find({
        "saved" : true
    })
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
      
  });




// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
    console.log("router.get /articles")
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});



// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
    console.log("router.get /articles/:id")
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
    console.log("router.post /articles/:id")
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/save-article/:id", function(req, res) {
    console.log("router.post /save-articles/:id")
    console.log("req.params.id=" + req.params.id)
      db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json("UPDATE SUCCESSFUL FOR " + req.params.id);
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json("UPDATE ERROR FOR " + req.params.id);
        // If an error occurred, send it to the client
        res.json(err);
      });
    //   res.render("index");
  });

// delete all
router.post("/erase-all", function(req, res) {
    console.log("router.post /erase-all");
    db.Article.remove({})
    .then(function(dbArticle) {
        console.log("All articles deleted.")
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });

      db.Note.remove({})
    .then(function(dbNote) {
        console.log("All notes deleted.")
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
      
    res.render("index");
});

// erase SAVED (update all boolean to false)
router.post("/erase-saved", function(req, res) {
    console.log("router.post /erase-saved");
    db.Article.update({}, {$set: {"saved": false}}, {multi: true})
    .then(function(dbArticle) {
        console.log("All articles updated to UNSAVED.")
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });

    res.render("index");
});
  

module.exports = router;