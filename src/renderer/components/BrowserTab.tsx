/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import CustomScroll from 'react-custom-scroll';

const WebView = require('react-electron-web-view');

export interface IBrowserTabProps {
  url: string;
}
export interface IBrowserTabState {
  url: string;
}
export default class BrowserTab extends React.Component<
  IBrowserTabProps,
  IBrowserTabState
> {
  public constructor(props: IBrowserTabProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      url: props.url,
    };
  }

  private handleSubmit(event) {}

  render() {
    return (
      <div className="tab_container">
        <div className="url_bar_container">
          <input
            type="text"
            className="url_bar"
            value={this.state.url}
            onSubmit={this.handleSubmit}
          />
        </div>

        <CustomScroll style={{ height: '100%' }} heightRelativeToParent="100%">
          <WebView
            src={this.state.url}
            style={{ height: '100%', width: '100%' }}
            className="web_view"
          />
        </CustomScroll>
      </div>
    );
  }
}
