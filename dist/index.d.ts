import * as react from 'react';
import { ReactNode } from 'react';
import LinkedRecords from '@linkedrecords/browser';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface LinkedRecordsContextType {
    lr: LinkedRecords;
}
declare const LinkedRecordsContext: react.Context<LinkedRecordsContextType | undefined>;

type OIDCConfig = NonNullable<ConstructorParameters<typeof LinkedRecords>[1]>;
interface LinkedRecordsConfig {
    oidcConfig?: OIDCConfig;
    autoHandleRedirect?: boolean;
    deferUserInfoFetching?: boolean;
    loginHandler?: () => void;
    connectionLostHandler?: (err?: any) => void;
    unknownServerErrorHandler?: (response: any) => void;
    quotaViolationErrorHandler?: (response: any) => void;
    authorizationErrorHandler?: (response: any) => void;
}
interface LinkedRecordsProviderProps {
    children: ReactNode;
    serverUrl: string;
    config?: LinkedRecordsConfig;
}
declare function LinkedRecordsProvider({ children, serverUrl, config }: LinkedRecordsProviderProps): react_jsx_runtime.JSX.Element;

interface KVValue {
    [key: string]: KVValue | string | boolean | number | undefined;
}
declare function useKeyValueRecords(query: any[]): KVValue[];
/** @deprecated Use useKeyValueRecords instead. */
declare const useKeyValueAttributes: typeof useKeyValueRecords;

declare function useLinkedRecords(): LinkedRecordsContextType;

type UserInfo = {
    email: string;
};
declare function useUserInfo(): UserInfo | null;

export { type LinkedRecordsConfig, LinkedRecordsContext, type LinkedRecordsContextType, LinkedRecordsProvider, useKeyValueAttributes, useKeyValueRecords, useLinkedRecords, useUserInfo };
