const { container } = require('webpack');

const createWebView = (parentId) => {
  webView = document.createElement('webview');
  webView.setAttribute('src', url);
  container = document.getElementById(parentId);
  container.appendChild(webView);
};
