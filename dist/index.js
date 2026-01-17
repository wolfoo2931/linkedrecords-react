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
  useLinkedRecords: () => useLinkedRecords
});
module.exports = __toCommonJS(index_exports);

// src/linkedRecordsContext.ts
var import_react = require("react");
var LinkedRecordsContext = (0, import_react.createContext)(void 0);

// src/LinkedRecordsProvider.tsx
var import_react2 = require("react");
var import_browser_sdk = __toESM(require("linkedrecords/browser_sdk"));
var import_jsx_runtime = require("react/jsx-runtime");
function LinkedRecordsProvider({ children, serverUrl }) {
  const lr = import_browser_sdk.default.getPublicClient(serverUrl);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkedRecordsContext.Provider, { value: { lr }, children });
}

// src/useAttributes.ts
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

// src/useAttributes.ts
var import_browser_sdk2 = require("linkedrecords/browser_sdk");
function useKeyValueAttributes(query) {
  const { lr } = useLinkedRecords();
  const [attributes, setAttributes] = (0, import_react4.useState)([]);
  (0, import_react4.useEffect)(() => {
    const unsubscribeFnPromise = new Promise((resolve) => {
      const checkActorId = () => {
        if (lr.actorId !== void 0) {
          resolve();
        } else {
          setTimeout(checkActorId, 50);
        }
      };
      checkActorId();
    }).then(() => {
      return lr.Attribute.subscribeToQuery({
        attributes: [
          ["$it", "$hasDataType", import_browser_sdk2.KeyValueAttribute],
          ...query
        ]
      }, async ({ attributes: attributes2 }) => {
        const values = await Promise.all(attributes2.map(async (a) => ({
          _id: a.id,
          ...await a.getValue()
        })));
        attributes2.forEach((a) => {
          a.subscribe(async () => {
            const newValues = await Promise.all(values.map(async (v) => {
              if (v._id === a.id) {
                return {
                  _id: a.id,
                  ...await a.getValue()
                };
              }
              return v;
            }));
            setAttributes(newValues);
          });
          setAttributes(values);
        });
      });
    });
    return () => {
      unsubscribeFnPromise.then((fn) => fn());
    };
  }, [lr.Attribute, setAttributes]);
  return attributes;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LinkedRecordsContext,
  LinkedRecordsProvider,
  useKeyValueAttributes,
  useLinkedRecords
});
