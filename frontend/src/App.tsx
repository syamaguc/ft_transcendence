import { useState } from 'react';
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [endpoint, setEndpoint] = useState('users');
  const [val, setVal] = useState(endpoint);

  return (
    <div className="App">
      <div>
        <h1>APIテスト</h1>
      </div>
      <div>
        <h3>http://localhost:3000</h3>
        <input
            placeholder="users"
            value={val}
            onChange={e => setVal(e.target.value)}
          />
      </div>
      <div>
        <button
          onClick={() => {
            setEndpoint(val);
          }}
        >
          <span className="">Send</span>
        </button>
      </div>
      <iframe title="test" src={`http://localhost:3000/${endpoint}`} />

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
