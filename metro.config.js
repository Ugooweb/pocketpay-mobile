const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  events: require.resolve("events"),
  process: require.resolve("process/browser"),
  buffer: require.resolve("buffer"),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "eventsource") {
    return {
      filePath: path.resolve(__dirname, "src/shims/eventsource.js"),
      type: "sourceFile",
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// The SDK loads dotenv for Node consumers. Expo injects EXPO_PUBLIC_* variables
// itself, so resolve dotenv to a no-op instead of bundling Node-only modules.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'dotenv') {
    return {
      filePath: path.resolve(__dirname, 'src/shims/dotenv.js'),
      type: 'sourceFile',
    };
  }

  if (moduleName === '@stellar/stellar-sdk') {
    return {
      filePath: path.resolve(
        __dirname,
        'node_modules/pocketpay-sdk/node_modules/@stellar/stellar-sdk/dist/stellar-sdk.min.js'
      ),
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
