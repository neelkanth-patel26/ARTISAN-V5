import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.artisan.v5',
    appName: 'artisan',
    webDir: 'out',
    server: {
        url: 'https://artisan-v5.vercel.app',
        cleartext: true
    }
};

export default config;
