/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";
import { getQueryKey } from "./queryKey";
import { KeyValueRecord } from '@linkedrecords/browser';

interface KVValue {
  [key: string]: KVValue | string | boolean | number | Date | undefined;
}

export interface KVRecord extends KVValue {
  _id?: string;
  _createdAt?: Date;
}

export function useKeyValueRecordsWithStatus(query: any[]): { records: KVRecord[], isLoading: boolean } {
  const { lr } = useLinkedRecords();
  const [ records, setRecords ] = useState<KVRecord[]>([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const queryKey = getQueryKey(query);

  useEffect(() => {
    setIsLoading(true);

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
          _createdAt: r.createdAt,
          ...(await r.getValue()),
        })));

        if (cancelled) {
          return;
        }

        setRecords(values);
        setIsLoading(false);

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
                ? { _id: r.id, _createdAt: r.createdAt, ...newValue }
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

  return { records, isLoading };
}

export function useKeyValueRecords(query: any[]): KVRecord[] {
  return useKeyValueRecordsWithStatus(query).records;
}

/** @deprecated Use useKeyValueRecords instead. */
export const useKeyValueAttributes = useKeyValueRecords;
