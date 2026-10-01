const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
const start = source.indexOf('  let accountChoiceResolve=null;');
const end = source.indexOf('  const showSaveInfo =', start);
assert(start > 0 && end > start);
assert.match(source, /pendingLevelUp=companyLevelUp\+staffLevelUp\|\|null/);
assert.match(source, /\$\('reportDone'\)\.onclick=closeModal/);
assert.match(source, /\$\('modalClose'\)\.onclick=closeModal/);

const elements = {
  modalLayer: {hidden: false, querySelector: () => ({scrollTop: 100})},
  modalContent: {innerHTML: '<div>컬렉션 결과</div>', querySelectorAll: () => [], replaceChildren() {this.innerHTML = ''; }},
  modalClose: {hidden: false, focus() {}},
  modalTitle: {focus() {}},
  levelUpDone: {},
  officeReturnLayer: {hidden: true, classList: {add() {}, remove() {}}}
};
let animations = 0, renders = 0, loadedArtwork = '';
const context = {
  $: id => elements[id],
  isProducing: false,
  eventVenueActive: false,
  state: {officeLevel: 4},
  Image: class {set src(value) {loadedArtwork=value;} decode() {return Promise.resolve();}},
  setTimeout: callback => {callback();},
  requestAnimationFrame: callback => callback(),
  render: () => {renders++;},
  animateLevelChanges: () => {animations++;}
};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + '\nthis.api={closeModal, queue:html=>pendingLevelUp=html};', context);

context.api.queue('<section>회사와 직원 레벨업</section>');
context.api.closeModal(); // Collection result: both the return button and X call this.
assert.equal(elements.modalLayer.hidden, false);
assert.match(elements.modalContent.innerHTML, /새로운 레벨업 정보/);
assert.match(elements.modalContent.innerHTML, /회사와 직원 레벨업/);
assert.equal(animations, 1);
elements.levelUpDone.onclick();
assert.equal(elements.modalLayer.hidden, true);
assert.equal(elements.modalContent.innerHTML, '');

elements.modalLayer.hidden = false;
context.api.closeModal(); // A release without a level-up returns directly to the office.
assert.equal(elements.modalLayer.hidden, true);
assert.equal(animations, 1);

context.eventVenueActive = true;
elements.modalLayer.hidden = false;
elements.officeReturnLayer.hidden = true;
context.api.closeModal(); // Fashion Week shows its own transition before restoring the office.
assert.equal(elements.officeReturnLayer.hidden, false);
setImmediate(() => {
  assert.equal(elements.modalLayer.hidden, true);
  assert.equal(elements.officeReturnLayer.hidden, true);
  assert.equal(context.eventVenueActive, false);
  assert.equal(loadedArtwork, './assets/office-mid.webp');
  assert.equal(renders, 1);
  console.log('Collection result, level-up modal, and Fashion Week office return passed.');
});
