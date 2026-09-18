import type { CollectionConfig } from 'payload'

/**
 * Short-lived OAuth authorization codes for the ChatGPT MCP connection.
 * Values are stored as hashes, so a database leak cannot be exchanged for an MCP token.
 */
export const McpOAuthCodes: CollectionConfig = {
  slug: 'mcp-oauth-codes',
  admin: { hidden: true },
  access: {
    create: () => false,
    delete: () => false,
    read: () => false,
    update: () => false,
  },
  fields: [
    { name: 'codeHash', type: 'text', required: true, unique: true, index: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'clientID', type: 'text', required: true },
    { name: 'redirectURI', type: 'text', required: true },
    { name: 'codeChallenge', type: 'text', required: true },
    { name: 'scope', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true, index: true },
    { name: 'usedAt', type: 'date' },
  ],
}
