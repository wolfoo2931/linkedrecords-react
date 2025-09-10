import { useContext } from 'react';
import { LinkedRecordsContext } from './linkedRecordsContext';

export function useLinkedRecords() {
  const context = useContext(LinkedRecordsContext);
  if (!context) {
    throw new Error('useLinkedRecords must be used within a LinkedRecordsProvider');
  }
  return context;
}
