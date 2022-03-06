import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import TabsContainer from './components/tabs-container/TabsContainer';
import Titlebar from './components/titlebar/Titlebar';

interface IMainProps {}
interface IMainState {}
class Main extends React.Component<IMainProps, IMainState> {
  public constructor(props: IMainProps) {
    super(props);
  }
  render() {
    return <TabsContainer></TabsContainer>;
  }
}

export default function App() {
  return (
    <div className="app-container">
      <Titlebar />
      <div className="content-container ">
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
      </div>
    </div>
  );
}
