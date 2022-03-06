import { UserData } from 'main/UserData';
import React from 'react';
import WebTab from 'renderer/components/web-tab/WebTab';
import './TabsContainer.css';
const electron = window.require('electron');

interface ITabsContainerProps {}
interface ITabsContainerState {
  userData: UserData | undefined;
}

export default class TabsContainer extends React.Component<
  ITabsContainerProps,
  ITabsContainerState
> {
  public constructor(props: ITabsContainerProps) {
    super(props);
    this.refreshUserData();
  }
  private refreshUserData() {
    electron.ipcRenderer.send('pasco/getUser');
    electron.ipcRenderer.on('pasco/userData', (event, data) => {
      this.setState(() => {
        return {
          userData: data,
        };
      });
    });
  }
  private renderWindows() {
    let output = [];

    if (this.state?.userData != undefined) {
      for (let url of this.state.userData.urls) {
        output.push(<WebTab url={url} />);
      }
    }

    return output;
  }
  render() {
    return (
      <div className="browser-views-container ">{this.renderWindows()}</div>
    );
  }
}
