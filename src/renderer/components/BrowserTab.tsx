import React from 'react';

export default function BrowserTab() {
  return (
    <div className="tab_container">
      <div className="url_bar_container">
        <input type="text" className="url_bar" />
      </div>
      <iframe
        title="content"
        src="https://www.marketwatch.com/"
        width="100%"
        height="100%"
      />
    </div>
  );
}
