import { createContext } from 'react';
import type LinkedRecords from '@linkedrecords/browser';

export interface LinkedRecordsContextType {
  lr: LinkedRecords;
}

export const LinkedRecordsContext = createContext<LinkedRecordsContextType | undefined>(undefined);
