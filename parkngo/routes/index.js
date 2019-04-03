const express = require('express');
const router = express.Router();
const User = require('../models/user');
const current_date = new Date();

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


router.post('/jam', function(req, res){
  console.log("1");
  postUser = {
      name:req.body.Name,
      address:req.body.Address,
      // OC: add start-time and end_time
      days:req.body.days,
      amount:req.body.Amount,
      start_time:req.body.StartTime,
      end_time:req.body.EndTime,
      daterange:req.body.daterange
  }
  res.redirect("address");
});

function getJedisQuery(min_amount, max_amount, start_time, end_time){


  var query = thisLeaser.find({
      amount: { $gte: min_amount },
      amount: { $lte: max_amount },
      start_time: { $gte: start_time },
      end_time: { $lte: end_time }});


  return query;
}

router.post('/jam_filter', function(req, res){
  console.log("filter");
  postUser = {
      address:req.body.Address,
      days:req.body.days,
      min_amount:req.body.MinAmount,
      max_amount:req.body.MaxAmount,
      start_time:req.body.StartTime,
      end_time:req.body.EndTime,
      daterange:req.body.daterange
  }

  var start_date = postUser.daterange.split(" - ")[0];
  var end_date = postUser.daterange.split(" - ")[1];
  

  thisLeaser.
      find().
      where('amount').gte(postUser.min_amount).
      where('amount').lte(postUser.max_amount).
      where('start_time').lte(postUser.start_time).
      where('end_time').gte(postUser.end_time).
      where('start_date').lte(new Date(start_date)).
      where('end_date').gte(new Date(end_date)).
      exec(function(err, theLeaser){
          console.log(JSON.stringify(theLeaser, null, 4))
          if(err){
                      console.log("Database error");
                      console.log(err);
                       wipe();
          } else {
                      res.render("renter", {locations:theLeaser})
          }
  });
});

router.get("/address2", function(req, res){
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

router.get("/address", function(req, res){
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

router.get("/auth", function(req, res){
  console.log("GET request @ /auth");
  res.render("auth-net-test", {transaction_id:req.query._id});
});

router.post("/auth", function(req,  res){
  console.log("inside /auth")
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
    console.log("added to payment_dataset");
  }
  });
  thisLeaser.find({_id:req.body._id}).remove(function(){
  });
  res.render("confirmation", {transaction_id:req.body._id});
});


router.get('/new', function(req, res) {
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
  console.log(postUser)
var newLeaser = {
  name:postUser.name,
  amount:postUser.amount,
  latitude:thisLat,
      longitude:thisLng,
      days:postUser.days,
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


router.get("/", function(req, res){
  console.log("4");
      thisLeaser.find({}, function(err, thisLeaser){
      if(err){
          console.log("Database error");
          console.log(err);
          wipe();
      } else {
          res.render("lender", {locations:thisLeaser})
          //Serves up lender.ejs and collects user input
      }
      });
});

router.get("/renter", function(req, res){
  console.log("Inside /render");
      thisLeaser.find({}, function(err, thisLeaser){
      if(err){
          console.log("Database error");
          console.log(err);
          wipe();
      } else {
          res.render("renter", {locations:thisLeaser})
          //Serves up renter.ejs and collects user input
      }
      });
});

router.get("*", function(req, res){
  console.log("6");
  res.redirect("/");
  //Catches any unknown gibberish and re-directs back to "/"
});

module.exports = router;