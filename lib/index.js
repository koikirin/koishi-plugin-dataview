"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const koishi_1 = require("koishi");
const plugin_console_1 = require("@koishijs/plugin-console");
const path_1 = require("path");
const utils_1 = require("./utils");
__exportStar(require("./utils"), exports);
class DatabaseProvider extends plugin_console_1.DataService {
    addListener(name, refresh = false) {
        this.ctx.console.addListener(`database/${name}`, async (...args) => {
            const result = await this.ctx.database[name](...args.map(utils_1.deserialize));
            if (refresh)
                this.refresh();
            return result === undefined ? result : (0, utils_1.serialize)(result);
        }, { authority: 4 });
    }
    constructor(ctx) {
        super(ctx, 'database', { authority: 4 });
        ctx.console.addEntry(process.env.KOISHI_BASE ? [
            process.env.KOISHI_BASE + '/dist/index.js',
            process.env.KOISHI_BASE + '/dist/style.css',
        ] : process.env.KOISHI_ENV === 'browser' ? [
            // @ts-ignore
            import.meta.url.replace(/\/src\/[^/]+$/, '/client/index.ts'),
        ] : {
            dev: (0, path_1.resolve)(__dirname, '../client/index.ts'),
            prod: (0, path_1.resolve)(__dirname, '../dist'),
        });
        this.addListener('create', true);
        this.addListener('eval', true);
        this.addListener('get');
        this.addListener('remove', true);
        this.addListener('set');
        this.addListener('stats');
        this.addListener('upsert', true);
        ctx.on('model', () => this.refresh());
    }
    async getInfo() {
        const stats = await this.ctx.database.stats();
        const result = { tables: {}, ...stats };
        const tableStats = result.tables;
        result.tables = {};
        for (const name in this.ctx.model.tables) {
            result.tables[name] = {
                ...(0, koishi_1.clone)(this.ctx.model.tables[name]),
                ...tableStats[name],
            };
            result.tables[name].primary = (0, koishi_1.makeArray)(result.tables[name].primary);
            for (const [key, field] of Object.entries(result.tables[name].fields)) {
                if (field.deprecated)
                    delete result.tables[name].fields[key];
            }
        }
        result.tables = Object.fromEntries(Object.entries(result.tables).sort(([a], [b]) => a.localeCompare(b)));
        return result;
    }
    get(forced = false) {
        if (forced)
            delete this.task;
        return this.task || (this.task = this.getInfo());
    }
}
DatabaseProvider.filter = false;
DatabaseProvider.using = ['console', 'database'];
(function (DatabaseProvider) {
    DatabaseProvider.Config = koishi_1.Schema.object({});
})(DatabaseProvider || (DatabaseProvider = {}));
exports.default = DatabaseProvider;
