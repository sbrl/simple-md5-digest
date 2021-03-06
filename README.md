simple-digest-md5
=================
This module implements DIGEST-MD5 in pure javascript. I didn't see any other implementations in pure JS here on npm, so when I wrote one I thought that I would put it up here - hopefully this helps somebody.

[![NPM](https://nodei.co/npm/simple-digest-md5.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/simple-digest-md5/)
[![NPM](https://nodei.co/npm-dl/simple-digest-md5.png?months=9&height=3)](https://nodei.co/npm/simple-digest-md5/)


Installation
------------

```bash
npm install simple-digest-md5
```

Usage
-----
This module will calculate the response to a given DIGEST-MD5 challenge, but it won't send it down the wire for you.

To use it do something like this:

```javascript
var md5_digest = require("simple-md5-digest");

// Initialise socket here & send initial packets

socket.on("data", function(data) {
	// Process incoming message here
	
	// ...
	
	
	// We have get a challenge from the server!
	
	var ch_response = md5_digest.get_response(challenge, "username", "password", "resource");
	
	// Package the response up to send it down the wire here
	
	socket.write(message);
});

```

**Warning: Some server's don't actually support an `authzid` when using DIGEST_MD5! (e.g. prosody). If this the case, omit the `resource` parameter:**

```javascript
var ch_response = md5_digest.get_response(challenge, "username", "password");
```

This will cause `simple-digest-md5` to omit the `authzid` from the response it calculates. Note that the `authzid` is the part that adds support for the resource string.

Note that when calculating the response to a given DIGEST_MD5 challenge, you have to provide the name of the service that you are authenticating with. This module is set up for `xmpp` by default, but you can change it like so:

```javascript
digest_md5.set_service("service_name_here");
```

If you have got a challenge encoded as base64, simply use `md5_digest.get_response_b64` instead and it will decode the response first.

Using this with XMPP
--------------------

If you are using this with XMPP, I recommend you read [this page](http://web.archive.org/web/20050224191820/http://cataclysm.cx/wip/digest-md5-crash.html), which walks you through the proecss and gives you a sample exchange. For convenience, I will include the sample exchange here:

```
1 >>> <auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='DIGEST-MD5'/>
1 <<< <challenge xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>cmVhbG09ImNhdGFjbHlzbS5jeCIsbm9uY2U9Ik9BNk1HOXRFUUdtMmhoIixxb3A9ImF1dGgiLGNoYXJzZXQ9dXRmLTgsYWxnb3JpdGhtPW1kNS1zZXNz</challenge>
2 >>> <response xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>dXNlcm5hbWU9InJvYiIscmVhbG09ImNhdGFjbHlzbS5jeCIsbm9uY2U9Ik9BNk1HOXRFUUdtMmhoIixjbm9uY2U9Ik9BNk1IWGg2VnFUclJrIixuYz0wMDAwMDAwMSxxb3A9YXV0aCxkaWdlc3QtdXJpPSJ4bXBwL2NhdGFjbHlzbS5jeCIscmVzcG9uc2U9ZDM4OGRhZDkwZDRiYmQ3NjBhMTUyMzIxZjIxNDNhZjcsY2hhcnNldD11dGYtOCxhdXRoemlkPSJyb2JAY2F0YWNseXNtLmN4L215UmVzb3VyY2Ui</response>
2 <<< <challenge xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>cnNwYXV0aD1lYTQwZjYwMzM1YzQyN2I1NTI3Yjg0ZGJhYmNkZmZmZA==</challenge>
3 >>> <response xmlns='urn:ietf:params:xml:ns:xmpp-sasl'/>
3 <<< <success xmlns='urn:ietf:params:xml:ns:xmpp-sasl'/>
```

The 2nd message that you send is the base64 encoded result from `digest_md5.get_response()`.

Advanced Usage
--------------
The following functions are also available for use if you need finer control over how this module operates:

 - `digest_md5.base64_encode(thing)` - Encodes something to base_64. This is probably useful when sending your response to the server - XMPP at least requires the response encoded at base64.
 - `digest_md5.base64_decode(thing)` - Decodes something encoded with base64.
 - `digest_md5.parse_challenge(challenge)` - Parses a given challenge string into it's component parts.
 - `digest_md5.set_service(service_name)` - Sets the serivce that you are authenticating with.
 - `digest_md5.parse_challenge(challange_str)` - Parses a given challange string into its component parts.
 - `digest_md5.get_response_raw(parsed_challenge, user, pass, resource)` - Calculates a response to a challenge string parsed with the above function.
 - `md5(thing, encoding)` - Calculates the md5 hash of something. Usually that something will be a string. Encoding is set to "hex" by default, but you can change it to "binary" or anything else you like that `crypto`'s `createHash("md5").digest()` supports.

If the above explanations don't make sense, simply read the source code located in `index.js` - the functions are extensively documented there. If that still doesn't help, contact me and I will try and help you :)

Bugs & Support
----
You can report bugs and / or get help on the [GitHub Issue Tracker](https://github.com/sbrl/simple-md5-digest/issues). I can also be contacted by email.

Credits
-------
 - This webpage was used to implement this module: [A crash course in SASL and DIGEST-MD5 for XMPP](http://web.archive.org/web/20050224191820/http://cataclysm.cx/wip/digest-md5-crash.html) by Robert Norris
