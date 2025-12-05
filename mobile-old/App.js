/**
 * NeuroLoad Mobile App
 * Main entry point
 */
import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { CONFIG } from './src/config';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={CONFIG.COLORS.background} />
      <AppNavigator />
    </>
  );
};

export default App;
