var express = require('express');
var router = express.Router();
var LoginUsers = require('../models/loginusers.js')


//Picture page
router.get("/profile/:id", function(req, res){
	LoginUsers.findById(req.params.id, function(err, userProfile){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			res.render("loginprofile", {userProfile: userProfile});
		}
	});	
});


module.exports = router;