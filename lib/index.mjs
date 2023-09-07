var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// external/webui/plugins/dataview/src/index.ts
import { clone, makeArray, Schema } from "koishi";
import { DataService } from "@koishijs/plugin-console";
import { resolve } from "path";

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
var DatabaseProvider = class extends DataService {
  static {
    __name(this, "DatabaseProvider");
  }
  static filter = false;
  static using = ["console", "database"];
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
      import.meta.url.replace(/\/src\/[^/]+$/, "/client/index.ts")
    ] : {
      dev: resolve(__dirname, "../client/index.ts"),
      prod: resolve(__dirname, "../dist")
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
        ...clone(this.ctx.model.tables[name]),
        ...tableStats[name]
      };
      result.tables[name].primary = makeArray(result.tables[name].primary);
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
    return this.task ||= this.getInfo();
  }
};
((DatabaseProvider2) => {
  DatabaseProvider2.Config = Schema.object({});
})(DatabaseProvider || (DatabaseProvider = {}));
var src_default = DatabaseProvider;
export {
  src_default as default,
  deserialize,
  serialize
};
//# sourceMappingURL=index.mjs.map
