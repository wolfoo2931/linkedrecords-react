// src/linkedRecordsContext.ts
import { createContext } from "react";
var LinkedRecordsContext = createContext(void 0);

// src/LinkedRecordsProvider.tsx
import { useState } from "react";
import LinkedRecords from "@linkedrecords/browser";
import { jsx } from "react/jsx-runtime";
function createClient(serverUrl, config) {
  const lr = new LinkedRecords(
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
  const [lr] = useState(() => config ? createClient(serverUrl, config) : LinkedRecords.getPublicClient(serverUrl));
  return /* @__PURE__ */ jsx(LinkedRecordsContext.Provider, { value: { lr }, children });
}

// src/useRecords.ts
import { useEffect, useState as useState2 } from "react";

// src/useLinkedRecords.ts
import { useContext } from "react";
function useLinkedRecords() {
  const context = useContext(LinkedRecordsContext);
  if (!context) {
    throw new Error("useLinkedRecords must be used within a LinkedRecordsProvider");
  }
  return context;
}

// src/useRecords.ts
import { KeyValueRecord } from "@linkedrecords/browser";
function getQueryKey(query) {
  return JSON.stringify(query, (_, v) => typeof v === "function" ? `fn:${v.name}` : v);
}
function useKeyValueRecords(query) {
  const { lr } = useLinkedRecords();
  const [records, setRecords] = useState2([]);
  const queryKey = getQueryKey(query);
  useEffect(() => {
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
          ["$it", "$hasDataType", KeyValueRecord],
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
import { useEffect as useEffect2, useState as useState3 } from "react";
function useUserInfo() {
  const { lr } = useLinkedRecords();
  const [userInfo, setUserInfo] = useState3(null);
  useEffect2(() => {
    lr.getCurrentUserEmail().then((email) => setUserInfo({ email })).catch(() => setUserInfo(null));
  }, [lr]);
  return userInfo;
}
export {
  LinkedRecordsContext,
  LinkedRecordsProvider,
  useKeyValueAttributes,
  useKeyValueRecords,
  useLinkedRecords,
  useUserInfo
};
