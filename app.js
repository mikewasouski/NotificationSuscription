var express = require('express');
var	app = express();
var	server = require('http').createServer(app);
var	io = require('socket.io').listen(server);
var	mongoose = require('mongoose');
var _=require("underscore");
var notificationList = [];  //store all the notifications to be send
var usersInf={} //Store all the users connected

server.listen(3000);

var db = mongoose.connect('mongodb://localhost/NotificationsDB');
var Notification = require('./models/NotificationModel');
var User = require('./models/UserModel');

//load notifications
var notifications = Notification.find({});
getNotifications();
console.log("notifications: "+notifications);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	
	socket.on('new user', function(data, callback){

		if(data!== undefined || data!== '')
			callback(data)
		if (data in usersInf){
			callback(data);
		} else{
			socket.account = data;
			socket.usrName = data;
			socket.notify = 0
			usersInf[socket.usrName] = socket;
			console.log(usersInf[socket.usrName].usrName);
			callback(data);
		}
		
		
		findUser(socket.usrName);
		
		function findUser(userName){
			var user = User.findById(userName, function (err, user){
			if(user){
				console.log(user);
				//console.log(usersInf[socket.usrName])
				
				usersInf[socket.usrName].notify = 0;
				if(user.subscriptions.length>0)
					usersInf[socket.usrName].notify = user.subscriptions[0];
				
				if(usersInf[socket.usrName].notify == 1)
					for(var j=0; j < notificationList.length; j++){
						socket.emit('new message', {msg: notificationList[j], account: userName});
					}
				socket.emit('userNotifications', {"notify": usersInf[socket.usrName].notify});
				return user;
			}else{
				user = new User({_id: socket.usrName});
				user.save(function (err) {
				  if (err) {
						return err;
				  }
				  else {
					console.log("user saved");
					socket.emit('userNotifications', {"notify":0});
					usersInf[socket.usrName].notify = 0;
				  }
				});
			}
			})
		}
	});
	
	//Update user subscription 
	socket.on('subscription', function(status){
		updateSubscription(status);
		function updateSubscription(status){
			
			var statusDb;
			if(status === 1){
				statusDb = {$push:{"subscriptions":1}};
				usersInf[socket.usrName].notify = 1;
			} else{
				statusDb = {$pull:{"subscriptions":1}};
				usersInf[socket.usrName].notify = 0;
			}
			
			var user = User.findOneAndUpdate({"_id": socket.usrName},
											 statusDb, 
											 {"upsert":false});
			user.exec(function(err, docs){
				if(err) throw err;
				if (User) {
					console.log("User exists"+ User);
					if(usersInf[socket.usrName].notify == 1){
						for(var i=0; i < notificationList.length; i++){
							console.log(notificationList[i]);
							socket.emit('new message', {msg: notificationList[i], account: socket.usrName});
						}
					}
				}
			});
		}			
	})
	

	socket.on('send message', function(data){
		if(data != ""){
			notifications = Notification.find({});
			function saveNotification(notificationId, message, author_p){
			
				var notif = {txt:message, date:new Date(), author:author_p};
		
				var notification = Notification.findOneAndUpdate({"_id": notificationId},
																 {$push:{"msgs":notif}},
																 {safe: true, upsert: true});
				notification.exec(function(err, docs){
					if(err) throw err;
					if (Notification) {}
				});
			}
			
			notificationList.push(data);
			saveNotification(1,data, socket.usrName);
						
			_.map( usersInf, function(user) {
				if(usersInf[user.usrName].notify == 1){
					usersInf[user.usrName].emit('new message', {msg: data, account:" tess"});
				}
			})
		}
	});
	
	socket.on('disconnect', function(data){
		if(!socket.usrName) return;  

		delete usersInf[socket.usrName];		
		console.log(usersInf);
	});
});

function saveUserNotificiation(userName, notificationId, status){
	var user;

	if(status == 0){
		user = User.findOneAndUpdate({"_id": userName},
									 {$push:{subscriptions:notificationId}}, 
										{"upsert":false});
									 
		user.exec(function(err, docs){
			if(err) throw err;
			if (User) {
				console.log("User exists"+ User);
			}
		});
	}
}

function getNotifications(){
		console.log('load notifications from db');
		notifications.exec(function(err, docs){
			if(err) throw err;
			for(var i=0; i < docs.length; i++){	
				for(var j=0; j < docs[i].msgs.length; j++){
					notificationList.push(docs[i].msgs[j].txt);
				}
			}
		});
	}
