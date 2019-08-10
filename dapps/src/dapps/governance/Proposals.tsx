import React from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'

import { connect } from 'dva'
import { LedgerModel, getLedger } from '../../models/ledger'

import {
  rowBackground,
  rowSeparator,
  OffWhite,
  thirdBaseColor,
  incentumYellow,
  secondBaseColor,
  tabColor,
  markdownBackground
} from '../../constants/Colors'
import Markdown from 'react-markdown'

import { createActionObject, ScreenWidth, isMobileDevice } from '../../utils'
import { GovernanceModel, Proposal, getMember, getProposals } from './model'
import * as Animatable from 'react-native-animatable'
import Accordion from 'react-native-collapsible/Accordion'
import { Ionicons } from 'react-web-vector-icons'

const ProposalDetails = (props) => {
  const { proposal, dispatch, ledger }: { proposal: Proposal, dispatch: any, ledger: LedgerModel} = props
  const current = getLedger(ledger)
  return (
    <View style={styles.content}>
    <View style={styles.col}>
      <View style={styles.row}>
        <View style={styles.markdown}>
          <Markdown source={proposal.description} />
        </View>
      </View>
    </View>
    </View>
  )
}

interface ProposalProps {
  history: any
  dispatch: any
  ledger: LedgerModel
  governance: GovernanceModel
}

class _Proposals extends React.PureComponent<ProposalProps> {

  public componentWillMount() {
    const { dispatch, history } = this.props
  }

  public renderHeader(proposal: Proposal, _, isActive) {
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

  public renderContent(proposal: Proposal, _, isActive) {
    console.log('proposal render content', proposal)
    return (
      <Animatable.View
        duration={400}
        style={[styles.content]}
        transition="backgroundColor"
      >
        <Animatable.View duration={400} animation={isActive ? 'slideInDown' : undefined}>
          <ProposalDetails proposal={proposal} {...this.props} />
        </Animatable.View>
      </Animatable.View>
    )
  }

  public renderFooter(proposal: Proposal, _, isActive) {
    return (
      <View style={styles.accordRow}>
      </View>
    )
  }

  public render() {
    const { history, ledger, governance, dispatch } = this.props
    return (
      <View style={styles.container}>
        <Accordion
          activeSections={governance.proposalSections}
          sections={getProposals(governance)}
          touchableComponent={TouchableOpacity}
          expandMultiple={true}
          renderHeader={this.renderHeader.bind(this)}
          renderContent={this.renderContent.bind(this)}
          renderFooter={this.renderFooter.bind(this)}
          duration={400}
          onChange={(proposalSections) => dispatch(createActionObject('governance/proposalSections', { proposalSections }))}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
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

export const Proposals = connect((state) => ({ ledger: state.ledger, governance: state.governance }))(_Proposals)
