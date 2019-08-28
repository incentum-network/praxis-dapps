/*
 * Licensed to Incentum Ltd. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Incentum Ltd. licenses this file to you under
 * the Token Use License Version 1.0 and the Token Use
 * Clause (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of
 * the License at
 *
 *  https://github.com/incentum-network/tul/blob/master/LICENSE.md
 *  https://github.com/incentum-network/tul/blob/master/TUC.md
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react'
import { connect } from 'dva'
import pathParse from 'path-parse'

import { StyleSheet, View, Text } from 'react-native'
import { TabBarIOS  } from 'react-native-web-extended'
import { _LedgersScreen } from './Ledgers'
import { MaxWidth } from '../constants'
import { Ionicons } from 'react-web-vector-icons'
import { incentumYellow, baseColor } from '../constants/Colors'
import ContractsScreen from './ContractsScreen'
import ContractActionScreen from './ContractActionScreen'
import Favorites from './Favorites'
import { ContractModel, TabLabels } from '../models/contract'
import { createActionObject, createAction } from '../utils'
import { LedgerModel } from '../models/ledger'
import { UserModel } from '../models/user'
import { CompositeScreen } from '../dapps/composite/CompositeScreen'
import { GovernanceScreen } from '../dapps/governance/GovernanceScreen';

const iconLedger =
  <View>
    <Ionicons
      name="ios-filing"
      color={incentumYellow}
      size={32}
    />
  </View>

const iconForm =
  <View>
    <Ionicons
    name="ios-pulse"
    color={incentumYellow}
    size={32}
    />
  </View>

const iconConstruct =
  <View>
    <Ionicons
    name="ios-play-circle"
    color={incentumYellow}
    size={32}
    />
  </View>

const iconFavorites =
  <View>
    <Ionicons
    name="ios-star"
    color={incentumYellow}
    size={32}
    />
  </View>

const iconComposite =
  <View>
    <Ionicons
    name="ios-apps"
    color={incentumYellow}
    size={32}
    />
  </View>

const iconGovernance =
  <View>
    <Ionicons
    name="ios-contacts"
    color={incentumYellow}
    size={32}
    />
  </View>

interface TabsProps {
  dispatch: any
  history: any
  user: UserModel
  ledger: LedgerModel
  contract: ContractModel
}

function getSelectedTabFromPath(pathname: string, def: string): string {
  const path = pathname.split('/')
  if (path.length <= 1) { return def }
  switch (path[1]) {
    case TabLabels.TabAction:
      return TabLabels.TabAction
    case TabLabels.TabLedgers:
      return TabLabels.TabLedgers
    case TabLabels.TabContracts:
      return TabLabels.TabContracts
    default:
      return def
  }
}

class _Tabs extends React.Component<TabsProps> {
  public static title = '<TabBarIOS>'
  public static description = 'Incentum Tabs'
  public static displayName = 'Incentum Tabs'

  public componentWillMount() {
    const { history, contract, dispatch, ledger, user } = this.props
    const selectedTab = getSelectedTabFromPath(location.pathname, '')
    if (selectedTab) {
      dispatch(createActionObject('contract/locationUrl', { selectedTab: TabLabels.TabAction, location, ledgerModel: ledger, contract }))
    } else {
      // dispatch(createActionObject('contract/startup', { history }))
    }
  }

  public componentDidUpdate(prevProps) {
    // const { user, ledger, contract, dispatch, history } = this.props
    // if (user.loggedIn && !prevProps.user.loggedIn && ledger.ledgers.length === 0) {
    //   const selectedTab = TabLabels.TabLedgers
    //   dispatch(createActionObject('selectTab', { selectedTab }))
    //   dispatch(createActionObject('contract/startup', { history }))
    // }
  }

  public render() {
    const { history, contract, dispatch, user } = this.props
    const paddingBottom = 10
    return (
      <TabBarIOS
        style={{maxWidth: MaxWidth, borderTopColor: baseColor, paddingBottom }}
        unselectedTintColor="white"
        tintColor={incentumYellow}
        barTintColor={baseColor}>
        <TabBarIOS.Item
          iconComponent={iconLedger}
          selected={contract.selectedTab === TabLabels.TabLedgers}
          onPress={() => { dispatch(createActionObject('contract/selectTab', { selectedTab: TabLabels.TabLedgers}))}}
        >
          <_LedgersScreen history={history}/>
        </TabBarIOS.Item>
        <TabBarIOS.Item
          iconComponent={iconConstruct}
          selected={contract.selectedTab === TabLabels.TabContracts}
          onPress={() => { dispatch(createActionObject('contract/selectTab', { selectedTab: TabLabels.TabContracts}))}}
        >
          <ContractsScreen history={history} />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          iconComponent={iconForm}
          selected={contract.selectedTab === TabLabels.TabAction}
          onPress={() => { dispatch(createActionObject('contract/selectTab', { selectedTab: TabLabels.TabAction}))}}
        >
          <ContractActionScreen history={history} />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          iconComponent={iconComposite}
          selected={contract.selectedTab === TabLabels.TabComposite}
          onPress={() => { dispatch(createActionObject('contract/selectTab', { selectedTab: TabLabels.TabComposite}))}}
        >
          <CompositeScreen history={history} />
        </TabBarIOS.Item>
        <TabBarIOS.Item
          iconComponent={iconGovernance}
          selected={contract.selectedTab === TabLabels.TabGovernance}
          onPress={() => { dispatch(createActionObject('contract/selectTab', { selectedTab: TabLabels.TabGovernance}))}}
        >
          <GovernanceScreen history={history} />
        </TabBarIOS.Item>
      </TabBarIOS>
    )
  }
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    paddingBottom: 10,
  },
})

export const Tabs = connect((state) => ({ user: state.user, contract: state.contract, ledger: state.ledger }))(_Tabs)
