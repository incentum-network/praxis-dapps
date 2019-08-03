import React from 'react'
import { Route, Switch } from 'react-router'
import { BrowserRouter as Router } from 'react-router-dom'

import dva from 'dva'

import { View } from 'react-native'
import posed, { PoseGroup } from 'react-pose'
import { Tabs } from './components/Tabs'
import { MaxWidth } from './constants'

import ledgerModel from './models/ledger'
import contractModel from './models/contract'
import mainModel from './models/main'
import userModel from './models/user'
import governanceModel from './dapps/governance/model'

import ContractSearchScreen from './components/ContractSearchScreen'
import ContractSearchInfoScreen from './components/ContractSearchInfoScreen'
import TemplateSearchInfoScreen from './components/TemplateSearchInfoScreen'
import TemplateSearchScreen from './components/TemplateSearchScreen'
import OutputDetailScreen from './components/OutputDetailScreen'
import AddLedgerScreen from './components/AddLedgerScreen'
import WarnLedgerScreen from './components/WarnLedgerScreen'
import OrgForm from './dapps/governance/OrgForm';

const RouteContainer = posed.div({
  enter: { opacity: 1, delay: 300, beforeChildren: true },
  exit: { opacity: 0 },
})

const app = dva({
  initialState: {},
})
app.model(userModel)
app.model(mainModel)
app.model(ledgerModel)
app.model(contractModel)
app.model(governanceModel)

app.router((api) =>
  <View style={{width: '100%', height: '100%', margin: 'auto', maxWidth: MaxWidth }}>
    <Router>
      <Route render={({location}) => {
        return (
        <PoseGroup>
          <RouteContainer key={location.pathname}>
            <Switch location={location}>
              <Route exact path="/addLedger" component={AddLedgerScreen} key="addLedger-app-key" />
              <Route exact path="/warnLedger" component={WarnLedgerScreen} key="warnLedger-app-key" />
              <Route exact path="/outputDetail" component={OutputDetailScreen} key="outputDetail-app-key" />
              <Route exact path="/contractSearchInfo" component={ContractSearchInfoScreen} key="contractSearchInfo-app-key" />
              <Route exact path="/templateSearchInfo" component={TemplateSearchInfoScreen} key="templateSearchInfo-app-key" />
              <Route exact path="/templateSearch" component={TemplateSearchScreen} key="templateSearch-app-key" />
              <Route exact path="/contractSearch" component={ContractSearchScreen} key="contractSearch-app-key" />
              <Route exact path="/orgForm" component={OrgForm} key="orgForm-app-key" />
              <Route path="/*" component={Tabs} key="tabs-app-key" />
            </Switch>
          </RouteContainer>
        </PoseGroup>
        )
      }} />
    </Router>
  </View>
)
const App = app.start()
export default App
