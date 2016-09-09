var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var moment = require("moment");
var passport = require("passport");
var passportLocal = require("passport-local");
var methodOverride = require("method-override");
var passportLocalMongoose = require("passport-local-mongoose");


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/userProfiles3");
var mongoosedb = mongoose.connection
mongoosedb.on('error', console.error.bind(console, 'connection error: '));
mongoosedb.once('open', function(){
	console.log("Connected to database!");
});


var testSchema = new mongoose.Schema({
	name: String,
	image: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Loginuser"
		},
			username: String
	},

	comments: [
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
		}
	]
});

var commentSchema = new mongoose.Schema ({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Loginuser"
		},
		username: String
	},
	text: String,
	date: String
});

var loginSchema = new mongoose.Schema ({
	username: String,
	password: String
});

loginSchema.plugin(passportLocalMongoose);

var TestData = mongoose.model("User", testSchema);
var Comment = mongoose.model("Comment", commentSchema);
var LoginUser = mongoose.model("Loginuser", loginSchema);

var nowDateAndTime = moment().format("l , LT")


//Passport authentication
app.use(require("express-session")({
	secret: "John",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(LoginUser.authenticate()));
passport.serializeUser(LoginUser.serializeUser());
passport.deserializeUser(LoginUser.deserializeUser());
// ends here



//This will populate the variable "currentUser = req.user(which is the current logged-in user)" to all EJS files
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});



//GET ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


app.get("/", function(req, res){
	res.render("index", {title: "The index Page!!!!"});
});

app.get("/about", function(req, res){
	res.render("about");
});

app.get("/new", isLoggedIn, function(req, res) {
	res.render("new");
});

app.get("/index/:id/edit", function(req, res) {
	TestData.findById(req.params.id, function(err, editUser){
		if(err){
			console.log(err);
		} else {
			res.render("editProfile", {editUser: editUser});
		}
	});
});


app.get("/index", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	});
});


app.get("/register", function(req, res){
	res.render("register");
});


//SHOW more info and comments
app.get("/index/:id", function(req,res){
	TestData.findById(req.params.id).populate("comments").exec(function(err, userID){
		if(err) {
			console.log(err);
		} else {
			res.render("profile", {userID: userID});
		}
	});
});




//shows the form to add new comment
app.get("/index/:id/comments/new", isLoggedIn, function(req, res){
	TestData.findById(req.params.id, function(err, userID){
		if (err) {
			console.log(err);
		} else {
			res.render("newComment", {userID: userID, nowDateAndTime: nowDateAndTime});
		}
	});
});

//shows the form to edit the comment
app.get("/index/:id/comments/:comment_id/edit", function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if (err) {
			console.log(err);
		} else {
			res.render("editcomment", {theComment: foundComment, userID: req.params.id, nowDateAndTime: nowDateAndTime});
		}
	});
});

//Shows the login form
app.get("/login", function(req, res){
	res.render("login");
});


//SHOWS the logout form
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/index");
})


//POST ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.post("/index", function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var author = {
			id: req.user._id,
			username: req.user.username
	}
	var userData = {
		name: name,
		image: image,
		author: author
	}

	TestData.create(userData, function(err, newlyCreatedUser){
		if(err) {
			console.log(err);
			res.redirect("/new");
		} else {
			res.redirect("/index");
		}
	});

});

app.post("/index/:id/comments", function(req, res){
	TestData.findById(req.params.id, function(err, foundUser){
		if (err) {
			console.log(err);
		} else {
			Comment.create(req.body.comment, function(err, theComment){
				if (err) {
					console.log(err);
				} else {
					theComment.date = nowDateAndTime;
					theComment.author.id = req.user._id;
					theComment.author.username = req.user.username;
					theComment.save();
					foundUser.comments.push(theComment);
					foundUser.save();
					res.redirect("/index/" + foundUser._id);
				}
			});
		}
	});
});


app.post("/register", function(req, res){
	var newUser = new LoginUser({username: req.body.username});
	LoginUser.register(newUser, req.body.password1, function(err, user){
		if (err) {
			return res.render("register");
		} else {
			res.redirect("/index");
		}
	});
});


app.post("/login", passport.authenticate("local", {
	successRedirect: "/index",
	failureRedirect: "/login"
}));


//EDIT route

app.put("/index/:id", function(req, res){
	TestData.findByIdAndUpdate(req.params.id, req.body.user, function(err, updateUser){
		if(err){
			console.log(err);
		} else {
			res.redirect("/index/" + updateUser._id);
		}
	})
})

//EDIT comment
app.put("/index/:id/comments/:comment_id", function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
		if(err) {
			console.log(err);
			res.redirect("back");
		} else {
			res.redirect("/index/" + req.params.id);
		}
	});
});


app.delete("/index/:id", checkUserOwnership, function(req, res){
	TestData.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			console.log(err);
			res.redirect("/index/" + req.params.id);
		} else {
			console.log("Successfully deleted!");
			res.redirect("/index");
		}
	})
})

app.delete("/index/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err) {
			console.log(err);
			res.redirect("/index/");
		} else {
			console.log("Comment successfully deleted!");
			res.redirect("back");
		}
	});
});
	// TestData.find({req.params.comment_id}).remove().exec(function(err){
	// 	if(err) {
	// 		console.log(err);
	// 		res.redirect("/index");
	// 	} else {
	// 		res.redirect("back");
	// 	}
	// });






//FUNCTION to check if the user is logged in to do specific actions such as Adding users, adding comments
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect("/login");
	}
}


//Middleware to check if the author of the comment is the same to the loggedin user.
function checkCommentOwnership(req, res, next) {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundCommentID){
			if(err) {
				res.redirect("back");
			} else {
				if(foundCommentID.author.id.equals(req.user._id)){
					next();
				} else {
					console.log("you aren't the author of the comment!");
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}


//Middleware function that checks if the author of the submitted user is the same on the one who logged in
function checkUserOwnership(req, res, next) {
	if(req.isAuthenticated()) {
		TestData.findById(req.params.id, function(err, foundUserID){
			if(err){
				res.redirect("back");
			} else {
				if(foundUserID.author.id.equals(req.user._id)){
					next();
				} else {
					console.log("you aren't the author of this picture!");
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}



app.listen(3000, function(){
	console.log("Server started! Listening on port 3000");
});