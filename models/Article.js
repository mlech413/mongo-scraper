var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// unique to avoid duplicates
var ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  link: {
    type: String
  },
  summary: {
    type: String
  },
  saved: {
    type: Boolean,
    default: false
  },
  // Note id
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
}
);

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
