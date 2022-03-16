const { ipcRenderer } = require("electron");

window.addEventListener(
  "mousedown",
  (e) => {
    ipcRenderer.sendToHost("mousedown", { button: e.button });
  },
  true
);
window.addEventListener(
  "click",
  (e) => {
    ipcRenderer.sendToHost("click", { button: e.button });
  },
  true
);
window.addEventListener(
  "auxclick",
  (e) => {
    ipcRenderer.sendToHost("auxclick", { button: e.button });
  },
  true
);
window.addEventListener(
  "mousemove",
  (e) => {
    ipcRenderer.sendToHost("mousemove", { x: e.x, y: e.y });
  },
  true
);

window.addEventListener("load", (event) => {
  document.oncontextmenu = (e) => {
    ipcRenderer.sendToHost("contextmenu", { event: JSON.stringify(e) });
  };
});
