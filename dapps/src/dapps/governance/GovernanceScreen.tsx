import React, { Fragment } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'dva'

import { LedgerModel } from '../../models/ledger'
import { GovernanceModel, SegmentTabOrder } from './model'

import {
  incentumYellow,
  tabColor
} from '../../constants/Colors'
import { addButton, refreshButton } from '../../commonComponents/HeaderButtons'

import Screen from '../../components/Screen'
import { createAction } from '../../utils'
import SegmentedControlTab from 'react-native-segmented-control-tab'

import { Orgs } from './Orgs'

const styles = StyleSheet.create({
  activeTabs: {
    backgroundColor: incentumYellow,
  },
  tabs: {
    padding: 5,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: tabColor,
    color: incentumYellow,
    borderColor: incentumYellow,
  },
  tabText: {
    color: incentumYellow,
  },
  activeTabText: {
    color: 'black',
  },

})

interface GovernanceScreenProps {
  history: any
  dispatch: any
  ledger: LedgerModel
  governance: GovernanceModel
}

const segmented = [
  'Orgs', 'Proposals', 'Voting',
]

class _GovernanceScreen extends React.PureComponent<GovernanceScreenProps> {

  public componentWillMount() {
    const { dispatch, history } = this.props
  }

  public render() {
    const { history, ledger, governance, dispatch } = this.props

    let view = <View></View>
    switch (governance.selectedTab) {
      case SegmentTabOrder.orgs:
        view = <Orgs history={history}></Orgs>
        break
      case SegmentTabOrder.proposals:
        view = <View></View>
        break
      case SegmentTabOrder.voting:
        view = <View></View>
        break
    }

    return (
      <Fragment>
        <Screen
          title="Governance"
          spinner={governance.spinner}
          titleComponent={
            <SegmentedControlTab
              values={segmented}
              tabTextStyle={styles.tabText}
              tabStyle={styles.tabs}
              activeTabTextStyle={styles.activeTabText}
              activeTabStyle={styles.activeTabs}
              selectedIndex={governance.selectedTab}
              onTabPress={(selectedTab) => { dispatch(createAction('governance/changeTab', { selectedTab })) }}
            />
          }
          right={ addButton(() => history.push('/orgForm'))}
          left={ refreshButton(() => location.reload(true))}
        >
          { view }
      </Screen>

      </Fragment>
    )
  }
}
export const GovernanceScreen = connect((state) => ({ ledger: state.ledger, governance: state.governance }))(_GovernanceScreen)
