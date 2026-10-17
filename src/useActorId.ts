import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";

// The id of the logged in user, undefined until it is known.
export function useActorId(): string | undefined {
  const { lr } = useLinkedRecords();
  const [ actorId, setActorId ] = useState<string | undefined>(lr.actorId);

  useEffect(() => {
    let cancelled = false;

    lr.ensureUserIdIsKnown().then((id) => {
      if (!cancelled) {
        setActorId(id);
      }
    });

    return () => {
      cancelled = true;
    }
  }, [ lr ]);

  return actorId;
}
