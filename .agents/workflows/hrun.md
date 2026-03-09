---
description: Performs a hard reset of Doubletype by clearing Vite cache, stopping the dev server, and restarting.
---

// turbo-all
1. Clean Vite Cache
```bash
rm -rf node_modules/.vite
```

2. Stop any running dev server on port 1420
```bash
lsof -i :1420 -t | xargs kill -9
```

3. Start Tauri Dev Server
```bash
npm run tauri dev
```
