import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import BrowserWindow from 'renderer/components/BrowserWindow/BrowserWindow';
import './App.css';
import Titlebar from './components/titlebar/Titlebar';

const Hello = () => {
  return (
    <div className="main-container">
      <Titlebar />
      <div className="main_container">
        <BrowserWindow url="https://finviz.com/" />
        <BrowserWindow url="https://finviz.com/" />
        <BrowserWindow url="https://finviz.com/" />
        <BrowserWindow url="https://finviz.com/" />
      </div>
      <div className="footer"></div>
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
