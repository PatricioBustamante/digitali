import React from 'react';
import { Button, Card, Input, Badge, Stack } from './index';

/**
 * Examples — showcase composing components on the 8px grid.
 * Drop this into any React app to see the system in use.
 */
export const Examples: React.FC = () => (
  <Stack gap="lg" padding="lg" style={{ maxWidth: 640, fontFamily: 'system-ui' }}>
    <Card title="Login">
      <Stack gap="sm">
        <Input placeholder="Email" type="email" />
        <Input placeholder="Password" type="password" />
        <Stack direction="row" gap="xs">
          <Button variant="primary">Sign in</Button>
          <Button variant="ghost">Cancel</Button>
        </Stack>
      </Stack>
    </Card>

    <Card title="Status">
      <Stack direction="row" gap="xs">
        <Badge tone="info">New</Badge>
        <Badge tone="success">Live</Badge>
        <Badge tone="warning">Beta</Badge>
        <Badge tone="neutral">Draft</Badge>
      </Stack>
    </Card>
  </Stack>
);

export default Examples;
