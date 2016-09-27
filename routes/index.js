var express = require('express');
var router = express.Router();
var TheIndex = require('../models/index.js')




//Home page
router.get("/", function(req, res){
	res.render("index");
});


//About page
router.get("/about", function(req, res){
	res.render("about");
});


//Index page
router.get("/index", function(req, res){
	TheIndex.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	});
});



//Picture profile page
router.get("/index/:id", function(req,res){
	TheIndex.findById(req.params.id).populate("comments").exec(function(err, userID){
		if(err) {
			console.log(err);
		} else {
			res.render("profile", {userID: userID, nowDateAndTime: nowDateAndTime});
		}
	});
});


module.exports = router;