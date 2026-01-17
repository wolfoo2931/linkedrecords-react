/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";
import { KeyValueAttribute } from "linkedrecords/browser_sdk";

interface KVValue {
  [key: string]: KVValue | string | boolean | number | undefined;
}

export function useKeyValueAttributes(query: any[]): KVValue[]  {
  const { lr } = useLinkedRecords();
  const [ attributes, setAttributes ] = useState<KVValue[]>([]);

  useEffect(() => {
    const unsubscribeFnPromise = new Promise<void>((resolve) => {
      const checkActorId = () => {
        if (lr.actorId !== undefined) {
          resolve();
        } else {
          setTimeout(checkActorId, 50);
        }
      };
      checkActorId();
    }).then(() => {
      const queryUnsubscribe = lr.Attribute.subscribeToQuery({
        attributes: [
          ['$it', '$hasDataType', KeyValueAttribute],
          ...query
        ],
      }, async ({ attributes }) => {
        const values = await Promise.all(attributes.map(async (a) => ({
          _id: a.id,
          ...(await a.getValue()),
        })));

        setAttributes(values);

        attributes.forEach((a) => {
          a.subscribe(async () => {
            const newValue = await a.getValue();

            // Use functional update to avoid stale closure
            setAttributes(prev => prev.map(v =>
              v._id === a.id
                ? { _id: a.id, ...newValue }
                : v
            ));
          });
        });
      });

      return () => {
        queryUnsubscribe.then(unsubscribe => unsubscribe());
      };
    });

    return () => {
      unsubscribeFnPromise.then(fn => fn());
    }
  }, [ lr.Attribute, setAttributes ]);

  return attributes;
}
