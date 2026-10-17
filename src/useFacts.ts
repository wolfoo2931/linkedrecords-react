import { useCallback, useEffect, useState } from "react";
import type LinkedRecords from '@linkedrecords/browser';
import { useLinkedRecords } from "./useLinkedRecords";
import { getQueryKey } from "./queryKey";

type FactQuery = Parameters<LinkedRecords['Fact']['findAll']>[0];
type Fact = Awaited<ReturnType<LinkedRecords['Fact']['findAll']>>[number];

// The SDK can not subscribe to facts, so the facts are fetched whenever the
// query changes. Call reload after writing facts which affect the result.
export function useFacts(query: FactQuery): { facts: Fact[], reload: () => void } {
  const { lr } = useLinkedRecords();
  const [ facts, setFacts ] = useState<Fact[]>([]);
  const [ reloadCount, setReloadCount ] = useState(0);
  const queryKey = getQueryKey(query);

  useEffect(() => {
    // Ignore responses which arrive after the query changed or the
    // component unmounted.
    let cancelled = false;

    lr.Fact.findAll(query).then((result) => {
      if (!cancelled) {
        setFacts(result);
      }
    });

    return () => {
      cancelled = true;
    }
    // query is represented by queryKey; depending on the object itself would
    // refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ lr, queryKey, reloadCount ]);

  const reload = useCallback(() => setReloadCount((c) => c + 1), []);

  return { facts, reload };
}
