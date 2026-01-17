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
      return lr.Attribute.subscribeToQuery({
        attributes: [
          ["$it", "$hasDataType", KeyValueAttribute],
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
export {
  LinkedRecordsContext,
  LinkedRecordsProvider,
  useKeyValueAttributes,
  useLinkedRecords
};
