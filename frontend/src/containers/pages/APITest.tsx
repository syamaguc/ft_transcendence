import React, { useState } from 'react';
import APITestUI from '../../components/pages/APITest';

const APITest = () => {
  const [endpoint, setEndpoint] = useState('users');
  const [val, setVal] = useState(endpoint);

  return (
    <APITestUI
      val={val}
      endpoint={endpoint}
      onInputChange={setEndpoint}
      onButtonClick={setVal}
    />
  );
};

export default APITest;
