import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import AWS from 'aws-sdk';
import process from 'process';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID_AWS,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS,
  region: process.env.COGNITO_REGION,
});

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const cognito = new AWS.CognitoIdentityServiceProvider();
        
        if (!credentials) return null;
        
        const params = {
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.COGNITO_CLIENT_ID as string,
          AuthParameters: {
            USERNAME: credentials.email,
            PASSWORD: credentials.password,
          },
        };
        
        try {
          const response = await cognito.initiateAuth(params).promise();
          
          // this is hacky
          if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
            const challengeResponse = await cognito.respondToAuthChallenge({
              ChallengeName: 'NEW_PASSWORD_REQUIRED',
              ClientId: process.env.COGNITO_CLIENT_ID as string,
              ChallengeResponses: {
                USERNAME: credentials.email,
                PASSWORD: credentials.password,
                NEW_PASSWORD: credentials.password,
              },
              Session: response.Session,
            }).promise();
            
            if (!challengeResponse.AuthenticationResult) {
              return null;
            }
            
            const user = {
              id: credentials.email,
              name: credentials.email,
              email: credentials.email,
              accessToken: challengeResponse.AuthenticationResult.AccessToken,
              idToken: challengeResponse.AuthenticationResult.IdToken,
              refreshToken: challengeResponse.AuthenticationResult.RefreshToken,
            };
            
            return user;
          }
          
          if (!response.AuthenticationResult) {
            return null;
          }
          
          const user = {
            id: credentials.email,
            name: credentials.email,
            email: credentials.email,
            accessToken: response.AuthenticationResult.AccessToken,
            idToken: response.AuthenticationResult.IdToken,
            refreshToken: response.AuthenticationResult.RefreshToken,
          };
          
          return user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    error: '/',
    newUser: '/register',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.idToken = user.idToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
})

export { handler as GET, handler as POST }