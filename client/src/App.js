import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import OtherPage from './OtherPage';
import Fib from './Fib';
function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/other">Other</Link>
            </li>
          </ul>
        </header>
        <div>
          <Route exact path="/" component={Fib} />
          <Route path="/other" component={OtherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
