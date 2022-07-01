import React, { useState } from 'react';

const APITest = () => {
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
          onChange={(e) => setVal(e.target.value)}
        />
      </div>
      <div>
        <button
          onClick={() => {
            setEndpoint(val);
          }}
          type="button"
        >
          <span className="">Send</span>
        </button>
      </div>
      <iframe title="test" src={`http://localhost:3000/${endpoint}`} />
    </div>
  );
};

export default APITest;
