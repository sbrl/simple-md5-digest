/*
 * Raw Implementation, just in case I make a mistake packaging this up into an NPM module.
 */

challenge.split(",").forEach(function(str) {
	var str_split = str.split("=");
	if(str_split[1].substring(0, 1) == `"`) str_split[1] = str_split[1].substring(1);
	if(str_split[1].slice(-1) == `"`) str_split[1] = str_split[1].slice(0, -1);
	parts[str_split[0]] = str_split[1];
});
log("debug", "Recieved challenge:", challenge);
log("debug", "Parsed challenge:", parts);

var response = "";
response += `username="${jid.user}",realm="${parts.realm},nonce="${parts.nonce}",`;

var cnonce = get_id(32),
	// prosody doesn't actually contain support for an authzid when using DIGEST-MD5
//			authzid = `${config.jid}/iojs`,
	digest_uri = `xmpp/${parts.realm}`;
response += `cnonce="${cnonce}",nc=00000001,qop=auth,`;
response += `digest-uri="${digest_uri}",charset=utf-8,`;

var resp_start = `${jid.user}:${parts.realm}:${config.password}`,
	resp_start_hash = crypto.createHash("md5").update(resp_start).digest("binary"),
	resp_part_1 = `${resp_start_hash}:${parts.nonce}:${cnonce}`,//:${authzid}
	resp_part_2 = `AUTHENTICATE:${digest_uri}`,
	resp_part_1_hash = crypto.createHash("md5").update(resp_part_1).digest("hex"),
	resp_part_2_hash = crypto.createHash("md5").update(resp_part_2).digest("hex"),
	resp_end = `${resp_part_1_hash}:${parts.nonce}:00000001:${cnonce}:${parts.qop}:${resp_part_2_hash}`,
	proof = crypto.createHash("md5").update(resp_end).digest("hex");

response += `response=${proof}`;