import React from 'react';
import './Titlebar.css';
const electron = window.require('electron');

export interface ITitlebarProps {}
export interface ITitlebarState {}
export default class Titlebar extends React.Component<
  ITitlebarProps,
  ITitlebarState
> {
  public constructor(props: ITitlebarProps) {
    super(props);
  }
  private close() {
    electron.ipcRenderer.send('pasco/close');
  }
  private minimize() {
    electron.ipcRenderer.send('pasco/minimize');
  }
  private maximizeRestore() {
    electron.ipcRenderer.send('pasco/maximize');
  }
  private onDoubleClick() {
    electron.ipcRenderer.send('pasco/maximize');
  }
  render() {
    return (
      <header id="titlebar" className="titlebar">
        <div className="window_control_row">
          <div
            className="window_spacer"
            onDoubleClick={() => console.log('WTF')}
          ></div>
          <div className="window_control_button_wrapper">
            <button
              className="window_control_button"
              onClick={this.minimize.bind(this)}
            >
              <img
                className="window_control_icon"
                src={require('../../../images/icons/minimize.png')}
                alt="Logo"
              />
            </button>
            <button
              className="window_control_button"
              onClick={this.maximizeRestore.bind(this)}
            >
              <img
                className="window_control_icon"
                src={require('../../../images/icons/maximize.png')}
                alt="Logo"
              />
            </button>
            <button
              className="window_control_button window_control_button_close"
              onClick={this.close.bind(this)}
            >
              <img
                className="window_control_icon"
                src={require('../../../images/icons/close.png')}
                alt="Logo"
              />
            </button>
          </div>
        </div>
      </header>
    );
  }
}
