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
import { Text, View, TouchableOpacity, StyleSheet, Picker } from 'react-native'

import { connect } from 'dva'
import { LedgerModel, getLedger } from '../../models/ledger'

import {
  rowBackground,
  rowSeparator,
  OffWhite,
  thirdBaseColor,
  incentumYellow,
  secondBaseColor,
  markdownBackground,
  baseColor
} from '../../constants/Colors'
import Markdown from 'react-markdown'

import { createActionObject, ScreenWidth, isMobileDevice } from '../../utils'
import { GovernanceModel, VoteProposal, getVoteProposals, getOrgs, getProposals, getOrgIdx, getProposalIdx } from './model'
import * as Animatable from 'react-native-animatable'
import Accordion from 'react-native-collapsible/Accordion'
import { Ionicons } from 'react-web-vector-icons'

const VoteProposalDetails = (props) => {
  const { voteProposal, ledger, history }: { voteProposal: VoteProposal, ledger: LedgerModel, history: any} = props
  const current = getLedger(ledger)
  return (
    <View style={styles.content}>
      <View style={styles.col}>
        <View style={styles.row}>
          <View style={[styles.col, { padding: 10 }]}>
            <View style={styles.row}>
              <Text style={styles.textLeft}>{`Voting Stake`}</Text>
              <Text style={styles.text}>{`${voteProposal.stake} PRAX`}</Text>
            </View>
            <View style={styles.row}>
            </View>
          </View>
          <View style={[styles.right, { justifyContent: 'center' }]}>
            <TouchableOpacity
              onPress={() => setTimeout(() => history.push('/voteForm', { voteProposal }), 500)}
            >
              <View style={{ height: 40, justifyContent: 'center', marginRight: 10 }}>
                <Ionicons
                  name="ios-trophy"
                  color={incentumYellow}
                  size={40}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.markdown}>
            <Markdown source={voteProposal.description} />
          </View>
        </View>
      </View>
    </View>
  )
}

interface VoteProposalProps {
  history: any
  dispatch: any
  ledger: LedgerModel
  governance: GovernanceModel
}

class _VoteProposals extends React.PureComponent<VoteProposalProps> {

  public componentWillMount() {
    const { dispatch, history } = this.props
  }

  public renderHeader(proposal: VoteProposal, _, isActive) {
    return (
      <View style={styles.accordRow}>
        <Animatable.View
          duration={400}
          style={[styles.header, isActive ? styles.active : styles.inactive]}
          transition="backgroundColor"
        >
          <View>
            <Text style={styles.headerText}>{proposal.title}</Text>
            <Text style={styles.subtitleText}>{proposal.subtitle}</Text>
          </View>
        </Animatable.View>
      </View>
    )
  }

  public renderContent(vote: VoteProposal, _, isActive) {
    console.log('proposal render content', vote)
    return (
      <Animatable.View
        duration={400}
        style={[styles.content]}
        transition="backgroundColor"
      >
        <Animatable.View duration={400} animation={isActive ? 'slideInDown' : undefined}>
          <VoteProposalDetails voteProposal={vote} {...this.props} />
        </Animatable.View>
      </Animatable.View>
    )
  }

  public renderFooter(vote: VoteProposal, _, isActive) {
    return (
      <View style={styles.accordRow}>
      </View>
    )
  }

  public render() {
    const { history, ledger, governance, dispatch } = this.props
    return (
      <View style={styles.topContainer}>
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
                  selectedValue={getOrgIdx(governance)}
                  style={styles.picker}
                  onValueChange={(orgIdx, _) =>
                    dispatch({
                      type: 'governance/selectOrg',
                      payload: { orgIdx },
                    })
                  }
                >
                  <Picker.Item label="Select Org" value={-1}></Picker.Item>
                  {getOrgs(governance).map((o, idx) => {
                    return <Picker.Item label={`${o.title}`} value={idx} />
                  })}
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
                  selectedValue={getProposalIdx(governance)}
                  style={styles.picker}
                  onValueChange={(proposalIdx, _) =>
                    dispatch({
                      type: 'governance/selectProposal',
                      payload: { proposalIdx },
                    })
                  }
                >
                  <Picker.Item label="Select Proposal" value={-1}></Picker.Item>
                  {getProposals(governance).map((p, idx) => {
                    return <Picker.Item label={`${p.title}`} value={idx} />
                  })}
                </Picker>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <Accordion
            activeSections={governance.voteSections}
            sections={getVoteProposals(governance)}
            touchableComponent={TouchableOpacity}
            expandMultiple={true}
            renderHeader={this.renderHeader.bind(this)}
            renderContent={this.renderContent.bind(this)}
            renderFooter={this.renderFooter.bind(this)}
            duration={400}
            onChange={(voteSections) => dispatch(createActionObject('governance/voteSections', { voteSections }))}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: secondBaseColor,
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: secondBaseColor,
  },
  topContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: baseColor,
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: secondBaseColor,
  },
  content: {
    padding: 10,
    width: '100%',
    display: 'flex',
    alignSelf: 'center',
    flexDirection: 'column',
    backgroundColor: secondBaseColor,
    minWidth: isMobileDevice ? ScreenWidth : 600,
    maxWidth: isMobileDevice ? ScreenWidth : 700,
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  center: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  markdown: {
    borderRadius: 10,
    backgroundColor: markdownBackground,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  accordRow: {
    borderBottomWidth: 1,
    borderBottomStyle: `solid`,
    borderBottomColor: `${rowSeparator}`,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
  textLeft: {
    fontSize: 16,
    color: 'white',
    minWidth: 150,
  },
  textRight: {
    fontSize: 16,
    color: 'white',
  },
  header: {
    backgroundColor: rowBackground,
    padding: 10,
  },
  active: {
    backgroundColor: thirdBaseColor,
  },
  inactive: {
    backgroundColor: thirdBaseColor,
  },
  subtitleText: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})

export const VoteProposals = connect((state) => ({ ledger: state.ledger, governance: state.governance }))(_VoteProposals)
