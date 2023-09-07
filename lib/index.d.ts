import { Context, Dict, Driver, Field, Model, Schema } from 'koishi';
import { DataService } from '@koishijs/plugin-console';
export * from './utils';
export type Methods = 'get' | 'set' | 'eval' | 'create' | 'remove' | 'upsert' | 'drop' | 'stats';
export type DbEvents = {
    [M in Methods as `database/${M}`]: (...args: string[]) => Promise<string>;
};
declare module '@koishijs/plugin-console' {
    namespace Console {
        interface Services {
            database: DatabaseProvider;
        }
    }
    interface Events extends DbEvents {
    }
}
export interface TableInfo extends Driver.TableStats, Model.Config<any> {
    fields: Field.Config;
    primary: string[];
}
export interface DatabaseInfo extends Driver.Stats {
    tables: Dict<TableInfo>;
}
declare class DatabaseProvider extends DataService<DatabaseInfo> {
    static filter: boolean;
    static using: string[];
    task: Promise<DatabaseInfo>;
    addListener<K extends Methods>(name: K, refresh?: boolean): void;
    constructor(ctx: Context);
    getInfo(): Promise<DatabaseInfo>;
    get(forced?: boolean): Promise<DatabaseInfo>;
}
declare namespace DatabaseProvider {
    interface Config {
    }
    const Config: Schema<Config>;
}
export default DatabaseProvider;
