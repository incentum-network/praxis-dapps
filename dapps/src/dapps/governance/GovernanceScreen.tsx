import React, { Fragment } from 'react'
import { View, StyleSheet, Picker, TouchableOpacity } from 'react-native'
import { connect } from 'dva'

import { LedgerModel } from '../../models/ledger'
import { GovernanceModel, SegmentTabOrder } from './model'
import { Ionicons } from 'react-web-vector-icons'

import {
  incentumYellow,
  tabColor,
  baseColor
} from '../../constants/Colors'
import { addButton, refreshButton } from '../../commonComponents/HeaderButtons'

import Screen from '../../components/Screen'
import { createAction, createActionObject } from '../../utils'
import SegmentedControlTab from 'react-native-segmented-control-tab'

import { Orgs } from './Orgs'
import { Proposals } from './Proposals'
import { VoteProposals } from './VoteProposals'

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
  picker: {
    height: 40,
    width: '100%',
    color: incentumYellow,
    backgroundColor: baseColor,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 5,
    borderColor: incentumYellow,
    flexGrow: 1,
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
        view = <Proposals history={history}></Proposals>
        break
      case SegmentTabOrder.voting:
        view = <VoteProposals history={history}></VoteProposals>
        break
    }

    return (
      <Fragment>
        <Screen
          title="Governance"
          spinner={governance.spinner}
          titleComponent={
            <View style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              <SegmentedControlTab
                values={segmented}
                tabTextStyle={styles.tabText}
                tabStyle={styles.tabs}
                activeTabTextStyle={styles.activeTabText}
                activeTabStyle={styles.activeTabs}
                selectedIndex={governance.selectedTab}
                onTabPress={(selectedTab) => { dispatch(createAction('governance/changeTab', { selectedTab })) }}
              />
              <View>
                <TouchableOpacity
                  onPress={() => {
                    switch (governance.selectedTab) {
                      case SegmentTabOrder.orgs:
                        dispatch(createAction('governance/refreshOrgs'))
                        break
                      case SegmentTabOrder.proposals:
                        dispatch(createAction('governance/refreshProposals'))
                        break
                      case SegmentTabOrder.voting:
                        dispatch(createAction('governance/refreshVoteProposals'))
                        break
                    }
                  }}
                >
                  <View style={{ height: 40, justifyContent: 'center', marginLeft: 10 }}>
                    <Ionicons
                      name="ios-refresh"
                      color={incentumYellow}
                      size={40}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          }
          right={addButton(() => {
            let form = ''
            switch (governance.selectedTab) {
              case SegmentTabOrder.orgs:
                form = '/orgForm'
                break
              case SegmentTabOrder.proposals:
                form = '/proposalForm'
                break
              case SegmentTabOrder.voting:
                form = '/voteProposalForm'
                break
            }
            setTimeout(() => history.push(form), 500)
          })}
          left={refreshButton(() => location.reload(true))}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                paddingTop: 10,
              }}
            >
              <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Picker
                    selectedValue={ledger.selectedLedgerIndex}
                    style={styles.picker}
                    onValueChange={(itemValue, selectedLedgerIndex) =>
                      createActionObject('ledger/changeSelectedLedgerIndex', {
                        selectedLedgerIndex,
                      })
                    }
                  >
                    {ledger.ledgers.map((ledger, index) => (
                      <Picker.Item label={`${ledger.name}`} value={index} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                paddingBottom: 10,
                paddingTop: 10,
              }}
            >
              <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Picker
                    selectedValue={governance.govIdx}
                    style={styles.picker}
                    onValueChange={(itemValue, govIdx) =>
                      dispatch({
                        type: 'governance/selectGov',
                        payload: { govIdx },
                      })
                    }
                  >
                    {governance.govs.map((g, idx) => {
                      return <Picker.Item label={`${g.name} - ${g.title}`} value={idx} />
                    })}
                  </Picker>
                </View>
              </View>
              <View>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(
                        createActionObject('governance/refreshGovs', { })
                      )
                    }
                  >
                    <View style={{ height: 40, justifyContent: 'center', marginLeft: 10 }}>
                      <Ionicons
                        name="ios-refresh"
                        color={incentumYellow}
                        size={40}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              <View>
                <TouchableOpacity
                  onPress={() => setTimeout(() => history.push('/govForm'), 500)}
                >
                  <View style={{ height: 40, justifyContent: 'center', marginLeft: 10, marginRight: 5 }}>
                    <Ionicons
                      name="ios-add-circle-outline"
                      color={incentumYellow}
                      size={40}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {view}
          </View>
        </Screen>

      </Fragment>
    )
  }
}
export const GovernanceScreen = connect((state) => ({ ledger: state.ledger, governance: state.governance }))(_GovernanceScreen)
