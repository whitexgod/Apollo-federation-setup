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
            console.warn('No refresh token found, redirecting to login');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            // Use setTimeout to avoid interrupting other operations
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
            return;
          }

          return fromPromise(
            refreshAccessToken(client, refreshToken)
              .then((tokens) => {
                if (!tokens) {
                  // Refresh failed, logout user
                  console.error('Token refresh failed, logging out');
                  localStorage.removeItem('token');
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('user');
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 100);
                  return;
                }

                // Update tokens in localStorage
                console.log('Tokens refreshed successfully');
                localStorage.setItem('token', tokens.accessToken);
                localStorage.setItem('refreshToken', tokens.refreshToken);

                resolvePendingRequests();
                return tokens.accessToken;
              })
              .catch((err) => {
                console.error('Token refresh error:', err);
                pendingRequests = [];
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setTimeout(() => {
                  window.location.href = '/login';
                }, 100);
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
