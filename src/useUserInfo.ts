import { useEffect, useState } from "react";
import { useLinkedRecords } from "./useLinkedRecords";

type UserInfo = {
  email: string,
}

export function useUserInfo() {
  const { lr } = useLinkedRecords();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    lr.getCurrentUserEmail()
      .then((email) => setUserInfo({ email }))
      .catch(() => setUserInfo(null));
  }, [lr]);

  return userInfo;
}
