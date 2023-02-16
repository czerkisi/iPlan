import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/Dashboard';
import CreateAccountPage from './components/CreateAccount';

function App() {
  return (
      <div className="wrapper">
          <h1>Application</h1>
          <BrowserRouter>
              <Switch>
                  <Route path="/" component={LoginPage} />
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route path="/create-account" component={CreateAccountPage} />
              </Switch>
          </BrowserRouter>
      </div>
  );
}

export default App;