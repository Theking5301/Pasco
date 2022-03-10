const { ipcRenderer } = require('electron');

window.addEventListener('mousedown', (e) => {
  ipcRenderer.sendToHost('mousedown', { button: e.button });
}, true);
window.addEventListener('click', (e) => {
  ipcRenderer.sendToHost('click', { button: e.button });
}, true);
window.addEventListener('auxclick', (e) => {
  ipcRenderer.sendToHost('auxclick', { button: e.button });
}, true);
