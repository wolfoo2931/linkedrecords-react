// src/linkedRecordsContext.ts
import { createContext } from "react";
var LinkedRecordsContext = createContext(void 0);

// src/LinkedRecordsProvider.tsx
import "react";
import LinkedRecords from "@linkedrecords/browser";
import { jsx } from "react/jsx-runtime";
function LinkedRecordsProvider({ children, serverUrl }) {
  const lr = LinkedRecords.getPublicClient(serverUrl);
  return /* @__PURE__ */ jsx(LinkedRecordsContext.Provider, { value: { lr }, children });
}

// src/useRecords.ts
import { useEffect, useState } from "react";

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
function useKeyValueRecords(query) {
  const { lr } = useLinkedRecords();
  const [records, setRecords] = useState([]);
  useEffect(() => {
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
        setRecords(values);
        records2.forEach((r) => {
          r.subscribe(async () => {
            const newValue = await r.getValue();
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
      unsubscribeFnPromise.then((fn) => fn());
    };
  }, [lr.Record, setRecords]);
  return records;
}
var useKeyValueAttributes = useKeyValueRecords;

// src/useUserInfo.ts
import { useEffect as useEffect2, useState as useState2 } from "react";
function useUserInfo() {
  const { lr } = useLinkedRecords();
  const [userInfo, setUserInfo] = useState2(null);
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
