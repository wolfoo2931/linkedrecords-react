/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";
import { KeyValueRecord } from '@linkedrecords/browser';

interface KVValue {
  [key: string]: KVValue | string | boolean | number | undefined;
}

export function useKeyValueRecords(query: any[]): KVValue[]  {
  const { lr } = useLinkedRecords();
  const [ records, setRecords ] = useState<KVValue[]>([]);

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
      const queryUnsubscribe = lr.Record.subscribeToQuery({
        records: [
          ['$it', '$hasDataType', KeyValueRecord],
          ...query
        ],
      }, async ({ records }) => {
        const values = await Promise.all(records.map(async (r) => ({
          _id: r.id,
          ...(await r.getValue()),
        })));

        setRecords(values);

        records.forEach((r) => {
          r.subscribe(async () => {
            const newValue = await r.getValue();

            // Use functional update to avoid stale closure
            setRecords(prev => prev.map(v =>
              v._id === r.id
                ? { _id: r.id, ...newValue }
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
  }, [ lr.Record, setRecords ]);

  return records;
}

/** @deprecated Use useKeyValueRecords instead. */
export const useKeyValueAttributes = useKeyValueRecords;
