import { test } from 'node:test';
import assert from 'node:assert/strict';

import ScrollManager from '../src/managers/ScrollManager';
import VirtualChatManager from '../src/managers/VirtualChatManager';
import ScrollButton from '../src/components/ScrollButton';

// Minimal stubs to avoid DOM dependencies
class StubChatManager extends VirtualChatManager {
  constructor() { super(); }
  scrollWindowUpCalls = 0;
  scrollWindowDownCalls = 0;
  scrollWindowUp() { this.scrollWindowUpCalls++; return true; }
  scrollWindowDown() { this.scrollWindowDownCalls++; return true; }
  getConversationContainer() { return { scrollTop: 0, clientHeight: 1000, scrollHeight: 2000, addEventListener(){} }; }
}
class StubScrollButton extends ScrollButton {
  constructor(cm) { super(cm); }
  updateVisibility() {}
  init() {}
}

test('cooldown prevents rapid scroll actions', async () => {
  const cm = new StubChatManager();
  const sb = new StubScrollButton(cm);
  const manager = new ScrollManager(cm, sb);

  manager.updateIfNeeded(); // first call loads once
  const firstCalls = cm.scrollWindowUpCalls + cm.scrollWindowDownCalls;
  manager.updateIfNeeded(); // second call within cooldown should not increment
  const secondCalls = cm.scrollWindowUpCalls + cm.scrollWindowDownCalls;
  assert.ok(secondCalls === firstCalls, 'second call should be suppressed by cooldown');

  manager.destroy();
});
