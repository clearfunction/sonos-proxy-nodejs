const SonosSystem = require('sonos-discovery');
const socketio = require('socket.io-client');

const discovery = new SonosSystem();
const request = require('request');
const settings = require('./settings');

// connect to socket for bot commands
// the basic idea is that we just proxy commands to the referenced HTTP API

function urlForRoom(roomName) {
  return `${settings.sonosBridgeHost}/${encodeURIComponent(roomName)}`;
}

function playClip(roomName, data) {
  request(`${urlForRoom(roomName)}/clip/${data.file}/${data.volume}`);
}

function sayClip(roomName, data) {
  request(`${urlForRoom(roomName)}/say/${data.text}/${data.volume}`);
}

function enumeratePlayers(callback) {
  for (let index = 0; index < discovery.players.length; index += 1) {
    const player = discovery.players[index];

    callback(player.roomName);
  }
}

const registerListener = () => {
  const serviceUrl = settings.clearbotUrl;

  const socket = socketio(serviceUrl);

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
