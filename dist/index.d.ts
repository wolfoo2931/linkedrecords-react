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
    [key: string]: KVValue | string | boolean | number | Date | undefined;
}
interface KVRecord extends KVValue {
    _id?: string;
    _createdAt?: Date;
}
declare function useKeyValueRecordsWithStatus(query: any[]): {
    records: KVRecord[];
    isLoading: boolean;
};
declare function useKeyValueRecords(query: any[]): KVRecord[];
/** @deprecated Use useKeyValueRecords instead. */
declare const useKeyValueAttributes: typeof useKeyValueRecords;

type FactQuery = Parameters<LinkedRecords['Fact']['findAll']>[0];
type Fact = Awaited<ReturnType<LinkedRecords['Fact']['findAll']>>[number];
declare function useFacts(query: FactQuery): {
    facts: Fact[];
    reload: () => void;
};

declare function useLinkedRecords(): LinkedRecordsContextType;

type UserInfo = {
    email: string;
};
declare function useUserInfo(): UserInfo | null;

declare function useActorId(): string | undefined;

export { type KVRecord, type LinkedRecordsConfig, LinkedRecordsContext, type LinkedRecordsContextType, LinkedRecordsProvider, useActorId, useFacts, useKeyValueAttributes, useKeyValueRecords, useKeyValueRecordsWithStatus, useLinkedRecords, useUserInfo };
