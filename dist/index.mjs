// src/linkedRecordsContext.ts
import { createContext } from "react";
var LinkedRecordsContext = createContext(void 0);

// src/LinkedRecordsProvider.tsx
import "react";
import LinkedRecords from "linkedrecords/browser_sdk";
import { jsx } from "react/jsx-runtime";
function LinkedRecordsProvider({ children, serverUrl }) {
  const lr = LinkedRecords.getPublicClient(serverUrl);
  return /* @__PURE__ */ jsx(LinkedRecordsContext.Provider, { value: { lr }, children });
}

// src/useAttributes.ts
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

// src/useAttributes.ts
import { KeyValueAttribute } from "linkedrecords/browser_sdk";
function useKeyValueAttributes(query) {
  const { lr } = useLinkedRecords();
  const [attributes, setAttributes] = useState([]);
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
      const queryUnsubscribe = lr.Attribute.subscribeToQuery({
        attributes: [
          ["$it", "$hasDataType", KeyValueAttribute],
          ...query
        ]
      }, async ({ attributes: attributes2 }) => {
        const values = await Promise.all(attributes2.map(async (a) => ({
          _id: a.id,
          ...await a.getValue()
        })));
        setAttributes(values);
        attributes2.forEach((a) => {
          a.subscribe(async () => {
            const newValue = await a.getValue();
            setAttributes((prev) => prev.map(
              (v) => v._id === a.id ? { _id: a.id, ...newValue } : v
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
  }, [lr.Attribute, setAttributes]);
  return attributes;
}

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
  useLinkedRecords,
  useUserInfo
};
