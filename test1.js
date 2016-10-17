var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var moment = require("moment");
var passport = require("passport");
var passportLocal = require("passport-local");
var methodOverride = require("method-override");
var passportLocalMongoose = require("passport-local-mongoose");


var path = require('path');
var formidable = require('formidable');
var fs = require('fs');


var PORT = 3000 || process.env.PORT;



//temporary to store names to the array
var nicknames = [];




app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//This handles the DELETE method override on the "anchor tags"
app.use( function( req, res, next ) {
    // this middleware will call for each requested
    // and we checked for the requested query properties
    // if _method was existed
    // then we know, clients need to call DELETE request instead
    if ( req.query._method == 'DELETE' ) {
        // change the original METHOD
        // into DELETE method
        req.method = 'DELETE';
        // and set requested url to /user/12
        req.url = req.path;
    } else {
    	if(req.query._method == 'POST'){
    		req.method = 'POST';
    		req.url = req.path
    	}
    }       
    next(); 
});




// mongoose.connect("mongodb://localhost/HiSnaps");
mongoose.connect("mongodb://admin:admin@ds029665.mlab.com:29665/hisnaps");
var mongoosedb = mongoose.connection
mongoosedb.on('error', console.error.bind(console, 'connection error: '));
mongoosedb.once('open', function(){
	console.log("Connected to database!");
});


var snapSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	date: String,
	countComments: Number,
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


var loginSchema = new mongoose.Schema ({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	description: String,
	image: String,
	dateJoined: String,
	countTestimonials: Number,
	testimonials: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Testimonial"
		}
	],
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Loginuser"
		},
			username: String,
			image: String,
	},
	mySnaps: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Snap"
		}
	]
});

var commentSchema = new mongoose.Schema ({
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Loginuser"
		},
		username: String,
		image: String
	},
	text: String,
	date: String
});


var testimonialSchema = new mongoose.Schema ({
	author:{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "LoginUser"
		},
		username: String,
		image: String
	},
	text: String,
	date: String
});

loginSchema.plugin(passportLocalMongoose);

var SnapData = mongoose.model("Snap", snapSchema);
var Comment = mongoose.model("Comment", commentSchema);
var LoginUser = mongoose.model("Loginuser", loginSchema);
var Testimonial = mongoose.model("Testimonial", testimonialSchema);


var nowDateAndTime = moment().format("l , LT")
var pictures2DateAndTime = moment().startOf('hour').fromNow();
var joinDate = moment().format("LL");


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




io.sockets.on('connection', function(socket){
	socket.on('new user', function(data){
		console.log(socket);
		console.log(data + " connected to chatroom");
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNicknames();
	});


	socket.on('send message', function(data){
		io.sockets.emit("new message", {msg: data, nick: socket.nickname});
		});

	socket.on("disconnect", function(data){
	if(!socket.nickname){
		return;
	} else {
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		updateNicknames();
	}
	});

//Socket.io function

function updateNicknames() {
	io.sockets.emit('usernames', nicknames);
}

});



//GET ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.get("/test", function(req, res){
	res.render("test");
});


//Home page
app.get("/", function(req, res){
	res.render("landingpage");
});


//Home index
app.get("/index", function(req, res){
	SnapData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			SnapData.aggregate({ $sample: {size: allUsers.length}}, function(err, theSnaps){
				if(err){
					console.log(err);
				} else {
					res.render("homepage", {allSnaps: theSnaps});
				}
			});
		}
	});
});


//Home index (OLD query)
app.get("/old", function(req, res){
	SnapData.find({}, function(err, theSnaps){
		if(err) {
			console.log(err);
		} else {
			res.render("homepage", {allSnaps: theSnaps});
		}
	}).sort({date: 1});
});

//Home index (FRESH query)
app.get("/fresh", function(req, res){
	SnapData.find({}, function(err, theSnaps){
		if(err) {
			console.log(err);
		} else {
			res.render("homepage", {allSnaps: theSnaps});
		}
	}).sort({date: -1});
});

//Home index (HOT query)
app.get("/hot", function(req, res){
	SnapData.find({}, function(err, theSnaps){
		if(err) {
			console.log(err);
		} else {
			res.render("homepage", {allSnaps: theSnaps});
		}
	}).sort({countComments: -1});
});

//Home index (COLD query)
app.get("/cold", function(req, res){
	SnapData.find({}, function(err, theSnaps){
		if(err) {
			console.log(err);
		} else {
			res.render("homepage", {allSnaps: theSnaps});
		}
	}).sort({countComments: 1});
});


//SHOW more info and comments
app.get("/index/:id", function(req,res){
	SnapData.findById(req.params.id).populate("comments").exec(function(err, userID){
		if(err) {
			console.log(err);
		} else {
			res.render("profile", {userID: userID, nowDateAndTime: nowDateAndTime});
		}
	});
});


//Shows loginuser profile
app.get("/profile/:id", function(req, res){
	LoginUser.findById(req.params.id).populate("mySnaps testimonials").exec(function(err, userProfile){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			res.render("loginuserprofile", {userProfile: userProfile});
		}
	});	
});


//Logout function
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/index");
})



//POST ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//Register POST route
app.post("/register", function(req, res){
	var regUser = {
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		image: req.body.image,
		dateJoined: joinDate,
		countTestimonials: 0,
		description: req.body.description
	}

	var newUser = new LoginUser(regUser);
	LoginUser.register(newUser, req.body.password1, function(err, user){
		if (err) {
			return res.render("register");
		} else {
			res.redirect("/index");
		}
	});
});



//Search function for users
app.post("/searchuser", function(req, res){
	var nameuser = req.body.nameuser;
	LoginUser.find({
		$or: [

			{"firstname": {$regex: nameuser, $options: 'i'}},
			{"lastname": {$regex: nameuser, $options: 'i'}}
		]
	}, function(err, searchedUser){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			res.render("searchuser", {foundUser: searchedUser});
		}
	});
});


//Search photos result

app.post('/searchphoto', function(req, res){
	var namephoto = req.body.namephoto
	SnapData.find({name: {$regex: namephoto, $options: 'i'}}, function(err, searchedPhoto){
		if(err){
			console.log(err);
			res.redirect('back');
		} else {
			res.render('searchphoto', {foundPhoto: searchedPhoto});
		}
	});
});



//Binds the newlycreated snap to the Loginuser
app.post("/profile/:id", function(req, res){
		var name = req.body.name;
		var image = req.body.image;
		var description = req.body.description;
		var author = {
			id: req.user._id,
			username: req.user.username,
			image: req.user.image
					}

		var userData = {
		name: name,
		image: image,
		author: author,
		description: description,
		countComments: 0,
		date: new Date().toLocaleDateString() +' '+ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
	}


	LoginUser.findById(req.params.id, function(err, theLoginUser){
		if (err){
			console.log(err);
		} else {
			SnapData.create(userData, function(err, newSnap){
				if(err){
					console.log(err);
				} else {
					newSnap.save();
					theLoginUser.mySnaps.push(newSnap);
					theLoginUser.save();
					res.redirect("index");
				}
			});
		}
	});
});


//POST a comment and bind it to SnapData
app.post("/index/:id/comments", function(req, res){
	SnapData.findById(req.params.id, function(err, foundUser){
		if (err) {
			console.log(err);
		} else {
			Comment.create(req.body.comment, function(err, theComment){
				if (err) {
					console.log(err);
				} else {
					theComment.date = new Date().toLocaleDateString() +' '+ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
					theComment.author.id = req.user._id;
					theComment.author.username = req.user.username;
					theComment.author.image = req.user.image;
					theComment.save();
					foundUser.comments.push(theComment);
					foundUser.countComments++;
					foundUser.save();
					res.redirect("/index/" + foundUser._id);
				}
			});
		}
	});
});


//POST a testimonial on the loginuser
app.post("/profile/:id/testimonials", function(req,res){
	LoginUser.findById(req.params.id, function(err, foundLoginUser){
		if(err){
			console.log(err);
			res.redirect('back');
		} else {
			Testimonial.create(req.body.testimonial, function(err, newTestimonial){
				if(err){
					console.log(err);
					res.redirect("back")
				} else {
					newTestimonial.date = new Date().toLocaleDateString() +' '+ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
					newTestimonial.author.id = req.user._id;
					newTestimonial.author.username = req.user.username;
					newTestimonial.author.image = req.user.image;
					newTestimonial.save();
					foundLoginUser.testimonials.push(newTestimonial);
					foundLoginUser.countTestimonials++;
					foundLoginUser.save();
					res.redirect("/profile/" + foundLoginUser._id);
				}
			});
		}
	});
});

//POST request for login
app.post("/login", passport.authenticate("local", {
	successRedirect: "back",
	failureRedirect: "back"
}));






//EDIT REQUEST ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//EDIT route
app.put("/index/:id", function(req, res){
	SnapData.findByIdAndUpdate(req.params.id, req.body.user, function(err, updateUser){
		if(err){
			console.log(err);
		} else {
			console.log(updateUser);
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
			res.redirect("back");
		}
	});
});




//DELETE REQUEST ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//pre-schema to remove also the snap on the loginuser data to update the number of snaps by author
snapSchema.pre('remove', function (next) {
  this.model('Loginuser').update(
    { mySnaps: this }, 
    { $pull: { mySnaps: this._id } }, 
    { multi: true }
  ).exec(next)
});

app.delete("/index/:id", checkUserOwnership, function(req, res){
	SnapData.findByIdAndRemove(req.params.id, function(err, snap){
		if(err) {
			console.log(err);
			res.redirect("/index/" + req.params.id);
		} else {
			snap.remove();
			console.log("Successfully deleted!");
			res.redirect("/index");
		}
	})
})




//pre-schema where the comment will also remove on the testuser schema to update the comment count
commentSchema.pre('remove', function (next) {
  this.model('Snap').update(
    { comments: this }, 
    { $pull: { comments: this._id } }, 
    { multi: true }
  ).exec(next)
});

app.delete("/index/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, comment){
		if(err) {
			console.log(err);
			res.redirect("/index/");
		} else {
			comment.remove();
			console.log("Comment successfully deleted!");
			res.redirect("back");
		}
	});
});




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
		SnapData.findById(req.params.id, function(err, foundUserID){
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



app.listen(PORT, function(){
	console.log("Server started! Listening on port " + PORT);
});
