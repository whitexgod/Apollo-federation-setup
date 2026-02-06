import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, fromPromise } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { refreshAccessToken } from './tokenRefresh';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_API_URL || '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

let isRefreshing = false;
let pendingRequests: Function[] = [];

const resolvePendingRequests = () => {
  pendingRequests.map((callback) => callback());
  pendingRequests = [];
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    // Skip error handling for login, register, and refreshToken mutations
    const operationName = operation.operationName;
    if (operationName === 'Login' || operationName === 'Register' || operationName === 'RefreshToken') {
      return; // Let these mutations handle their own errors
    }

    for (const err of graphQLErrors) {
      // Check if error is due to token expiration
      if (
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.message.includes('expired') ||
        err.message.includes('Invalid or expired token')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            // No refresh token, logout user
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }

          return fromPromise(
            refreshAccessToken(client, refreshToken)
              .then((tokens) => {
                if (!tokens) {
                  // Refresh failed, logout user
                  localStorage.removeItem('token');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                  return;
                }

                // Update tokens in localStorage
                localStorage.setItem('token', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);

                resolvePendingRequests();
                return tokens.accessToken;
              })
              .catch(() => {
                pendingRequests = [];
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
              })
              .finally(() => {
                isRefreshing = false;
              })
          ).flatMap(() => {
            // Retry the failed request with new token
            const oldHeaders = operation.getContext().headers;
            const token = localStorage.getItem('token');
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: token ? `Bearer ${token}` : '',
              },
            });
            return forward(operation);
          });
        } else {
          // Request is pending, wait for token refresh
          return fromPromise(
            new Promise<void>((resolve) => {
              pendingRequests.push(() => resolve());
            })
          ).flatMap(() => {
            const token = localStorage.getItem('token');
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: token ? `Bearer ${token}` : '',
              },
            });
            return forward(operation);
          });
        }
      }
    }
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
