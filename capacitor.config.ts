import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.basement.app",
  appName: "Basement",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 500,
      backgroundColor: "#000000",
      showSpinner: false,
    },
  },
};

export default config;
