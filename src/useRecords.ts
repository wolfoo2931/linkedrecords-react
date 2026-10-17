import { useEffect, useState } from "react";
import type LinkedRecords from '@linkedrecords/browser';
import { KeyValueRecord } from '@linkedrecords/browser';
import { useLinkedRecords } from "./useLinkedRecords";
import { getQueryKey } from "./queryKey";

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

type KVValue = { [key: string]: JSONValue | undefined };

export type KVRecord<T extends object = KVValue> = T & {
  _id?: string;
  _createdAt?: Date;
};

type CompoundRecordQuery = Parameters<LinkedRecords['Record']['subscribeToQuery']>[0];

// One [subject, predicate, object] clause of a record query, e.g. ['$it', 'isA', 'Todo'].
export type RecordQueryClause = Exclude<CompoundRecordQuery[string], string>[number];

export function useKeyValueRecordsWithStatus<T extends object = KVValue>(query: RecordQueryClause[]): { records: KVRecord<T>[], isLoading: boolean } {
  const { lr } = useLinkedRecords();
  const [ records, setRecords ] = useState<KVRecord<T>[]>([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const queryKey = getQueryKey(query);

  useEffect(() => {
    setIsLoading(true);

    // Values are read asynchronously; results which arrive after the query
    // changed or the component unmounted are dropped.
    let cancelled = false;
    // Record observers by record id, so each record in the result is
    // observed once and records which leave the result are unobserved.
    const recordUnsubscribes = new Map<string | undefined, Promise<() => void>>();

    // T is the value shape declared by the caller; the hook can not check it.
    const toKVRecord = async (r: KeyValueRecord) => ({
      _id: r.id,
      _createdAt: r.createdAt,
      ...(await r.getValue()),
    }) as KVRecord<T>;

    const queryUnsubscribe = lr.Record.subscribeToQuery({
      records: [
        ['$it', '$hasDataType', KeyValueRecord],
        ...query
      ],
    }, async ({ records }) => {
      const kvRecords = records as KeyValueRecord[];
      const values = await Promise.all(kvRecords.map(toKVRecord));

      if (cancelled) {
        return;
      }

      setRecords(values);
      setIsLoading(false);

      const ids = new Set(kvRecords.map((r) => r.id));

      recordUnsubscribes.forEach((unsubscribe, id) => {
        if (!ids.has(id)) {
          recordUnsubscribes.delete(id);
          unsubscribe.then((fn) => fn());
        }
      });

      kvRecords.forEach((r) => {
        if (recordUnsubscribes.has(r.id)) {
          return;
        }

        recordUnsubscribes.set(r.id, r.subscribe(async () => {
          const newValue = await toKVRecord(r);

          if (cancelled) {
            return;
          }

          setRecords(prev => prev.map(v => (v._id === r.id ? newValue : v)));
        }));
      });
    });

    queryUnsubscribe.catch((err) => {
      console.error('useKeyValueRecords: could not subscribe to query', err);
    });

    return () => {
      cancelled = true;
      queryUnsubscribe.then((unsubscribe) => unsubscribe(), () => {});
      recordUnsubscribes.forEach((unsubscribe) => unsubscribe.then((fn) => fn()));
    }
    // query is represented by queryKey; depending on the array itself would
    // resubscribe on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ lr, queryKey ]);

  return { records, isLoading };
}

export function useKeyValueRecords<T extends object = KVValue>(query: RecordQueryClause[]): KVRecord<T>[] {
  return useKeyValueRecordsWithStatus<T>(query).records;
}

/** @deprecated Use useKeyValueRecords instead. */
export const useKeyValueAttributes = useKeyValueRecords;
