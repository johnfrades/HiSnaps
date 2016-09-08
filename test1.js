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
	comments: [
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
		}
	]
});

var commentSchema = new mongoose.Schema ({
	name: {
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

app.get("/new", function(req, res) {
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
app.get("/index/:id/comments/new", function(req, res){
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

	var userData = {
		name: name,
		image: image
	}

	TestData.create(userData, function(err, newlyCreatedUser){
		if(err) {
			console.log(err);
			res.redirect("/new");
		} else {
			console.log(newlyCreatedUser);
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
					theComment.name.id = req.user._id;
					theComment.name.username = req.user.username;
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




app.listen(3000, function(){
	console.log("Server started! Listening on port 3000");
});