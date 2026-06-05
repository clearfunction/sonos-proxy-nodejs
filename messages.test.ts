import { expect, test, vi } from 'vitest';
import { handleMessage } from './messages';

const handlers = () => ({ onPlayUrl: vi.fn(), onPlayText: vi.fn(), onClose: vi.fn() });

test('routes play_url', () => {
  const h = handlers();
  handleMessage(JSON.stringify({ type: 'play_url', url: 'u' }), h);
  expect(h.onPlayUrl).toHaveBeenCalledWith({ type: 'play_url', url: 'u' });
});

test('routes play_text', () => {
  const h = handlers();
  handleMessage(JSON.stringify({ type: 'play_text', text: 't', volume: 60 }), h);
  expect(h.onPlayText).toHaveBeenCalledWith({ type: 'play_text', text: 't', volume: 60 });
});

test('ignores malformed JSON without throwing', () => {
  const h = handlers();
  expect(() => handleMessage('not json', h)).not.toThrow();
  expect(h.onPlayUrl).not.toHaveBeenCalled();
});

test('ignores unknown type', () => {
  const h = handlers();
  handleMessage(JSON.stringify({ type: 'wat' }), h);
  expect(h.onPlayUrl).not.toHaveBeenCalled();
});
