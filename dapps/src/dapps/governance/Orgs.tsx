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
import { GovernanceModel, Org, getMember, getOrgs } from './model'
import * as Animatable from 'react-native-animatable'
import Accordion from 'react-native-collapsible/Accordion'
import { Ionicons } from 'react-web-vector-icons'

const OrgDetails = (props) => {
  const { org, dispatch, ledger }: { org: Org, dispatch: any, ledger: LedgerModel} = props
  const current = getLedger(ledger)
  const member = current && getMember(current.ledger, org)
  return (
    <View style={styles.content}>
    <View style={styles.col}>
      <Text style={styles.headerText}>{org.symbol}</Text>
      <Text style={styles.subtitleText}>{org.owner}</Text>
      <View style={styles.row}>
        <View style={[styles.col, {padding: 10}]}>
          <View style={styles.row}>
            <Text style={styles.textLeft}>{`Fee to join:`}</Text>
            <Text style={styles.text}>{`${org.joinFee} PRAX`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textLeft}>{`Tokens for joining:`}</Text>
            <Text style={styles.text}>{`${org.joinTokens} ${org.symbol}`}</Text>
          </View>
        </View>
        <View style={[styles.right, { justifyContent: 'center'}]}>
          {!!member ?
              <TouchableOpacity
                onPress={() =>
                  dispatch(
                    createActionObject('governance/showMember', { member })
                  )
                }
              >
                <View style={{ height: 40, justifyContent: 'center', marginRight: 10 }}>
                  <Ionicons
                    name="ios-person"
                    color={incentumYellow}
                    size={40}
                  />
                </View>
              </TouchableOpacity>
              :
              <TouchableOpacity
                onPress={() =>
                  dispatch(
                    createActionObject('governance/joinOrg', { org })
                  )
                }
              >
                <View style={{ height: 40, justifyContent: 'center', marginRight: 10 }}>
                  <Ionicons
                    name="ios-person-add"
                    color={incentumYellow}
                    size={40}
                  />
                </View>
              </TouchableOpacity>
        }
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.markdown}>
          <Markdown source={org.description} />
        </View>
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

class _Orgs extends React.PureComponent<OrgsProps> {

  public componentWillMount() {
    const { dispatch, history } = this.props
  }

  public renderHeader(org: Org, _, isActive) {
    return (
      <View style={styles.accordRow}>
        <Animatable.View
          duration={400}
          style={[styles.header, isActive ? styles.active : styles.inactive]}
          transition="backgroundColor"
        >
          <View>
            <Text style={styles.headerText}>{org.title}</Text>
            <Text style={styles.subtitleText}>{org.subtitle}</Text>
          </View>
        </Animatable.View>
      </View>
    )
  }

  public renderContent(org: Org, _, isActive) {
    return (
      <Animatable.View
        duration={400}
        style={[styles.content]}
        transition="backgroundColor"
      >
        <Animatable.View duration={400} animation={isActive ? 'slideInDown' : undefined}>
          <OrgDetails org={org} {...this.props} />
        </Animatable.View>
      </Animatable.View>
    )
  }

  public renderFooter(org: Org, _, isActive) {
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
          activeSections={governance.orgSections}
          sections={getOrgs(governance)}
          touchableComponent={TouchableOpacity}
          expandMultiple={true}
          renderHeader={this.renderHeader.bind(this)}
          renderContent={this.renderContent.bind(this)}
          renderFooter={this.renderFooter.bind(this)}
          duration={400}
          onChange={(orgSections) => dispatch(createActionObject('governance/orgSections', { orgSections }))}
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
    minWidth: isMobileDevice ? '100%' : 600,
    maxWidth: isMobileDevice ? '100%' : 700,
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

export const Orgs = connect((state) => ({ ledger: state.ledger, governance: state.governance }))(_Orgs)
