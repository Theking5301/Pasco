"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataAccess = void 0;
var axios = require("axios");
var electron_1 = require("electron");
var uuid_1 = require("uuid");
var UserData_1 = require("../../models/UserData");
var ServiceCollections_1 = require("./../../ServiceCollections");
var UserDataAccess = /** @class */ (function () {
    function UserDataAccess() {
        var _this = this;
        electron_1.ipcMain.on('sparrow/user-data/update', function (event, data) { return __awaiter(_this, void 0, void 0, function () {
            var userData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userData = new UserData_1.UserData(data);
                        return [4 /*yield*/, this.upsertUserData(userData)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.syncDataToCloud(userData)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        electron_1.ipcMain.on('sparrow/user-data', function (event) { return __awaiter(_this, void 0, void 0, function () {
            var cloudProfile, localProfile, _a, _b, output;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cloudProfile = undefined;
                        localProfile = undefined;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.syncProfileFromCloud()];
                    case 2:
                        cloudProfile = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _c.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.getUserDataFromDatabase()];
                    case 5:
                        localProfile = _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _c.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        output = undefined;
                        if (!(cloudProfile && localProfile)) return [3 /*break*/, 8];
                        if (cloudProfile.lastModified > localProfile.lastModified) {
                            output = cloudProfile;
                            console.log('Loaded profile from the cloud.');
                        }
                        else {
                            output = localProfile;
                            console.log('Loaded profile from local copy.');
                        }
                        return [3 /*break*/, 12];
                    case 8:
                        if (!cloudProfile) return [3 /*break*/, 9];
                        output = cloudProfile;
                        console.log('Loaded profile from the cloud.');
                        return [3 /*break*/, 12];
                    case 9:
                        if (!localProfile) return [3 /*break*/, 10];
                        output = localProfile;
                        console.log('Loaded profile from local copy.');
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, this.createDefaultUserData()];
                    case 11:
                        output = _c.sent();
                        console.log('Initializing first time profile.');
                        _c.label = 12;
                    case 12:
                        event.sender.send('sparrow/user-data', output);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    UserDataAccess.prototype.syncProfileFromCloud = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokens, response, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ServiceCollections_1.ServiceCollection.RAVEN.shouldPerformCloudOperations()];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, ServiceCollections_1.ServiceCollection.RAVEN.getValidAccessToken(true)];
                    case 2:
                        tokens = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, axios.default.post('http://localhost:8090/api/v1', {
                                query: "query {\n          profile(ravenId: \"".concat(tokens.decodedToken.ravenId, "\") {\n            ravenId\n            version\n            browsers {\n              id\n              tabs {\n                id\n                instances {\n                  url\n                  id\n                  title\n                  icon\n                }\n              }\n            }\n          }\n        } ")
                            }, {
                                headers: {
                                    authorization: "Bearer ".concat(tokens.accessToken)
                                }
                            })];
                    case 4:
                        response = _a.sent();
                        if (response.data.data.profile) {
                            console.log("Synced User Data from the cloud: ".concat(response.data.data.profile));
                            return [2 /*return*/, new UserData_1.UserData(response.data.data.profile)];
                        }
                        else {
                            return [2 /*return*/, undefined];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        throw new Error("\"An error occurred when syncing profile data from the cloud. Error: ".concat(err_1));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UserDataAccess.prototype.syncDataToCloud = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ServiceCollections_1.ServiceCollection.RAVEN.shouldPerformCloudOperations()];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, ServiceCollections_1.ServiceCollection.RAVEN.getValidAccessToken(true)];
                    case 2:
                        tokens = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, axios.default.post('http://localhost:8090/api/v1', {
                                query: "mutation($profile: SparrowProfileInput!){\n            updateProfile(profile: $profile) {\n              ravenId\n              version\n              browsers {\n                id\n                tabs {\n                  id\n                  instances {\n                    id\n                    url\n                    title\n                    icon\n                  }\n                }\n              }\n            }\n          }",
                                variables: {
                                    profile: data
                                }
                            }, {
                                headers: {
                                    authorization: "Bearer ".concat(tokens.accessToken)
                                }
                            })];
                    case 4:
                        _a.sent();
                        console.log("Synced User Data to the cloud: ".concat(data));
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _a.sent();
                        throw new Error("\"An error occurred when syncing profile data to the cloud. Error: ".concat(err_2));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UserDataAccess.prototype.upsertUserData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ServiceCollections_1.ServiceCollection.DB.query("INSERT OR REPLACE INTO tbl_UserData (RavenId, UserData) VALUES ($RavenId, $UserData)", {
                            $RavenId: data.ravenId,
                            $UserData: JSON.stringify(data)
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserDataAccess.prototype.getUserDataFromDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ServiceCollections_1.ServiceCollection.RAVEN.getRavenTokens()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, ServiceCollections_1.ServiceCollection.DB.query('SELECT UserData from tbl_UserData where RavenId=$RavenId', { $RavenId: user.decodedToken.ravenId })];
                    case 2:
                        data = _a.sent();
                        if (data) {
                            console.log("Read profile: ".concat(JSON.stringify(data), " from the database."));
                            return [2 /*return*/, new UserData_1.UserData(JSON.parse(data.userData))];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, undefined];
                }
            });
        });
    };
    UserDataAccess.prototype.createDefaultUserData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var tokens, ravenId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ServiceCollections_1.ServiceCollection.RAVEN.getRavenTokens()];
                    case 1:
                        tokens = _b.sent();
                        ravenId = ((_a = tokens === null || tokens === void 0 ? void 0 : tokens.decodedToken) === null || _a === void 0 ? void 0 : _a.ravenId) ? tokens.decodedToken.ravenId : 'LOCAL';
                        return [2 /*return*/, new UserData_1.UserData({
                                version: '1',
                                ravenId: ravenId,
                                browsers: [
                                    {
                                        id: (0, uuid_1.v4)(),
                                        tabs: [
                                            new UserData_1.BrowserTab({
                                                name: 'DefaultTab',
                                                id: (0, uuid_1.v4)(),
                                                instances: [
                                                    new UserData_1.BrowserInstance({
                                                        id: (0, uuid_1.v4)(),
                                                        url: 'https://www.google.com'
                                                    })
                                                ]
                                            })
                                        ]
                                    }
                                ]
                            })];
                }
            });
        });
    };
    return UserDataAccess;
}());
exports.UserDataAccess = UserDataAccess;
//# sourceMappingURL=user-data-access.js.map