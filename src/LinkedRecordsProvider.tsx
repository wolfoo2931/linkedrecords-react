/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode, useMemo, useState } from 'react';
import LinkedRecords from '@linkedrecords/browser';
import { LinkedRecordsContext } from './linkedRecordsContext';

type OIDCConfig = NonNullable<ConstructorParameters<typeof LinkedRecords>[1]>;

export interface LinkedRecordsConfig {
  // Omit to use cookie based auth, where the LinkedRecords server handles the login.
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
  // Read once on mount. Without it, the shared public client for serverUrl is used.
  config?: LinkedRecordsConfig;
}

function createClient(serverUrl: string, config: LinkedRecordsConfig): LinkedRecords {
  const lr = new LinkedRecords(
    new URL(serverUrl),
    config.oidcConfig,
    config.autoHandleRedirect,
    config.deferUserInfoFetching,
  );

  // Handlers are installed before any child renders, so the first
  // requests made by child components already go through them.
  if (config.loginHandler) lr.setLoginHandler(config.loginHandler);
  if (config.connectionLostHandler) lr.setConnectionLostHandler(config.connectionLostHandler);
  if (config.unknownServerErrorHandler) lr.setUnknownServerErrorHandler(config.unknownServerErrorHandler);
  if (config.quotaViolationErrorHandler) lr.setQuotaViolationErrorHandler(config.quotaViolationErrorHandler);
  if (config.authorizationErrorHandler) lr.setAuthorizationErrorHandler(config.authorizationErrorHandler);

  return lr;
}

export function LinkedRecordsProvider({ children, serverUrl, config }: LinkedRecordsProviderProps) {
  const [lr] = useState(() => (config
    ? createClient(serverUrl, config)
    : LinkedRecords.getPublicClient(serverUrl)));
  // A new context value would re-render every consumer on each render.
  const value = useMemo(() => ({ lr }), [lr]);

  return (
    <LinkedRecordsContext.Provider value={value}>
      {children}
    </LinkedRecordsContext.Provider>
  );
}
