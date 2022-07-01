import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import './App.css';

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
);

export default App;
