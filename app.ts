import 'dotenv/config';

import { io, Socket } from 'socket.io-client';
import player from 'play-sound';
import request from 'request';

type PlayUrl = {
  url: string;
};

type PlayText = {
  text: string;
  volume: number;
};

type PlayClip = {
  file: string;
  volume: number;
};

interface ServerToClientEvents {
  play_url: (data: PlayUrl) => void;
  play_text: (data: PlayText) => void;
  close: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ClientToServerEvents {}

// connect to socket for bot commands
// the basic idea is that we just proxy commands to the referenced HTTP API

function urlForRoom(roomName: string): string {
  return `${process.env.SONOS_BRIDGE_URL}/${encodeURIComponent(roomName)}`;
}

function playClip(roomName: string, data: PlayClip): void {
  const file = encodeURIComponent(data.file);
  const volume = encodeURIComponent(data.volume);

  if (process.env.USE_LOCAL_SOUNDS === 'true') {
    player().play(`static/clips/${data.file}`);
  } else {
    request(`${urlForRoom(roomName)}/clip/${file}/${volume}`);
  }
}

function sayClip(roomName: string, data: PlayText): void {
  const text = encodeURIComponent(data.text);
  const volume = encodeURIComponent(data.volume);
  request(`${urlForRoom(roomName)}/say/${text}/${volume}`);
}

function enumeratePlayers(callback: (roomName: string) => void): void {
  const roomName = 'Back Office';
  callback(roomName);

  // TODO: at some point if we get another Sonos in here, we can add the
  // enumerate rooms method back...
}

function registerListener(): void {
  const serviceUrl = process.env.CLEARBOT_URL;

  if (!serviceUrl) throw new Error('CLEARBOT_URL was not defined.');

  console.log('Connecting to', serviceUrl);

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(serviceUrl);

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
}

registerListener();
