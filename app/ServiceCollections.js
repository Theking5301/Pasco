"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCollection = void 0;
var raven_login_1 = require("./services/raven-login");
var static_data_access_1 = require("./services/static-data-access");
var user_data_access_1 = require("./services/user-data-access");
var ServiceCollection = /** @class */ (function () {
    function ServiceCollection(app, isDev) {
        this.app = app;
        this.isDev = isDev;
        ServiceCollection.raven = new raven_login_1.RavenLogin(app, isDev);
        ServiceCollection.userService = new user_data_access_1.UserDataAccess();
        ServiceCollection.staticData = new static_data_access_1.default();
    }
    return ServiceCollection;
}());
exports.ServiceCollection = ServiceCollection;
//# sourceMappingURL=ServiceCollections.js.map