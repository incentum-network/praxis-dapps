import React from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'

import { connect } from 'dva'
import { LedgerModel } from '../../models/ledger'

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
import { GovernanceModel } from './model'
import * as Animatable from 'react-native-animatable'
import Accordion from 'react-native-collapsible/Accordion'
import { OrgDoc } from '../../shared/governance'

const OrgDetails = (props) => {
  const { org }: { org: OrgDoc} = props
  return (
    <View style={styles.content}>
      <Text style={styles.headerText}>{org.symbol}</Text>
      <Text style={styles.subtitle}>{org.owner}</Text>
      <View style={styles.centered}>
        <View style={styles.gridRow}>
          <Text style={styles.textLeft}>{`Fee to join:`}</Text>
          <Text style={styles.text}>{`${org.joinFee} PRAX`}</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.textLeft}>{`Stake to join:`}</Text>
          <Text style={styles.text}>{`${org.joinStake} PRAX`}</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.textLeft}>{`Vote proposal fee:`}</Text>
          <Text style={styles.text}>{`${org.voteProposalFee} PRAX`}</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.textLeft}>{`Tokens for joining:`}</Text>
          <Text style={styles.text}>{`${org.joinTokens} ${org.symbol}`}</Text>
        </View>
      </View>
      <View style={styles.centered}>
        <View style={styles.markdown}>
          <Markdown source={org.description} />
        </View>
      </View>
    </View>
  )
}

interface OrgsProps {
  history: any
  dispatch: any
  ledger: LedgerModel
  governance: GovernanceModel
}

const segmented = [
  'Orgs', 'Proposals', 'Voting',
]

class _Orgs extends React.PureComponent<OrgsProps> {

  public componentWillMount() {
    const { dispatch, history } = this.props
  }

  public renderHeader(org: OrgDoc, _, isActive) {
    console.log('org', org)
    return (
      <View style={styles.row}>
        <Animatable.View
          duration={400}
          style={[styles.header, isActive ? styles.active : styles.inactive]}
          transition="backgroundColor"
        >
          <View>
            <Text style={styles.headerText}>{org.title}</Text>
            <Text style={styles.subtitle}>{org.subtitle}</Text>
          </View>
        </Animatable.View>
      </View>
    )
  }

  public renderContent(org: OrgDoc, _, isActive) {
    const { dispatch, history, governance } = this.props

    return (
      <Animatable.View
        duration={400}
        style={[styles.content]}
        transition="backgroundColor"
      >
        <Animatable.View duration={400} animation={isActive ? 'slideInDown' : undefined}>
          <OrgDetails org={org} />
        </Animatable.View>
      </Animatable.View>
    )
  }

  public renderFooter(org: OrgDoc, _, isActive) {
    return (
      <View style={styles.row}>
      </View>
    )
  }

  public render() {
    const { history, ledger, governance, dispatch } = this.props
    return (
      <View style={styles.container}>
        <Accordion
          activeSections={governance.activeSections}
          sections={governance.orgs}
          touchableComponent={TouchableOpacity}
          expandMultiple={true}
          renderHeader={this.renderHeader.bind(this)}
          renderContent={this.renderContent.bind(this)}
          renderFooter={this.renderFooter.bind(this)}
          duration={400}
          onChange={(activeSections) => dispatch(createActionObject('governance/activeSections', { activeSections }))}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  centered: {
    alignSelf: 'center',
    padding: 10,
  },
  content: {
    padding: 10,
    width: '100%',
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
  activeTabs: {
    backgroundColor: incentumYellow,
  },
  markdown: {
    borderRadius: 10,
    minWidth: isMobileDevice ? ScreenWidth : 600,
    maxWidth: 700,
    backgroundColor: markdownBackground,
    paddingLeft: 20,
    paddingRight: 20,
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
  gridRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  row: {
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
    // textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  textLeft: {
    fontSize: 16,
    color: 'white',
    minWidth: 150,
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
  address: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})

export const Orgs = connect((state) => ({ ledger: state.ledger, governance: state.governance }))(_Orgs)
