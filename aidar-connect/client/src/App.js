// src/App.js
import React, { useState } from 'react';
import NavigationBar from './components/utility/NavigationBar';

function App() {
  
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <NavigationBar />

      {/* Add Footer if needed */}
      {/* <footer>Footer</footer> */}
    </div>
  );
}

export default App;
