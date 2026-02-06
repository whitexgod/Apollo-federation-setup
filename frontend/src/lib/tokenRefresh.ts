import { ApolloClient, gql } from '@apollo/client';

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const refreshAccessToken = async (
  client: ApolloClient<any>,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: {
        input: { refreshToken },
      },
    });

    if (data?.refreshToken) {
      return {
        accessToken: data.refreshToken.accessToken,
        refreshToken: data.refreshToken.refreshToken,
      };
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};
