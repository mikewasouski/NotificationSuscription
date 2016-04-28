var mongoose = require('mongoose'),
	schema = mongoose.Schema();
	
var Messages = new mongoose.Schema({
  txt: String,
  date: {type: Date, default: Date.now}, 
  author: String
});
	
var NotificationModel = new mongoose.Schema({
	_id:{type: Number},
	msgs:[Messages]
	});
	
module.exports = mongoose.model('Notification',NotificationModel);