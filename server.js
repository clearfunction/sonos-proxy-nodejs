"use strict";
const singlePlayerAnnouncement = require("node-sonos-http-api/lib/helpers/single-player-announcement");
const tryDownloadTTS = require("node-sonos-http-api/lib/helpers/try-download-tts");
const settings = require("./settings");
const sonosHttpSettings = require("node-sonos-http-api/settings");
const SonosSystem = require("sonos-discovery");
const discovery = new SonosSystem(sonosHttpSettings);
var request = require("request");

// connect to socket for bot commands
// the basic idea is that we just proxy commands to the referenced HTTP API

var registerListener = function() {
  var serviceUrl = settings.clearbotUrl;

  var socket = require("socket.io-client")(serviceUrl);

  socket.on("connect", function() {
    console.log("Connected to server: " + serviceUrl);
  });

  socket.on("play_url", function(data) {
    console.log("Received play_url: ", data);
    for (var index = 0; index < discovery.players.length; index++) {
      var player = discovery.players[index];
      request(
        `http://${discovery.localEndpoint}:${sonosHttpSettings.port}/${encodeURIComponent(
          player.roomName
        )}/clip/${encodeURIComponent(data.url)}/${data.volume}`
      );
    }
  });

  socket.on("play_text", function(data) {
    console.log("Received say: ", data);
    for (var index = 0; index < discovery.players.length; index++) {
      var player = discovery.players[index];
      request(
        `http://${discovery.localEndpoint}:${sonosHttpSettings.port}/${encodeURIComponent(
          player.roomName
        )}/say/${encodeURIComponent(data.text)}/${data.volume}`
      );
    }
  });

  socket.on("close", function() {
    console.log(`Lost contact with server: ${serviceUrl}`);
    console.log("I don't know how to reconnect yet.  Please help!");
    process.exit(1);
  });
};

// start up the http api server
require("node-sonos-http-api/server");
console.log(`Looking for Sonos speakers`);

registerListener();
