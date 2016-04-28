# NotificationSuscription
A simple web service, and associated test suite, that delivers tip content to a user, introducing new content as soon as it becomes available, without resetting when falling back to old content again.  The next content is delivered on request (scheduled daily by the client).


Example
Take the following travel content:
1 - Rome is fun!
2 - Have you been to Florida?
3 - Make sure your carry-on is right-sized!

User “Sally” has subscribed to this service.  (Multi-category subscriptions are out of scope.)
The sequence of her content is initially: B1, B2, B3, B1, …
Say at that point, a new article “B4” is published.  The sequence becomes something like:
B1, B2, B3, B1, B4, B2, B3, B4, B1, B2, B3, B4

Requisites:
-Nodejs 4.0> installed 
-Mongod service up and running in the standard port
-port 3000 free

Installation
1.- Clone the repository
2.- In the command line go to the directory where you clone the project
3.- Execute the next command:

		npm install
		
4.-	Run the project:

		node app.js
	
Instructions:
The project run in http://localhost:3000 open that url in a browser and type a username.

There are 2 types of users, admin user and the rest, to start session as admin just log in  as "admin" username, then you'll be able to publish any message, otherwise the rest of the users are able only to see what the admin publishes in an infinite loop if they subscribe to the service.

There is one more way to publish messages, this is trhough the web service:
POST
http://127.0.0.1:3000/service
Params:
	user
	txt

Notes to improve the project in a production environment:
	-Use redis to store the logged user list in order to keep some millions of users and their state in memory,
	-Configure a mongodb replica set in order to have redundancy and backup, even configure a shard environment.
	-Use a loadbalancer to have more than one service up and running and in case one fails redirect the request to the rest.
	-run the application as a service.
	-profile the application using v8 profiler.
	-configure NodeJS in a cluster environment to take advantage of using multiple processor cores 
	-the security is another aspect to consider as well, use user/password to generate a token in order to use the ws or at least the admin in the webapp.
	-use https