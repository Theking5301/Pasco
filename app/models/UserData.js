"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserInstance = exports.BrowserTab = exports.BrowserState = exports.UserData = void 0;
var uuid_1 = require("uuid");
var UserData = /** @class */ (function () {
    function UserData(json) {
        if (json) {
            this.version = json.version;
            this.ravenId = json.ravenId;
            this.browsers = [];
            for (var _i = 0, _a = json.browsers; _i < _a.length; _i++) {
                var t = _a[_i];
                this.browsers.push(new BrowserState(t));
            }
        }
    }
    UserData.prototype.getBrowser = function (id) {
        for (var _i = 0, _a = this.browsers; _i < _a.length; _i++) {
            var browser = _a[_i];
            if (browser.getId() === id) {
                return browser;
            }
        }
        return undefined;
    };
    return UserData;
}());
exports.UserData = UserData;
var BrowserState = /** @class */ (function () {
    function BrowserState(json) {
        if (json) {
            this.id = json.id;
            this.tabs = [];
            for (var _i = 0, _a = json.tabs; _i < _a.length; _i++) {
                var t = _a[_i];
                this.tabs.push(new BrowserTab(t));
            }
        }
    }
    BrowserState.prototype.getId = function () {
        return this.id;
    };
    BrowserState.prototype.getTab = function (id) {
        for (var _i = 0, _a = this.tabs; _i < _a.length; _i++) {
            var tab = _a[_i];
            if (tab.getId() === id) {
                return tab;
            }
        }
        return undefined;
    };
    BrowserState.prototype.getTabs = function () {
        return this.tabs;
    };
    BrowserState.prototype.addTab = function (name, url) {
        var tab = new BrowserTab({
            name: name,
            id: (0, uuid_1.v4)(),
            instances: [
                new BrowserInstance({ id: (0, uuid_1.v4)(), url: url ? url : 'https://www.google.com' })
            ]
        });
        this.tabs.push(tab);
        return tab;
    };
    BrowserState.prototype.removeTab = function (tabId) {
        var index = this.getTabIndex(tabId);
        if (index >= 0) {
            this.tabs.splice(index, 1);
        }
    };
    BrowserState.prototype.getTabIndex = function (tabId) {
        var index = -1;
        for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].getId() === tabId) {
                index = i;
                break;
            }
        }
        return index;
    };
    return BrowserState;
}());
exports.BrowserState = BrowserState;
var BrowserTab = /** @class */ (function () {
    function BrowserTab(json) {
        if (json) {
            this.id = json.id;
            this.instances = [];
            for (var _i = 0, _a = json.instances; _i < _a.length; _i++) {
                var t = _a[_i];
                this.instances.push(new BrowserInstance(t));
            }
        }
    }
    BrowserTab.prototype.getId = function () {
        return this.id;
    };
    BrowserTab.prototype.getInstance = function (id) {
        for (var _i = 0, _a = this.instances; _i < _a.length; _i++) {
            var instance = _a[_i];
            if (instance.getId() === id) {
                return instance;
            }
        }
        return undefined;
    };
    BrowserTab.prototype.getInstances = function () {
        return this.instances;
    };
    BrowserTab.prototype.addInstance = function (url) {
        return this.addInstanceAfterIndex(this.instances.length - 1, url);
    };
    BrowserTab.prototype.addInstanceAfterIndex = function (index, url) {
        var inst = new BrowserInstance({
            id: (0, uuid_1.v4)(),
            url: url
        });
        this.instances.splice(index, 0, inst);
        return inst;
    };
    BrowserTab.prototype.removeInstance = function (instanceId) {
        var index = this.getInstanceIndex(instanceId);
        if (index >= 0) {
            this.instances.splice(index, 1);
        }
    };
    BrowserTab.prototype.getInstanceIndex = function (instanceId) {
        var index = -1;
        for (var i = 0; i < this.instances.length; i++) {
            if (this.instances[i].getId() === instanceId) {
                index = i;
                break;
            }
        }
        return index;
    };
    return BrowserTab;
}());
exports.BrowserTab = BrowserTab;
var BrowserInstance = /** @class */ (function () {
    function BrowserInstance(json) {
        if (json) {
            this.id = json.id;
            this.url = json.url;
            this.title = json.title;
            this.icon = json.icon;
        }
    }
    BrowserInstance.prototype.getId = function () {
        return this.id;
    };
    BrowserInstance.prototype.getUrl = function () {
        return this.url;
    };
    BrowserInstance.prototype.setUrl = function (url) {
        this.url = url;
    };
    BrowserInstance.prototype.getTitle = function () {
        return this.title;
    };
    BrowserInstance.prototype.setTitle = function (title) {
        this.title = title;
    };
    BrowserInstance.prototype.getIcon = function () {
        return this.icon;
    };
    BrowserInstance.prototype.setIcon = function (icon) {
        this.icon = icon;
    };
    return BrowserInstance;
}());
exports.BrowserInstance = BrowserInstance;
//# sourceMappingURL=UserData.js.map