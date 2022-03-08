
export interface IUserData {
  version: number;
  tabs: IBrowserTab[];
}
export interface IBrowserTab {
  id: string;
  name: string;
  instances: IBrowserInstance[];
}
export interface IBrowserInstance {
  id: string;
  url: string;
}
