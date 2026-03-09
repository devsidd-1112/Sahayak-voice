const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Force axios to resolve to the correct entry point for React Native
    resolveRequest: (context, moduleName, platform) => {
      // Handle axios resolution
      if (moduleName === 'axios') {
        // Point directly to axios/index.js which is the browser/React Native build
        return {
          filePath: path.join(__dirname, 'node_modules', 'axios', 'index.js'),
          type: 'sourceFile',
        };
      }
      
      // Use default resolution for everything else
      return context.resolveRequest(context, moduleName, platform);
    },
    
    // Explicitly set source extensions
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'cjs', 'mjs'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
