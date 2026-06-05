import 'dotenv/config';

import { spawn } from 'node:child_process';
import player from 'play-sound';
import { handleMessage } from './messages';
import { nextBackoffMs } from './backoff';

type PlayClip = {
  file: string;
  volume: number;
};

process.on('unhandledRejection', reason => {
  console.warn('Unhandled promise rejection:', reason);
});

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
    fetch(`${urlForRoom(roomName)}/clip/${file}/${volume}`).catch(err =>
      console.warn('Sonos bridge request failed:', err)
    );
  }
}

function localSay(text: string): void {
  if (process.platform === 'darwin') {
    spawn('say', [text]);
  } else {
    // NOTE: simple Windows support could be done with https://github.com/p-groarke/wsay or similar
    console.warn('localSay is not supported on this platform.');
  }
}

function sayClip(
  roomName: string,
  data: { text: string; volume: number }
): void {
  const text = encodeURIComponent(data.text);
  const volume = encodeURIComponent(data.volume);

  if (process.env.USE_LOCAL_SOUNDS === 'true') {
    localSay(text);
  } else {
    fetch(`${urlForRoom(roomName)}/say/${text}/${volume}`).catch(err =>
      console.warn('Sonos bridge request failed:', err)
    );
  }
}

// Rooms to play on, from SONOS_ROOMS (comma-separated for multiple speakers).
const rooms = (process.env.SONOS_ROOMS ?? 'Back Office')
  .split(',')
  .map(room => room.trim())
  .filter(Boolean);

function enumeratePlayers(callback: (roomName: string) => void): void {
  rooms.forEach(callback);
}

function connect(): void {
  const serviceUrl = process.env.CLEARBOT_URL;
  const token = process.env.RELAY_TOKEN;
  if (!serviceUrl) throw new Error('CLEARBOT_URL was not defined.');
  if (!token) throw new Error('RELAY_TOKEN was not defined.');

  let attempt = 0;

  const open = () => {
    console.log('Connecting to', serviceUrl);
    // token rides as the WebSocket subprotocol (Sec-WebSocket-Protocol)
    const ws = new WebSocket(serviceUrl, token);

    ws.addEventListener('open', () => {
      attempt = 0;
      console.log(`Connected to server: ${serviceUrl}`);
    });

    ws.addEventListener('message', event => {
      handleMessage(String(event.data), {
        onPlayUrl: data => {
          console.log('Received play_url: ', data);
          // HACK: switch to new format for now...
          enumeratePlayers(roomName =>
            playClip(roomName, { file: data.url, volume: 20 })
          );
        },
        onPlayText: data => {
          console.log('Received say: ', data);
          enumeratePlayers(roomName => sayClip(roomName, data));
        },
        onClose: () => console.log('Server asked us to close; will reconnect.'),
      });
    });

    // A 1006 close right after connecting usually means a rejected token, not a down server.
    ws.addEventListener('close', event => {
      const delay = nextBackoffMs(attempt++);
      console.log(
        `Disconnected (code ${event.code}${event.reason ? `: ${event.reason}` : ''}); reconnecting in ${Math.round(delay / 1000)}s`
      );
      setTimeout(open, delay);
    });
    ws.addEventListener('error', () => {
      // 'close' fires after 'error'; avoid double-scheduling
      console.warn('WebSocket error; closing to trigger reconnect');
      try {
        ws.close();
      } catch {
        /* noop */
      }
    });
  };

  open();
}

connect();
