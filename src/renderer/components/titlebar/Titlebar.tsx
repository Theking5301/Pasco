import React from 'react';
import styles from './Titlebar.module.css';

export interface ITitlebarProps {}
export interface ITitlebarState {}
export default class Titlebar extends React.Component<
  ITitlebarProps,
  ITitlebarState
> {
  public constructor(props: ITitlebarProps) {
    super(props);
  }

  render() {
    return (
      <header className={styles.titlebar}>
        <div className={styles.window_control_button_container}>
          <button></button>
          <button></button>
          <button></button>
        </div>
      </header>
    );
  }
}
