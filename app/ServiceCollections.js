"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCollection = void 0;
var raven_login_1 = require("./services/raven-login/raven-login");
var sql_data_access_1 = require("./services/sql-data-access/sql-data-access");
var static_data_access_1 = require("./services/static-data-access/static-data-access");
var user_data_access_1 = require("./services/user-data-access/user-data-access");
var ServiceCollection = /** @class */ (function () {
    function ServiceCollection(app, isDev) {
        this.app = app;
        this.isDev = isDev;
        ServiceCollection.RAVEN = new raven_login_1.RavenLogin(app, isDev);
        ServiceCollection.USER_SERVICE = new user_data_access_1.UserDataAccess();
        ServiceCollection.STATIC_DATA = new static_data_access_1.default();
        ServiceCollection.DB = new sql_data_access_1.SQLDataAccess();
    }
    return ServiceCollection;
}());
exports.ServiceCollection = ServiceCollection;
//# sourceMappingURL=ServiceCollections.js.map