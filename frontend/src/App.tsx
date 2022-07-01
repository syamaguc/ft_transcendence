import { Route, Routes } from 'react-router-dom';
import APItest from './components/APITest';
import './App.css';

const App = () => (
  <Routes>
    <Route path="/" element={<APItest />} />
  </Routes>
);

export default App;
