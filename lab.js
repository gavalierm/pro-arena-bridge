import fs from 'fs';
import fetch from 'node-fetch';
import WebSocket from 'ws';


let config = JSON.parse(fs.readFileSync('./config.json'));
let clip;

async function lenverse_connect() {
	if (config.lenverse.enabled !== true) {
		console.warn("\n------\nLenVerse Module is disabled!\n------\n");
		return;
	}
	const url = `ws://${config.lenverse.host}:${config.lenverse.port}/current/verse.txt`;
	console.log("Connecting to LenVerse ", url);
	const ws = new WebSocket(url);

	ws.on('open', function open() {
		console.log('/current/verse.txt connected')
	});

	ws.on('error', function (error) {
		console.log("LenVerse:", error)
	});

	ws.on('close', function close() {
		console.log('LenVerse: Connection closed, reconnecting ...');
		setTimeout(lenverse_connect, 10000);
	});

	ws.on('message', function message(data) {
		const text = data.toString()
		// Switch clips
		clip = (clip === config.arena.clipA) ? config.arena.clipB : config.arena.clipA;
		console.log(text);
		fetchArena('PUT', `/api/v1/composition/layers/${clip.layer}/clips/${clip.column}`,
			JSON.stringify({ "video": { "sourceparams": { "Text": text } } }))
		fetchArena('POST', `/api/v1/composition/layers/${clip.layer}/clips/${clip.column}/connect`, '')
	});
}

async function fetchArena(method, path, body) {
		await fetch(`http://${config.arena.host}:${config.arena.port}${path}`, {
			method: method,
			body: body,
			headers: { 'Content-Type': 'application/json' },
		});
}

console.log('config', config);
lenverse_connect()
