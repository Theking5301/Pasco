"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCollection = void 0;
const raven_login_1 = require("./services/raven-login/raven-login");
const sql_data_access_1 = require("./services/sql-data-access/sql-data-access");
const static_data_access_1 = require("./services/static-data-access/static-data-access");
const user_data_access_1 = require("./services/user-data-access/user-data-access");
const window_manager_service_1 = require("./services/window-manager-service/window-manager-service");
class ServiceCollection {
    constructor(app, isDev) {
        this.app = app;
        this.isDev = isDev;
        this.instances = [];
        ServiceCollection.RAVEN = this.registerService(new raven_login_1.RavenLogin(app, isDev));
        ServiceCollection.USER_SERVICE = this.registerService(new user_data_access_1.UserDataAccess());
        ServiceCollection.STATIC_DATA = this.registerService(new static_data_access_1.default());
        ServiceCollection.DB = this.registerService(new sql_data_access_1.SQLDataAccess());
        ServiceCollection.WINDOW_MANAGER = this.registerService(new window_manager_service_1.WindowManagerService());
    }
    async initialize() {
        const promises = [];
        for (const init of this.instances) {
            promises.push(init.initialize());
        }
        await Promise.all(promises);
    }
    registerService(service) {
        this.instances.push(service);
        return service;
    }
}
exports.ServiceCollection = ServiceCollection;
//# sourceMappingURL=ServiceCollections.js.map