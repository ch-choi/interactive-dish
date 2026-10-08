import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createExplorer } from '../explorer.js';

function fixture(reducedMotion = false, layout = null, width = 1440, height = 900) {
  const frames = [];
  const view = {
    innerWidth: width, innerHeight: height,
    matchMedia: () => ({ matches: reducedMotion }),
    requestAnimationFrame: fn => (frames.push(fn), frames.length),
    cancelAnimationFrame() {}, addEventListener() {}, removeEventListener() {},
  };
  const document = { defaultView: view, createElement: () => new Element() };
  class Element {
    ownerDocument = document;
    style = {}; dataset = {}; children = []; events = {}; animations = []; captures = [];
    tabIndex = -1;
    classList = { add() {}, remove() {}, toggle() {} };
    appendChild(node) { this.children.push(node); }
    replaceChildren() { this.children = []; }
    setAttribute() {}
    addEventListener(name, fn) { this.events[name] = fn; }
    removeEventListener() {}
    remove() {}
    setPointerCapture(id) { this.captures.push(id); }
    releasePointerCapture() {}
    animate(keyframes, timing) {
      const animation = { keyframes, timing, cancelled: false, cancel() { this.cancelled = true; } };
      this.animations.push(animation);
      return animation;
    }
  }
  const container = new Element();
  const desktop = [100, 1500].map(x => ({ x, y: 100, size: 100, data: {}, src: '' }));
  const explorer = createExplorer(container, layout || { desktop });
  const buttons = container.children[0].children;
  const flush = () => { for (let i = 0; frames.length && i < 500; i++) frames.shift()(); assert.equal(frames.length, 0); };
  const pan = deltaX => {
    const event = { pointerId: 1, clientX: 500, clientY: 400, preventDefault() {} };
    container.events.pointerdown(event);
    event.clientX -= deltaX;
    container.events.pointermove(event);
    container.events.pointerup(event);
    flush();
  };
  return { explorer, buttons, pan, flush, container };
}

const { explorer, buttons, pan, flush } = fixture();
const entering = buttons[1].children[0];
assert.equal(entering.animations.length, 0, 'offscreen items wait for entry');
pan(150);
assert.equal(entering.animations.length, 1);
assert.equal(entering.animations[0].timing.delay, 0, 'drag reveal has no loading delay');
assert.equal(entering.animations[0].keyframes[0].transform, 'scale(0)');
explorer.filter(() => false);
assert.equal(entering.style.opacity, '0');
assert.equal(entering.animations[0].cancelled, true);
pan(-150);
assert.equal(entering.animations.length, 1, 'filtered items stay hidden during movement');
explorer.filter(null);
explorer.reset();
flush();
assert.equal(buttons[1].dataset.visible, 'false');
pan(150);
assert.equal(entering.animations.length, 2, 'reentry replays reveal');
explorer.destroy();
assert.equal(entering.animations[1].cancelled, true);

const reduced = fixture(true);
reduced.pan(150);
assert.equal(reduced.buttons[1].children[0].animations.length, 0);
assert.equal(reduced.buttons[1].children[0].style.opacity, '1');
reduced.explorer.destroy();

const data = JSON.parse(readFileSync(new URL('../data.json', import.meta.url)));
let selections = 0;
const clicks = fixture(true, { ...data, onSelect: () => selections++ });
const clickEvent = { pointerId: 1, clientX: 500, clientY: 400, preventDefault() {} };
clicks.container.events.pointerdown(clickEvent);
assert.equal(clicks.container.captures.length, 0, 'ordinary click retains its product target');
clicks.container.events.pointerup(clickEvent);
const product = clicks.buttons.find(button => button.dataset.visible === 'true');
product.events.click(clickEvent);
assert.equal(selections, 1);
clicks.pan(100);
assert.equal(clicks.container.captures.length, 1, 'drag still captures its pointer');
product.events.click(clickEvent);
assert.equal(selections, 1, 'drag release does not open a detail page');
clicks.explorer.destroy();
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const field = fixture(true, data, width, height);
  for (const zoom of [0, -1, 1, 1]) {
    field.explorer.zoom(zoom);
    for (const [deltaX, deltaY] of [[6000, 0], [-12000, 0], [0, 9000], [0, -18000], [14000, 12000]]) {
      field.container.events.wheel({ deltaX, deltaY, preventDefault() {} });
      const visible = field.buttons.filter(button => button.dataset.visible === 'true');
      assert.ok(visible.length >= 6, `${width}px field stays populated beyond all edges`);
      assert.equal(field.buttons.length, 114, 'recycling does not accumulate DOM nodes');
    }
  }
  field.explorer.filter(() => false);
  field.pan(5000);
  assert.ok(field.buttons.every(button => button.dataset.visible === 'false'));
  field.explorer.destroy();
}
console.log('Explorer reveal checks passed.');
