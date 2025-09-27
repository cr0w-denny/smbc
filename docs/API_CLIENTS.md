Benefits of Per-Applet Clients:

1. Different Base URLs - Each applet can point to different API servers


    - ewi-events → http://api.events.com/v1
    - usage-stats → http://api.analytics.com/v2
    - obligor → http://api.core.com/v1

2. Type Safety - Each client is typed to its specific OpenAPI spec


    - useApiClient<EventsAPI>("ewi-events") knows about Event schemas
    - useApiClient<StatsAPI>("usage-stats") knows about Stats schemas

3. Per-Applet Configuration - Different auth, headers, timeouts per service


    - Events API might need API keys
    - Stats API might need different auth tokens
    - Different retry policies per service

4. Environment Switching - Each applet can point to different environments


    - Events: mock mode uses MSW
    - Stats: development mode hits real dev server
    - Obligor: production mode hits prod API

5. Isolation - API changes in one applet don't break others


    - Events API v2 migration doesn't affect Stats
    - Independent versioning and deployment
