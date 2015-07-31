var crypto = require("crypto"),
	
	id_pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
	
	settings = {
		service: "xmpp"
	};


/*
 * @summary Encodes something using base64.
 * 
 * @param thing - The thing to encode using base64.
 * 
 * @returns {string} - Teh thing encoded using base64.
 */
function base64_encode(thing)
{
	return new Buffer(thing).toString("base64");
}

/*
 * @summary Decodes something that is encoded using base64.
 * 
 * @param thing - The thing to decode from base64.
 * 
 * @returns The decoded thing.
 */
function base64_decode(thing)
{
	return new Buffer(thing, "base64").toString("utf-8");
}

/*
 * @summary Calculates the MD5 hash of something.
 * 
 * @param thing - The thing to hash.
 * @param encoding {string} - The encoding to return the hash as. Defautls to "hex".
 * 
 * @returns The MD5 hash of `thing`.
 */
function md5(thing, encoding)
{
	if(typeof encoding != "string") encoding = "hex";
	return crypto.createHash("md5").update(thing).digest(encoding);
}

/*
 * @summary Generates a random string of letters and numbers.
 * 
 * @param length {number} - The length of the string to generate. Defaults to 32 characters.
 * 
 * @returns {string} - A random string of letters and numbers of length `length`.
 */
function get_id(length)
{
	if(typeof length != "number") length = 10;
	
	var result = "";
	for(var i = 0; i < length; i++)
	{
		result += id_pool[Math.floor(Math.random() * id_pool.length)];
	}
	
	return result;
}

/*
 * @summary Parses a DIGEST-MD5 challenge into it's component parts.
 * 
 * @param challenge {string} - The challenge to parse.
 * 
 * @returns {object} An object contains the component parts of the given challenge.
 */
function parse_challenge(challenge)
{
	var parts = {};
	challenge.split(",").forEach(function(str) {
		var str_split = str.split("=");
		if(str_split[1].substring(0, 1) == `"`) str_split[1] = str_split[1].substring(1);
		if(str_split[1].slice(-1) == `"`) str_split[1] = str_split[1].slice(0, -1);
		parts[str_split[0]] = str_split[1];
	});
	
	return parts;
}

/*
 * @summary Calculates the response to a given challenge.
 * 
 * @reference http://web.archive.org/web/20050224191820/http://cataclysm.cx/wip/digest-md5-crash.html
 * 
 * @param c_parts {object} - A parsed challenge from parse_challenge().
 * @param user {string} - The name of the user to authenticate.
 * @param pass {string} - The user's password.
 * @param resource {string} - The resource to request. Omitting results in the response being calculated without a resource. Note that some servers (e.g. Prosody) don't support an authzid when using DIGEST-MD5.
 */
function calculate_response(c_parts, user, pass, resource)
{
	if(typeof user != "string")
		throw new Error(`Invalid user: ${user}. Expecting string.`);
	if(typeof pass != "string")
		throw new Error(`Invalid pass: ${pass}. Expecting string.`);
	
	if(typeof resource != "string") resource = false;
	
	var response = "";
	response += `username="${user}",realm="${c_parts.realm},nonce="${c_parts.nonce}",`;
	
	var cnonce = get_id(32),
		// Note Prosody doesn't actually contain support for an authzid when using DIGEST-MD5
		authzid = `${user}@${c_parts.realm}/${resource}`,
		digest_uri = `${settings.service}/${c_parts.realm}`;
	response += `cnonce="${cnonce}",nc=00000001,qop=auth,`;
	response += `digest-uri="${digest_uri}",charset=utf-8,`;

	var x = `${user}:${c_parts.realm}:${pass}`,
		y = md5(x, "binary"),
		a1 = `${y}:${c_parts.nonce}:${cnonce}`;
	
	if(resource) a1 += `:${authzid}`;
		
	var a2 = `AUTHENTICATE:${digest_uri}`,
		ha1 = md5(a1),
		ha2 = md5(a2),
		kd = `${ha1}:${c_parts.nonce}:00000001:${cnonce}:${c_parts.qop}:${ha2}`,
		z = md5(kd);
	
	response += `response=${z}`;
	if(resource) response += `,authzid="${authzid}"`;
	
	return response;
}

/*
 * @summary Calculates the response to a given challenge.
 * 
 * @reference http://web.archive.org/web/20050224191820/http://cataclysm.cx/wip/digest-md5-crash.html
 * 
 * @param c_parts {string} - The challenge to calculate a response for.
 * @param user {string} - The name of the user to authenticate.
 * @param pass {string} - The user's password.
 * @param resource {string} - The resource to request. Omitting results in the response being calculated without a resource. Note that some servers (e.g. Prosody) don't support an authzid when using DIGEST-MD5.
 */
function get_response(challenge, user, pass, resource)
{
	return calculate_response(parse_challenge(challenge), user, pass, resource);
}

/*
 * @summary The same as get_response, but decodes the challenge from base64 first.
 */
function get_response_b64(challenge, user, pass, resource)
{
	return get_response(base64_decode(challenge), user, pass, resource);
}

/*
 * @summary Sets the service you are authenticating to.
 * 
 * @param The service to authenticate with.
 */
function set_service(service) { settings.service = service; }

module.exports = {
	parse_challenge: parse_challenge,
	get_response_raw: calculate_response,
	
	get_response: get_response,
	get_response_b64: get_response_b64,
	
	base64_encode: base64_encode,
	base64_decode: base64_decode,
	
	md5: md5,
	
	set_service: set_service
};