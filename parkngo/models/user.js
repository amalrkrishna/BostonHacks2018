const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect("mongodb://bostonhacks:bostonhacks2018@ds159273.mlab.com:59273/leaser_database", { useNewUrlParser: true });

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
    days:String,
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

const Host = mongoose.model('Host', leaserSchema);
const Renter = mongoose.model('Renter', renterSchema);
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Host, Renter, Payment;