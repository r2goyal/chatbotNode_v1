'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

app.post('/webhookToChatbot/', function (req, res) {
	console.log("request arrived");
	console.log(req.body);
	console.log("text === "+req.body.result.resolvedQuery);
		request({
				//url: 'http://192.168.7.53:7070/chatbot/rest/Chatbot/getResponse?request='+req.body.result.resolvedQuery,
				url: 'http://72.55.146.142:9091/chatbot/rest/Chatbot/getResponse?request='+req.body.result.resolvedQuery,
				method: 'GET',
				async:false
				}, function(error, response, body) {
				if (error) {
					console.log('Error sending messages: ', error)
				}else{
					console.log("in else response block............");
					console.log(response.body);
					res.send(response.body);
				}
			})
		console.log("At the end of response................befor status 200....");
		res.sendStatus(200);
})


// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			var text = event.message.text;
			//~ if (text === 'Generic') {
				//~ sendGenericMessage(sender)
				//~ continue
			//~ }
			
			request({
				url: 'http://72.55.146.142:9091/chatbot/rest/Chatbot/getResponse?request='+text,
				method: 'GET',
				async:false
				}, function(error, response, body) {
				if (error) {
					console.log('Error sending messages: ', error)
				}else{
					sendTextMessage(sender, response.body);
				}
			})
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})

const token = process.env.PAGE_ACCESS_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN


function sendTextMessage(sender, text) {
	let messageData = { text:text }
	
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

//~ function sendGenericMessage(sender) {
	//~ let messageData = {
		//~ "attachment": {
			//~ "type": "template",
			//~ "payload": {
				//~ "template_type": "generic",
				//~ "elements": [{
					//~ "title": "First card",
					//~ "subtitle": "Element #1 of an hscroll",
					//~ "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					//~ "buttons": [{
						//~ "type": "web_url",
						//~ "url": "https://www.messenger.com",
						//~ "title": "web url"
					//~ }, {
						//~ "type": "postback",
						//~ "title": "Postback",
						//~ "payload": "Payload for first element in a generic bubble",
					//~ }],
				//~ }, {
					//~ "title": "Second card",
					//~ "subtitle": "Element #2 of an hscroll",
					//~ "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					//~ "buttons": [{
						//~ "type": "postback",
						//~ "title": "Postback",
						//~ "payload": "Payload for second element in a generic bubble",
					//~ }],
				//~ }]
			//~ }
		//~ }
	//~ }
	//~ request({
		//~ url: 'https://graph.facebook.com/v2.6/me/messages',
		//~ qs: {access_token:token},
		//~ method: 'POST',
		//~ json: {
			//~ recipient: {id:sender},
			//~ message: messageData,
		//~ }
	//~ }, function(error, response, body) {
		//~ if (error) {
			//~ console.log('Error sending messages: ', error)
		//~ } else if (response.body.error) {
			//~ console.log('Error: ', response.body.error)
		//~ }
	//~ })
//~ }

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
