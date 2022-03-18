"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLDataAccess = void 0;
const electron_1 = require("electron");
const fs = require("fs");
const sql = require("sqlite3");
const main_1 = require("../../main");
const BaseService_1 = require("../BaseService");
class SQLDataAccess extends BaseService_1.BaseService {
    constructor() {
        super();
        this.database = new sql.Database(electron_1.app.getPath('userData').concat('\\database.db'));
        // Initialize database.
        const sqlFiles = fs.readdirSync(`${main_1.APP_DIRECTORY}/sql`);
        for (const fileName of sqlFiles) {
            const command = fs.readFileSync(`${main_1.APP_DIRECTORY}/sql/${fileName}`, 'utf8');
            this.database.run(command);
        }
        electron_1.ipcMain.on('sparrow/sql', async (event, params) => {
            try {
                const result = await this.query(params[0], params.length > 1 ? params[1] : undefined);
                event.sender.send('sparrow/sql', result);
            }
            catch (error) {
                event.sender.send('sparrow/sql', error);
            }
        });
    }
    initialize() {
        return Promise.resolve();
    }
    query(query, params) {
        return new Promise((resolve) => {
            this.database.get(query, params, (error, result) => {
                if (error) {
                    throw error;
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.SQLDataAccess = SQLDataAccess;
//# sourceMappingURL=sql-data-access.js.map