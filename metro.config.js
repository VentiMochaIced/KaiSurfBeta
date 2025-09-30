const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .wasm files to asset extensions to resolve WebAssembly modules
config.resolver.assetExts.push('wasm');

module.exports = config;