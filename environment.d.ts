export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLEARBOT_URL: string;
      RELAY_TOKEN: string;
      SONOS_BRIDGE_URL: string;
      SONOS_ROOMS: string;
      USE_LOCAL_SOUNDS: string;
    }
  }
}
