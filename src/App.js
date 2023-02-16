import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/Dashboard';
import CreateAccountPage from './components/CreateAccount';

function App() {
  return (
      <Router>
        <div>
          <Switch>
            <Route path="/" component={LoginPage} />
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/create-account" component={CreateAccountPage} />
          </Switch>
        </div>
      </Router>
  );
}

export default App;