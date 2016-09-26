var mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	name: String,
	image: String,
	likes: Number,
	description: String,
	date: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Loginuser"
		},
			username: String,
			image: String,
	},

	comments: [
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
		}
	]
});

module.exports = mongoose.model("User", testSchema);