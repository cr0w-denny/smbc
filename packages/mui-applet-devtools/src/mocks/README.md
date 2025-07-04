# Mocks Directory

This directory allows you to override default applet mocks with custom implementations for your host application.

## File Structure

- `index.ts` - Main aggregator that exports all mock overrides
- Individual applet mock files will be created based on your app.config.ts
- `README.md` - This documentation

## Usage

1. Edit individual applet mock files to customize behavior
2. Uncomment and modify the example handlers in each file
3. The main `index.ts` automatically imports all applet overrides
4. MSW will use these overrides when mock mode is enabled

## Per-Applet Customization

Each applet has its own mock file where you can:
- Override specific API endpoints
- Add custom response data
- Simulate error conditions
- Add network delays for testing

## Examples

### Override an endpoint in an applet
```typescript
http.get('/api/applet/users', () => {
  return HttpResponse.json([
    { id: 1, name: 'Custom User', email: 'custom@example.com' }
  ]);
}),
```

### Simulate server errors
```typescript
http.post('/api/applet/action', () => {
  return HttpResponse.json(
    { error: 'Simulated server error' },
    { status: 500 }
  );
}),
```

### Add realistic delays
```typescript
http.get('/api/applet/slow-data', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return HttpResponse.json({ message: 'This took 2 seconds!' });
}),
```

## Global Overrides

Add global mock handlers to the main `index.ts` file for cross-applet functionality.
