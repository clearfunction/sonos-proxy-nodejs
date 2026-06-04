export interface PlayUrl {
  type: 'play_url';
  url: string;
}
export interface PlayText {
  type: 'play_text';
  text: string;
  volume: number;
}
export interface CloseCmd {
  type: 'close';
}

export interface MessageHandlers {
  onPlayUrl: (cmd: PlayUrl) => void;
  onPlayText: (cmd: PlayText) => void;
  onClose: (cmd: CloseCmd) => void;
}

export function handleMessage(raw: string, handlers: MessageHandlers): void {
  let cmd: unknown;
  try {
    cmd = JSON.parse(raw);
  } catch {
    console.warn('Ignoring malformed relay message');
    return;
  }
  if (!cmd || typeof cmd !== 'object' || !('type' in cmd)) return;
  switch ((cmd as { type: string }).type) {
    case 'play_url':
      return handlers.onPlayUrl(cmd as PlayUrl);
    case 'play_text':
      return handlers.onPlayText(cmd as PlayText);
    case 'close':
      return handlers.onClose(cmd as CloseCmd);
    default:
      console.warn('Ignoring unknown relay message type');
  }
}
