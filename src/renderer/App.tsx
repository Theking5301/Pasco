import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import BrowserTab from 'renderer/components/BrowserTab';
import './App.css';

const Hello = () => {
  return (
    <div className="main_container">
      <BrowserTab url="https://finviz.com/" />
      <BrowserTab url="https://finviz.com/" />
      <BrowserTab url="https://finviz.com/" />
      <BrowserTab url="https://finviz.com/" />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
