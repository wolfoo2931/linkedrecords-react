import { type ReactNode } from 'react';
import LinkedRecords from 'linkedrecords/browser_sdk';
import { LinkedRecordsContext } from './linkedRecordsContext';

interface LinkedRecordsProviderProps {
  children: ReactNode;
  serverUrl: string;
}

export function LinkedRecordsProvider({ children, serverUrl }: LinkedRecordsProviderProps) {
  const lr = LinkedRecords.getPublicClient(serverUrl);

  return (
    <LinkedRecordsContext.Provider value={{ lr }}>
      {children}
    </LinkedRecordsContext.Provider>
  );
}
