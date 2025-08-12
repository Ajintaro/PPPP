import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('pppp', { env: 'renderer', ping: () => 'pong' });
