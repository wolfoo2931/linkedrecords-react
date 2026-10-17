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

// src/queryKey.ts
function getQueryKey(query) {
  return JSON.stringify(query, (_, v) => typeof v === "function" ? `fn:${v.name}` : v);
}

// src/useRecords.ts
import { KeyValueRecord } from "@linkedrecords/browser";
function useKeyValueRecordsWithStatus(query) {
  const { lr } = useLinkedRecords();
  const [records, setRecords] = useState2([]);
  const [isLoading, setIsLoading] = useState2(true);
  const queryKey = getQueryKey(query);
  useEffect(() => {
    setIsLoading(true);
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
          _createdAt: r.createdAt,
          ...await r.getValue()
        })));
        if (cancelled) {
          return;
        }
        setRecords(values);
        setIsLoading(false);
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
              (v) => v._id === r.id ? { _id: r.id, _createdAt: r.createdAt, ...newValue } : v
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
  return { records, isLoading };
}
function useKeyValueRecords(query) {
  return useKeyValueRecordsWithStatus(query).records;
}
var useKeyValueAttributes = useKeyValueRecords;

// src/useFacts.ts
import { useCallback, useEffect as useEffect2, useState as useState3 } from "react";
function useFacts(query) {
  const { lr } = useLinkedRecords();
  const [facts, setFacts] = useState3([]);
  const [reloadCount, setReloadCount] = useState3(0);
  const queryKey = getQueryKey(query);
  useEffect2(() => {
    let cancelled = false;
    lr.Fact.findAll(query).then((result) => {
      if (!cancelled) {
        setFacts(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lr, queryKey, reloadCount]);
  const reload = useCallback(() => setReloadCount((c) => c + 1), []);
  return { facts, reload };
}

// src/useUserInfo.ts
import { useEffect as useEffect3, useState as useState4 } from "react";
function useUserInfo() {
  const { lr } = useLinkedRecords();
  const [userInfo, setUserInfo] = useState4(null);
  useEffect3(() => {
    lr.getCurrentUserEmail().then((email) => setUserInfo({ email })).catch(() => setUserInfo(null));
  }, [lr]);
  return userInfo;
}

// src/useActorId.ts
import { useEffect as useEffect4, useState as useState5 } from "react";
function useActorId() {
  const { lr } = useLinkedRecords();
  const [actorId, setActorId] = useState5(lr.actorId);
  useEffect4(() => {
    let cancelled = false;
    lr.ensureUserIdIsKnown().then((id) => {
      if (!cancelled) {
        setActorId(id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lr]);
  return actorId;
}
export {
  LinkedRecordsContext,
  LinkedRecordsProvider,
  useActorId,
  useFacts,
  useKeyValueAttributes,
  useKeyValueRecords,
  useKeyValueRecordsWithStatus,
  useLinkedRecords,
  useUserInfo
};
