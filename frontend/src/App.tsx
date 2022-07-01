import { Route, Routes } from 'react-router-dom';
import APItest from './components/APITest';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<APItest />} />
    </Routes>
  );
}

export default App;
