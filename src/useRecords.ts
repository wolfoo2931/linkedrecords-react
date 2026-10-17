/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";
import { KeyValueRecord } from '@linkedrecords/browser';

interface KVValue {
  [key: string]: KVValue | string | boolean | number | undefined;
}

// Callers usually pass a new query array on every render, so the effect
// depends on a serialized key instead of the array identity. Functions
// (e.g. record classes) would serialize to null, so they are keyed by name.
function getQueryKey(query: any[]): string {
  return JSON.stringify(query, (_, v) => (typeof v === 'function' ? `fn:${v.name}` : v));
}

export function useKeyValueRecords(query: any[]): KVValue[]  {
  const { lr } = useLinkedRecords();
  const [ records, setRecords ] = useState<KVValue[]>([]);
  const queryKey = getQueryKey(query);

  useEffect(() => {
    // The SDK has no way to remove a record observer, so observers registered
    // by this effect run check this flag and become no-ops after cleanup.
    let cancelled = false;
    // Records this effect run already observes, so repeated query results
    // do not stack up observers on the same record.
    const subscribedRecordIds = new Set<string | undefined>();

    const unsubscribeFnPromise = new Promise<void>((resolve) => {
      const checkActorId = () => {
        if (cancelled) {
          return;
        }

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

        if (cancelled) {
          return;
        }

        setRecords(values);

        records.forEach((r) => {
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
      cancelled = true;
      unsubscribeFnPromise.then(fn => fn());
    }
    // query is represented by queryKey; depending on the array itself would
    // resubscribe on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ lr, queryKey ]);

  return records;
}

/** @deprecated Use useKeyValueRecords instead. */
export const useKeyValueAttributes = useKeyValueRecords;
