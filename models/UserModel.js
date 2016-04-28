var mongoose = require('mongoose'),
	schema = mongoose.Schema();
	
//var ObjectId = require('mongodb').ObjectID;
	
var UserModel = new mongoose.Schema({
	_id: String,
	createdOn: {type: Date, default: Date.now},
	subscriptions: [Number]  
	});
	
module.exports = mongoose.model('User',UserModel);