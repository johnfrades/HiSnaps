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




mongoose.connect("mongodb://localhost/userProfiles3");
//mongoose.connect("mongodb://admin:admin@ds029426.mlab.com:29426/deploy1");
var mongoosedb = mongoose.connection
mongoosedb.on('error', console.error.bind(console, 'connection error: '));
mongoosedb.once('open', function(){
	console.log("Connected to database!");
});


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

var loginSchema = new mongoose.Schema ({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	description: String,
	image: String,
	dateJoined: String,
	authorSelfies: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
});

loginSchema.plugin(passportLocalMongoose);

var TestData = mongoose.model("User", testSchema);
var Comment = mongoose.model("Comment", commentSchema);
var LoginUser = mongoose.model("Loginuser", loginSchema);

var nowDateAndTime = moment().format("l , LT")
var picturesDateAndTime = moment().format('lll');
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

//Home page
app.get("/", function(req, res){
	res.render("index");
});


//About page
app.get("/about", function(req, res){
	res.render("about");
});

app.get("/upload", function(req, res){
	res.render("upload");
});



app.get("/index", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			TestData.aggregate({ $sample: {size: allUsers.length}}, function(err, theUsers){
				if(err){
					console.log(err);
				} else {
					res.render("users", {allUsers: theUsers});
				}
			});
		}
	});
});

app.get("/indexascsort", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	}).sort({comments: 1});
});

app.get("/indexdescsort", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	}).sort({comments: -1});
});

app.get("/indexfresh", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	}).sort({date: 1});
});



// app.get("/profile/:id", function(req, res){
// 	LoginUser.findById(req.params.id).populate("authorSelfies").exec(function(err, userProfile){
// 		if(err){
// 			console.log(err);
// 			res.redirect("back");
// 		} else {

// 			res.render("loginprofile", {userProfile: userProfile});
// 		}
// 	});	
// });


app.get("/profile/:id", function(req, res){
	LoginUser.findById(req.params.id).populate("authorSelfies").exec(function(err, userProfile){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {

			res.render("loginuserprofile", {userProfile: userProfile});
		}
	});	
});




//SHOW more info and comments
app.get("/index/:id", function(req,res){
	TestData.findById(req.params.id).populate("comments").exec(function(err, userID){
		if(err) {
			console.log(err);
		} else {
			res.render("profile", {userID: userID, nowDateAndTime: nowDateAndTime});
		}
	});
});


//SHOWS the logout form
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/index");
})


app.get("/chat", function(req, res){
	res.render("chat");
});





//POST ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//upload file ~~~~~~~~~~~~~~~~~~~~~~~~

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    console.log(file.name);
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});



//end here ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



app.post("/register", function(req, res){

	var regUser = {
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		image: req.body.image,
		dateJoined: joinDate,
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
app.post("/searchuserresult", function(req, res){
	var thename = req.body.thename;
	console.log(req.body);
	LoginUser.find({
		$or: [

			{"firstname": {$regex: thename, $options: 'i'}},
			{"lastname": {$regex: thename, $options: 'i'}}
		]
	}, function(err, searchedUser){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			res.render("searchprofile", {foundUser: searchedUser});
		}
	});
});


//Add likes to the database --pending--





//Binds the newlycreated selfie to the Loginuser

app.post("/profile/:id", function(req, res){
		var name = req.body.name;
		var image = req.body.image;
		var description = req.body.description;
		var datetimeSubmitted = picturesDateAndTime;
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
		date: datetimeSubmitted
	}


	LoginUser.findById(req.params.id, function(err, theLoginUser){
		if (err){
			console.log(err);
		} else {
			TestData.create(userData, function(err, newSelfie){
				if(err){
					console.log(err);
				} else {
					newSelfie.save();
					theLoginUser.authorSelfies.push(newSelfie);
					theLoginUser.save();
					res.redirect("/index");
				}
			});
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
					theComment.author.image = req.user.image;
					theComment.save();
					foundUser.comments.push(theComment);
					foundUser.save();
					res.redirect("/index/" + foundUser._id);
					//res.redirect('/index');
				}
			});
		}
	});
});




app.post("/login", passport.authenticate("local", {
	successRedirect: "back",
	failureRedirect: "back"
}));


app.get('/upload', function(req, res){
	res.render("upload");
});

//EDIT route

app.put("/index/:id", function(req, res){
	TestData.findByIdAndUpdate(req.params.id, req.body.user, function(err, updateUser){
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


//pre-schema to remove also the selfie on the loginuser data to update the number of selfies by author
testSchema.pre('remove', function (next) {
  this.model('Loginuser').update(
    { authorSelfies: this }, 
    { $pull: { authorSelfies: this._id } }, 
    { multi: true }
  ).exec(next)
});

app.delete("/index/:id", checkUserOwnership, function(req, res){
	TestData.findByIdAndRemove(req.params.id, function(err, selfie){
		if(err) {
			console.log(err);
			res.redirect("/index/" + req.params.id);
		} else {
			selfie.remove();
			console.log("Successfully deleted!");
			res.redirect("/index");
		}
	})
})





//pre-schema where the comment will also remove on the testuser schema to update the comment count
commentSchema.pre('remove', function (next) {
  this.model('User').update(
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



server.listen(PORT, function(){
	console.log("Server started! Listening on port 3000");
});

// server.listen(process.env.PORT, process.env.IP, function(){
// 	console.log("Server started! Listening on port 3000");
// });