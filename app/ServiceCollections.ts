import { App } from "electron";
import { RavenLogin } from "./services/raven-login/raven-login";
import { SQLDataAccess } from "./services/sql-data-access/sql-data-access";
import StaticDataAccess from "./services/static-data-access/static-data-access";
import { UserDataAccess } from "./services/user-data-access/user-data-access";

export class ServiceCollection {
  public static RAVEN: RavenLogin;
  public static USER_SERVICE: UserDataAccess;
  public static STATIC_DATA: StaticDataAccess;
  public static DB: SQLDataAccess;

  public constructor(private app: App, private isDev: boolean) {
    ServiceCollection.RAVEN = new RavenLogin(app, isDev);
    ServiceCollection.USER_SERVICE = new UserDataAccess();
    ServiceCollection.STATIC_DATA = new StaticDataAccess();
    ServiceCollection.DB = new SQLDataAccess();
  }
}
