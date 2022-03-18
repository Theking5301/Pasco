import { App } from "electron";
import { BaseService } from "./services/BaseService";
import { RavenLogin } from "./services/raven-login/raven-login";
import { SQLDataAccess } from "./services/sql-data-access/sql-data-access";
import StaticDataAccess from "./services/static-data-access/static-data-access";
import { UserDataAccess } from "./services/user-data-access/user-data-access";
import { WindowManagerService } from "./services/window-manager-service/window-manager-service";

export class ServiceCollection {
  public static RAVEN: RavenLogin;
  public static USER_SERVICE: UserDataAccess;
  public static STATIC_DATA: StaticDataAccess;
  public static DB: SQLDataAccess;
  public static WINDOW_MANAGER: WindowManagerService;
  private instances: BaseService[];

  public constructor(private app: App, private isDev: boolean) {
    this.instances = [];
    ServiceCollection.RAVEN = this.registerService(new RavenLogin(app, isDev));
    ServiceCollection.USER_SERVICE = this.registerService(new UserDataAccess());
    ServiceCollection.STATIC_DATA = this.registerService(new StaticDataAccess());
    ServiceCollection.DB = this.registerService(new SQLDataAccess());
    ServiceCollection.WINDOW_MANAGER = this.registerService(new WindowManagerService());
  }
  public async initialize(): Promise<void> {
    const promises = [];
    for (const init of this.instances) {
      promises.push(init.initialize());
    }
    await Promise.all(promises);
  }
  private registerService<T extends BaseService>(service: T): T {
    this.instances.push(service);
    return service;
  }
}
