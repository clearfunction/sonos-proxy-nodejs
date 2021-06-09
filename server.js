const socketio = require('socket.io-client');

const request = require('request');
const settings = require('./settings');

// connect to socket for bot commands
// the basic idea is that we just proxy commands to the referenced HTTP API

function urlForRoom(roomName) {
  return `${settings.sonosBridgeHost}/${encodeURIComponent(roomName)}`;
}

function playClip(roomName, data) {
  const file = encodeURIComponent(data.file);
  const volume = encodeURIComponent(data.volume);
  request(`${urlForRoom(roomName)}/clip/${file}/${volume}`);
}

function sayClip(roomName, data) {
  const text = encodeURIComponent(data.text);
  const volume = encodeURIComponent(data.volume);
  request(`${urlForRoom(roomName)}/say/${text}/${volume}`);
}

function enumeratePlayers(callback) {
  const roomName = 'CF Front';
  callback(roomName);

  // TODO: at some point if we get another Sonos in here, we can add the
  // enumerate rooms method back...
}

const registerListener = () => {
  const serviceUrl = settings.clearbotUrl;

  const socket = socketio.connect(serviceUrl);

  socket.on('connect', () => {
    console.log(`Connected to server: ${serviceUrl}`);
  });

  socket.on('play_url', data => {
    console.log('Received play_url: ', data);

    enumeratePlayers(roomName => {
      // HACK: switch to new format for now...
      const { url } = data;

      playClip(roomName, {
        file: url,
        volume: 20,
      });
    });
  });

  socket.on('play_text', data => {
    console.log('Received say: ', data);

    enumeratePlayers(roomName => {
      sayClip(roomName, data);
    });
  });

  socket.on('close', () => {
    console.log(`Lost contact with server: ${serviceUrl}`);
    console.log("I don't know how to reconnect yet.  Please help!");
    process.exit(1);
  });
};

registerListener();
