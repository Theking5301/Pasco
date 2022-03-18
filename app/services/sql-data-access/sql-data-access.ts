import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as sql from 'sqlite3';
import { APP_DIRECTORY } from '../../main';
import { BaseService } from '../BaseService';

export class SQLDataAccess extends BaseService {
  private database: sql.Database;

  public constructor() {
    super();
    this.database = new sql.Database(app.getPath('userData').concat('\\database.db'));

    // Initialize database.
    const sqlFiles = fs.readdirSync(`${APP_DIRECTORY}/sql`);
    for (const fileName of sqlFiles) {
      const command = fs.readFileSync(`${APP_DIRECTORY}/sql/${fileName}`, 'utf8');
      this.database.run(command);
    }

    ipcMain.on('sparrow/sql', async (event, params) => {
      try {
        const result = await this.query(params[0], params.length > 1 ? params[1] : undefined);
        event.sender.send('sparrow/sql', result);
      } catch (error) {
        event.sender.send('sparrow/sql', error);
      }
    });
  }
  public initialize(): Promise<void> {
    return Promise.resolve();
  }
  public query(query: string, params: any): Promise<any> {
    return new Promise<any>((resolve) => {
      this.database.get(query, params, (error, result) => {
        if (error) {
          throw error;
        } else {
          resolve(result);
        }
      });
    });
  }
}
