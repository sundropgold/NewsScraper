/*
	================== Article Model ==================
*/

// require mongoose
var mongoose = require("mongoose");

// create Schema class
var Schema = mongoose.Schema;

// create Article schema 
var ArticleSchema = new Schema({
	headline:{
		type:String,
		required:true,
		unique:true
	},
	link:{
		type:String,
		required:true
	},
	saved:{
		type:Boolean,
		default:false
	},
	note:[{
		// this will only save an array of notes via ObjectId
		type:Schema.Types.ObjectId,
		// refers to the Note model
		ref:"Note"
	}]
});

// create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// export the Article model
module.exports = Article;