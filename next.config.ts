import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
    ACCESS_KEY_ID_AWS: process.env.ACCESS_KEY_ID_AWS || '',
    SECRET_ACCESS_KEY_AWS: process.env.SECRET_ACCESS_KEY_AWS || '',
    COGNITO_REGION: process.env.COGNITO_REGION || '',
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID || '',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
};

export default nextConfig;
