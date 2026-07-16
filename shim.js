// Polyfills for Stellar SDK in React Native. See docs/polyfills.md for details.
import 'react-native-get-random-values';
import 'text-encoding';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

// Polyfill process for Stellar SDK
if (typeof process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

// Polyfill global env
if (!global.process.env) {
  global.process.env = {};
}
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';
