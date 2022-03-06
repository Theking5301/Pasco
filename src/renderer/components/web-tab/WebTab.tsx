/* eslint-disable react/prefer-stateless-function */
import React, { Ref } from 'react';
import './WebTab.css';
const electron = window.require('electron');

export interface IWebTabProps {
  url: string;
}
export interface IWebTabState {
  url: string;
}
export default class WebTab extends React.Component<
  IWebTabProps,
  IWebTabState
> {
  private reference: Ref<webview>;
  public constructor(props: IWebTabProps) {
    super(props);
    this.state = {
      url: props.url,
    };
    this.reference = React.createRef();
    window.addEventListener('mouseup', (e) => {
      console.log(e);
    });
  }
  componentDidMount?(): void {
    this.styleWebviewScrollbar(this.reference.current);
  }
  private urlChange() {}
  private urlSubmit() {}
  private styleWebviewScrollbar(webview: any) {
    webview.addEventListener('dom-ready', () => {
      webview.insertCSS(`
        body {
          overflow:hidden;
        }
        :hover {
          overflow: auto;
        }
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background-color: transparent;
        }
        ::-webkit-scrollbar-track-piece {
          background-color: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(32, 40, 48, 0.95);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-corner {
          background-color: transparent;
        }
        `);
    });
  }
  render() {
    return (
      <div className="tab_container">
        <div className="url_bar_container">
          <button className="url_bar_button"></button>
          <button className="url_bar_button"></button>
          <input
            type="text"
            className="url_bar"
            value={this.state.url}
            onChange={this.urlChange.bind(this)}
            onSubmit={this.urlSubmit.bind(this)}
          />
          <button className="url_bar_button"></button>
        </div>
        <webview
          ref={this.reference}
          src={this.state.url}
          style={{ height: '100%', width: '100%' }}
          className="web_view"
        />
      </div>
    );
  }
}
