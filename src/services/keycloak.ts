'use client';

import Keycloak from 'keycloak-js';

// Initialize Keycloak instance
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://auth.sakuraphoenix.us',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'sakura-phoenix',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'dashboard-client',
};

let keycloak: Keycloak | null = null;

// This is needed because Keycloak uses browser APIs
if (typeof window !== 'undefined') {
  keycloak = new Keycloak(keycloakConfig);
}

export default keycloak;
