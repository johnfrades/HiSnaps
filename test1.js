var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost/userProfiles3");
var mongoosedb = mongoose.connection
mongoosedb.on('error', console.error.bind(console, 'connection error: '));
mongoosedb.once('open', function(){
	console.log("Connected to database!");
});

var testSchema = new mongoose.Schema({
	name: String,
	image: String
});

var TestData = mongoose.model("User", testSchema);

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


//SHOW pictures
app.get("/index", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	});
});

//SHOW more info
app.get("/index/:id", function(req,res){
	TestData.findById(req.params.id, function(err, userID){
		if(err) {
			console.log(err);
		} else {
			res.render("profile", {userID: userID});
		}
	});
});


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



app.listen(3000, function(){
	console.log("Server started! Listening on port 3000");
});