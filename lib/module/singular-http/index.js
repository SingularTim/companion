var instance_skel = require('../../instance_skel');
var https = request('https');
var debug;
var log;

function instance(system, id, config) {
	var self = this;
	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: '<strong>PLEASE READ THIS!</strong> Generic modules is only for use with custom applications. If you use this module to control a device or software on the market that more than you are using, <strong>PLEASE let us know</strong> about this software, so we can make a proper module for it. If we already support this and you use this to trigger a feature our module doesnt support, please let us know. We want companion to be as easy as possible to use for anyone.<br /><br />Use the \'Base URL\' field below to define a starting URL for the instance\'s commands: e.g. \'http://server.url/path/\'.  <b>This field will be ignored if a command uses a full URL.</b>'
		},
		{
			type: 'textinput',
			id: 'prefix',
			label: 'Base URL',
			width: 12,
			value: "app.singular.live/apiv1"
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.actions = function(system) {
	var self = this;
	var urlLabel = 'URL';
	var payload = 'JSON Payload';
	var auth = 'Basic Authentication token';
	var appId = '';
	
	if ( self.config.prefix !== undefined ) {
		if ( self.config.prefix.length > 0 ) {
			urlLabel = 'URI';
		}
	}

	self.setActions({
		'put': {
			label: 'PUT',
			options: [
				{
					type: 'textinput',
					label: urlLabel,
					id: 'url',
					default: '/appinstances'
				},
				{
					type: 'textinput',
					label: appId,
					id: 'appId',
					default:'',
				},
				{
					type:'textinput',
					label: auth,
					id: 'authorization',
					default: ''
				},
				{
					type:'textinput',
					label: payload,
					id: 'payload',
					default: ''
				}
			]
		}
	});
}

instance.prototype.action = function(action) {
	var self = this;

	if (action.action == 'put') {
		let postData=JSON.stringify(action.options.payload);
		let options= {
			host: self.config.prefix,
			path: '/appinstances/' + action.options.url + "/" + action.options.appId + "/control",
			method: 'PUT',
			headers: {
			  "Content-Type": "application/json",
			  "Content-Length": postData.length,
			  "Access-Control-Allow-Origin": "*",
			  "Authorization": "Basic " + action.options.auth
			}
		}
		var req = http.request(options, function (res) {
			res.setEncoding('utf8');
			res.on('data',function (body) {
			  console.log('Body: ' +body);
			});
		});
		req.on('error',function(e){
			console.log('problem with PUT request: ' + e.message);
		});
		req.write(postData);
		req.end();
	}
	/*
	else if (action.action == 'get') {

		self.system.emit('rest_get', cmd, function (err, result) {
			if (err !== null) {
				self.log('error', 'HTTP GET Request failed (' + result.error.code + ')');
				self.status(self.STATUS_ERROR, result.error.code);
			}
			else {
				self.status(self.STATUS_OK);
			}
		});
	}
	*/
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
