var express = require("express");

var app = express();

app.use(express.static("public"));

var request = require('request');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var mongoose = require("mongoose");
//Implements mongoose to communicate with MongoDB from within node.js

mongoose.connect("mongodb://bostonhacks:bostonhacks2018@ds159273.mlab.com:59273/leaser_database", { useNewUrlParser: true });
mongoose.connect("mongodb://bostonhacks:bostonhacks2018@ds157923.mlab.com:57923/renter_database", { useNewUrlParser: true });

app.set('view engine', 'ejs');

var leaserSchema = new mongoose.Schema({
	name: String,
	title: String,
	body: String,
	amount: Number,
	latitude: Number,
    longitude: Number,
    // added start_time and end_time here
    start_time: Number,
    end_time: Number,
    mon: Number,
    tue: Number,
    wed: Number,
    thu: Number,
    fri: Number,
    sat: Number,
    sun: Number,
    start_date: String,
    end_date: String
});

var renterSchema = new mongoose.Schema({
    dataValue: String,
    dataDescriptor: String,
    transaction_id: String,
    date: {
		type: Date,
		default: Date.now(),
	},
});

var paymentSchema = new mongoose.Schema({
    dataValue: String,
    dataDescriptor: String,
    transaction_id: String,
    date: {
		type: Date,
		default: Date.now(),
	},
});

var requestAPI; 
var postUser;
var thisLat;
var thisLng;

function wipe() {
    
    requestAPI = "";
    postUser = "";
    thisLat = "";
    thisLng = "";
};


var thisLeaser = mongoose.model("leaser_database", leaserSchema);
var thisRenter = mongoose.model("renter_database", renterSchema);
var thisPayment = mongoose.model("new_payment_collection", paymentSchema);

app.post('/jam', function(req, res){
    console.log("1");
    postUser = {
        name:req.body.Name,
        address:req.body.Address,
        // OC: add start-time and end_time
        mon:req.body.mon,
        tue:req.body.tue,
        wed:req.body.wed,
        thu:req.body.thu,
        fri:req.body.fri,
        sat:req.body.sat,
        sun:req.body.sun,
        amount:req.body.Amount,
        start_time:req.body.StartTime,
        end_time:req.body.EndTime,
        daterange:req.body.daterange
    }
    res.redirect("address");
});

app.post('/jam_filter', function(req, res){
    console.log("filter");
    postUser = {
        address:req.body.Address,
        // OC: add start-time and end_time
        mon:req.body.mon,
        tue:req.body.tue,
        wed:req.body.wed,
        thu:req.body.thu,
        fri:req.body.fri,
        sat:req.body.sat,
        sun:req.body.sun,
        min_amount:req.body.MinAmount,
        max_amount:req.body.MaxAmount,
        start_time:req.body.StartTime,
        end_time:req.body.EndTime,
        daterange:req.body.daterange
    }
    console.log(postUser);
    //res.redirect("renter");

    var query = postUser.address;
    
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + query
     + "&key=AIzaSyAsGx132XMucPF5R85zEnF_aqnqBZfThLw";
     
    request(url, function(error, response, body){
        if(!error && response.statusCode === 200){
            requestAPI = JSON.parse(body);
            thisLat = requestAPI.results[0].geometry.location.lat;
            thisLng = requestAPI.results[0].geometry.location.lng;
            console.log(thisLat, thisLng)

            var start_date = postUser.daterange.split(" - ")[0]
            var end_date = postUser.daterange.split(" - ")[1]

            thisLeaser.find({amount: { $gte: postUser.min_amount },
                amount: { $lte: postUser.max_amount},
                latitude: { $lte: thisLat+0.01449},
                latitude: { $gte: thisLat-0.01449},
                longitude: { $lte: thisLng+0.0181},
                longitude: { $gte: thisLng-0.0181},
                start_time: { $gte: postUser.start_time},
                end_time: { $lte: postUser.end_time},
                start_date: { $gte: new Date(start_date)},
                end_date: { $lte: new Date(start_date)}},


                function(err, theLeaser){
            if(err){
                console.log("Database error");
                console.log(err);
                wipe();
            } else {
                res.render("renter", {locations:theLeaser})
                //Serves up renter.ejs and collects user input
            }
            });
        }
    })
});

app.get("/address2", function(req, res){
    console.log("2");
    var query = postUser.address;
    
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + query
     + "&key=AIzaSyAsGx132XMucPF5R85zEnF_aqnqBZfThLw";
     
    request(url, function(error, response, body){
        if(!error && response.statusCode === 200){
            requestAPI = JSON.parse(body);
            thisLat = requestAPI.results[0].geometry.location.lat;
            thisLng = requestAPI.results[0].geometry.location.lng;
            console.log(thisLat);
            console.log(thisLng);
        }
    })
    
    res.redirect('new');
});

app.get("/address", function(req, res){
    console.log("2");
    var query = postUser.address;
    
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + query
     + "&key=AIzaSyAsGx132XMucPF5R85zEnF_aqnqBZfThLw";
     
    request(url, function(error, response, body){
        if(!error && response.statusCode === 200){
            requestAPI = JSON.parse(body);
            thisLat = requestAPI.results[0].geometry.location.lat;
            thisLng = requestAPI.results[0].geometry.location.lng;
            console.log(thisLat);
            console.log(thisLng);
        }
    })
    
    res.redirect('new');
});

app.get("/auth", function(req, res){
    console.log("GET request @ /auth");
    res.render("auth-net-test", {transaction_id:req.query._id});
});

app.post("/auth", function(req,  res){
    console.log(req.body);
    var newPayment= {
		dataValue:req.body.dataValue,
		dataDescriptor:req.body.dataDescriptor,
		transaction_id:req.body._id
	} 
	
    console.log(newPayment);
    
thisPayment.create(newPayment, function(err, location){
		if(err){
			console.log(err);
		} else {
			console.log("added to renter_dataset");
		}
	});
    thisPayment.find({_id:req.body._id}).remove(function(){
    });
    res.render("confirmation", {transaction_id:req.body._id});
});


app.get('/new', function(req, res) {
    setTimeout(function() {
    console.log('Blah blah blah blah extra-blah');

    console.log("3");
    
    if(thisLat == undefined || thisLng == undefined) {
        console.log("Could not parse that addresss");
        res.redirect("/");
        wipe();
    } else {

    var start_date = postUser.daterange.split(" - ")[0]
    var end_date = postUser.daterange.split(" - ")[1]

    var start_date = new Date(start_date);
    var end_date = new Date(end_date);

	var newLeaser = {
		name:postUser.name,
		amount:postUser.amount,
		latitude:thisLat,
        longitude:thisLng,
        mon:postUser.mon,
        tue:postUser.tue,
        wed:postUser.wed,
        thu:postUser.thu,
        fri:postUser.fri,
        sat:postUser.sat,
        sun:postUser.sun,
        start_time:postUser.start_time,
        end_time:postUser.end_time,
        start_date:start_date,
        end_date:end_date
	} 
	
    console.log(newLeaser);
    
    thisLeaser.create(newLeaser, function(err, location){
		if(err){
			console.log(err);
			wipe();
		} else {
			console.log("added to leaser_dataset_collection");
			wipe();
		}

		res.redirect("/");
	});
}
    }, 1500);
    });


app.get("/", function(req, res){
    console.log("4");
        thisLeaser.find({}, function(err, theLeaser){
        if(err){
            console.log("Database error");
            console.log(err);
            wipe();
        } else {
            res.render("lender", {locations:theLeaser})
            //Serves up lender.ejs and collects user input
        }
        });
});

app.get("/renter", function(req, res){
    console.log("5");
        thisLeaser.find({}, function(err, theLeaser){
        if(err){
            console.log("Database error");
            console.log(err);
            wipe();
        } else {
            res.render("renter", {locations:theLeaser})
            //Serves up renter.ejs and collects user input
        }
        });
});

app.get("*", function(req, res){
    console.log("6");
    res.redirect("/");
    //Catches any unknown gibberish and re-directs back to "/"
});

app.listen(3003, function(){
    console.log("Server is listening...");
});