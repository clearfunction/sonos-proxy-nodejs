export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLEARBOT_URL: string;
      SONOS_BRIDGE_URL: string;
    }
  }
}
