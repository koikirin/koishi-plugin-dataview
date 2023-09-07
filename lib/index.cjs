var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// external/webui/plugins/dataview/src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default,
  deserialize: () => deserialize,
  serialize: () => serialize
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var import_plugin_console = require("@koishijs/plugin-console");
var import_path = require("path");

// external/webui/plugins/dataview/src/utils.ts
function serialize(obj) {
  if (obj instanceof Date)
    return `"d${obj.toJSON()}"`;
  return JSON.stringify(obj, (_, value) => {
    if (typeof value === "string")
      return "s" + value;
    if (typeof value === "object") {
      if (value instanceof Date)
        return "d" + new Date(value).toJSON();
      if (value === null)
        return null;
      const o = Array.isArray(value) ? [] : {};
      for (const k in value) {
        if (value[k] instanceof Date) {
          o[k] = new Date(value[k]);
          o[k].toJSON = void 0;
        } else {
          o[k] = value[k];
        }
      }
      return o;
    }
    return value;
  });
}
__name(serialize, "serialize");
function deserialize(str) {
  if (str === void 0)
    return void 0;
  return JSON.parse(
    str,
    (_, v) => typeof v === "string" ? v[0] === "s" ? v.slice(1) : new Date(v.slice(1)) : v
  );
}
__name(deserialize, "deserialize");

// external/webui/plugins/dataview/src/index.ts
var import_meta = {};
var _DatabaseProvider = class _DatabaseProvider extends import_plugin_console.DataService {
  task;
  addListener(name, refresh = false) {
    this.ctx.console.addListener(`database/${name}`, async (...args) => {
      const result = await this.ctx.database[name](...args.map(deserialize));
      if (refresh)
        this.refresh();
      return result === void 0 ? result : serialize(result);
    }, { authority: 4 });
  }
  constructor(ctx) {
    super(ctx, "database", { authority: 4 });
    ctx.console.addEntry(process.env.KOISHI_BASE ? [
      process.env.KOISHI_BASE + "/dist/index.js",
      process.env.KOISHI_BASE + "/dist/style.css"
    ] : process.env.KOISHI_ENV === "browser" ? [
      // @ts-ignore
      import_meta.url.replace(/\/src\/[^/]+$/, "/client/index.ts")
    ] : {
      dev: (0, import_path.resolve)(__dirname, "../client/index.ts"),
      prod: (0, import_path.resolve)(__dirname, "../dist")
    });
    this.addListener("create", true);
    this.addListener("eval", true);
    this.addListener("get");
    this.addListener("remove", true);
    this.addListener("set");
    this.addListener("stats");
    this.addListener("upsert", true);
    ctx.on("model", () => this.refresh());
  }
  async getInfo() {
    const stats = await this.ctx.database.stats();
    const result = { tables: {}, ...stats };
    const tableStats = result.tables;
    result.tables = {};
    for (const name in this.ctx.model.tables) {
      result.tables[name] = {
        ...(0, import_koishi.clone)(this.ctx.model.tables[name]),
        ...tableStats[name]
      };
      result.tables[name].primary = (0, import_koishi.makeArray)(result.tables[name].primary);
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
};
__name(_DatabaseProvider, "DatabaseProvider");
__publicField(_DatabaseProvider, "filter", false);
__publicField(_DatabaseProvider, "using", ["console", "database"]);
var DatabaseProvider = _DatabaseProvider;
((DatabaseProvider2) => {
  DatabaseProvider2.Config = import_koishi.Schema.object({});
})(DatabaseProvider || (DatabaseProvider = {}));
var src_default = DatabaseProvider;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deserialize,
  serialize
});
//# sourceMappingURL=index.cjs.map
