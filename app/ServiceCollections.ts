import { App } from "electron";
import { RavenLogin } from "./services/raven-login";
import StaticDataAccess from "./services/static-data-access";
import { UserDataAccess } from "./services/user-data-access";

export class ServiceCollection {
  public static raven: RavenLogin;
  public static userService: UserDataAccess;
  public static staticData: StaticDataAccess;

  public constructor(private app: App, private isDev: boolean) {
    ServiceCollection.raven = new RavenLogin(app, isDev);
    ServiceCollection.userService = new UserDataAccess();
    ServiceCollection.staticData = new StaticDataAccess();
  }
}
