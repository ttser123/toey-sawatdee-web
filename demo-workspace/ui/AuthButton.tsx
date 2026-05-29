// demo-workspace/ui/AuthButton.tsx
export const AuthButton = () => {
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;

  return `Login with Auth0 (Client: ${clientId}, Domain: ${domain})`;
};
