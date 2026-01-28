import * as react from 'react';
import { ReactNode } from 'react';
import LinkedRecords from 'linkedrecords/browser_sdk';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface LinkedRecordsContextType {
    lr: LinkedRecords;
}
declare const LinkedRecordsContext: react.Context<LinkedRecordsContextType | undefined>;

interface LinkedRecordsProviderProps {
    children: ReactNode;
    serverUrl: string;
}
declare function LinkedRecordsProvider({ children, serverUrl }: LinkedRecordsProviderProps): react_jsx_runtime.JSX.Element;

interface KVValue {
    [key: string]: KVValue | string | boolean | number | undefined;
}
declare function useKeyValueAttributes(query: any[]): KVValue[];

declare function useLinkedRecords(): LinkedRecordsContextType;

type UserInfo = {
    email: string;
};
declare function useUserInfo(): UserInfo | null;

export { LinkedRecordsContext, type LinkedRecordsContextType, LinkedRecordsProvider, useKeyValueAttributes, useLinkedRecords, useUserInfo };
