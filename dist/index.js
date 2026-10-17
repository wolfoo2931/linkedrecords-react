"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  LinkedRecordsContext: () => LinkedRecordsContext,
  LinkedRecordsProvider: () => LinkedRecordsProvider,
  useKeyValueAttributes: () => useKeyValueAttributes,
  useKeyValueRecords: () => useKeyValueRecords,
  useLinkedRecords: () => useLinkedRecords,
  useUserInfo: () => useUserInfo
});
module.exports = __toCommonJS(index_exports);

// src/linkedRecordsContext.ts
var import_react = require("react");
var LinkedRecordsContext = (0, import_react.createContext)(void 0);

// src/LinkedRecordsProvider.tsx
var import_react2 = require("react");
var import_browser = __toESM(require("@linkedrecords/browser"));
var import_jsx_runtime = require("react/jsx-runtime");
function createClient(serverUrl, config) {
  const lr = new import_browser.default(
    new URL(serverUrl),
    config.oidcConfig,
    config.autoHandleRedirect,
    config.deferUserInfoFetching
  );
  if (config.loginHandler) lr.setLoginHandler(config.loginHandler);
  if (config.connectionLostHandler) lr.setConnectionLostHandler(config.connectionLostHandler);
  if (config.unknownServerErrorHandler) lr.setUnknownServerErrorHandler(config.unknownServerErrorHandler);
  if (config.quotaViolationErrorHandler) lr.setQuotaViolationErrorHandler(config.quotaViolationErrorHandler);
  if (config.authorizationErrorHandler) lr.setAuthorizationErrorHandler(config.authorizationErrorHandler);
  return lr;
}
function LinkedRecordsProvider({ children, serverUrl, config }) {
  const [lr] = (0, import_react2.useState)(() => config ? createClient(serverUrl, config) : import_browser.default.getPublicClient(serverUrl));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkedRecordsContext.Provider, { value: { lr }, children });
}

// src/useRecords.ts
var import_react4 = require("react");

// src/useLinkedRecords.ts
var import_react3 = require("react");
function useLinkedRecords() {
  const context = (0, import_react3.useContext)(LinkedRecordsContext);
  if (!context) {
    throw new Error("useLinkedRecords must be used within a LinkedRecordsProvider");
  }
  return context;
}

// src/useRecords.ts
var import_browser2 = require("@linkedrecords/browser");
function getQueryKey(query) {
  return JSON.stringify(query, (_, v) => typeof v === "function" ? `fn:${v.name}` : v);
}
function useKeyValueRecords(query) {
  const { lr } = useLinkedRecords();
  const [records, setRecords] = (0, import_react4.useState)([]);
  const queryKey = getQueryKey(query);
  (0, import_react4.useEffect)(() => {
    let cancelled = false;
    const subscribedRecordIds = /* @__PURE__ */ new Set();
    const unsubscribeFnPromise = new Promise((resolve) => {
      const checkActorId = () => {
        if (cancelled) {
          return;
        }
        if (lr.actorId !== void 0) {
          resolve();
        } else {
          setTimeout(checkActorId, 50);
        }
      };
      checkActorId();
    }).then(() => {
      const queryUnsubscribe = lr.Record.subscribeToQuery({
        records: [
          ["$it", "$hasDataType", import_browser2.KeyValueRecord],
          ...query
        ]
      }, async ({ records: records2 }) => {
        const values = await Promise.all(records2.map(async (r) => ({
          _id: r.id,
          ...await r.getValue()
        })));
        if (cancelled) {
          return;
        }
        setRecords(values);
        records2.forEach((r) => {
          if (subscribedRecordIds.has(r.id)) {
            return;
          }
          subscribedRecordIds.add(r.id);
          r.subscribe(async () => {
            if (cancelled) {
              return;
            }
            const newValue = await r.getValue();
            if (cancelled) {
              return;
            }
            setRecords((prev) => prev.map(
              (v) => v._id === r.id ? { _id: r.id, ...newValue } : v
            ));
          });
        });
      });
      return () => {
        queryUnsubscribe.then((unsubscribe) => unsubscribe());
      };
    });
    return () => {
      cancelled = true;
      unsubscribeFnPromise.then((fn) => fn());
    };
  }, [lr, queryKey]);
  return records;
}
var useKeyValueAttributes = useKeyValueRecords;

// src/useUserInfo.ts
var import_react5 = require("react");
function useUserInfo() {
  const { lr } = useLinkedRecords();
  const [userInfo, setUserInfo] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    lr.getCurrentUserEmail().then((email) => setUserInfo({ email })).catch(() => setUserInfo(null));
  }, [lr]);
  return userInfo;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LinkedRecordsContext,
  LinkedRecordsProvider,
  useKeyValueAttributes,
  useKeyValueRecords,
  useLinkedRecords,
  useUserInfo
});
