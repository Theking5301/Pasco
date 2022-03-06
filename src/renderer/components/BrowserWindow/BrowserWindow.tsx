/* eslint-disable react/prefer-stateless-function */
import React, { Ref } from 'react';
import styles from './BrowserWindow.module.css';

export interface IBrowserWindowProps {
  url: string;
}
export interface IBrowserWindowState {
  url: string;
}
export default class BrowserWindow extends React.Component<
  IBrowserWindowProps,
  IBrowserWindowState
> {
  private reference: Ref<webview>;
  public constructor(props: IBrowserWindowProps) {
    super(props);
    this.state = {
      url: props.url,
    };
    this.reference = React.createRef();
  }
  componentDidMount?(): void {
    this.styleWebviewScrollbar(this.reference.current);
  }
  private urlChange(event) {}
  private urlSubmit(event) {}
  private styleWebviewScrollbar(webview: webview) {
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
      <div className={styles.tab_container}>
        <div className={styles.url_bar_container}>
          <input
            type="text"
            className={styles.url_bar}
            value={this.state.url}
            onChange={this.urlChange.bind(this)}
            onSubmit={this.urlSubmit.bind(this)}
          />
        </div>
        <webview
          ref={this.reference}
          src={this.state.url}
          style={{ height: '100%', width: '100%' }}
          className={styles.web_view}
        />
      </div>
    );
  }
}
