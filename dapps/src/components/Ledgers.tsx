import React, { Fragment } from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'

import { connect } from 'dva'
import { MainModel } from '../models/main'
import { UserModel } from '../models/user'
import { LedgerModel, Ledger } from '../models/ledger'
import { OutputJson } from '@incentum/praxis-interfaces'

import { rowBackground, rowSeparator, OffWhite, baseColor, thirdBaseColor } from '../constants/Colors'
import { addButton, refreshButton } from '../commonComponents/HeaderButtons'

import Screen from './Screen'
import LedgerDetails from './LedgerDetails'
import LedgerOutput from './LedgerOutput'
import { createAction, createActionObject } from '../utils'
import { intersection } from 'lodash'
import * as Animatable from 'react-native-animatable'
import Accordion from 'react-native-collapsible/Accordion'
import { NotLoggedIn } from './NotLoggedIn'
import { ContractModel } from '../models/contract'

interface LedgerDropdownProps {
  navigation: any
  ledger: LedgerModel
}

const styles = StyleSheet.create({
  textWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: 200,
  },
  iconWrap: {
    marginTop: 2,
    marginLeft: 3,
  },
  output: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: baseColor,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 20,
  },
  header: {
    backgroundColor: rowBackground,
    padding: 10,
  },
  row: {
    backgroundColor: rowBackground,
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
  content: {
    backgroundColor: baseColor,
  },
  active: {
    backgroundColor: thirdBaseColor,
  },
  inactive: {
    backgroundColor: thirdBaseColor,
  },
  selectors: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selector: {
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  activeSelector: {
    fontWeight: 'bold',
  },
  selectTitle: {
    fontSize: 14,
    fontWeight: '500',
    padding: 10,
  },
  multipleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
    alignItems: 'center',
  },
  multipleToggle__title: {
    fontSize: 16,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  ledger: {
    fontSize: 12,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})

interface LedgerNavigationParams {
  ledger: LedgerModel
  isLedgerDropdownVisible: boolean
  selectedLedgerId: number
  output: OutputJson
}

interface LedgersScreenProps {
  main: MainModel
  user: UserModel
  ledger: LedgerModel
  dispatch: any
  history: any
  contract: ContractModel
}

class __LedgersScreen extends React.PureComponent<LedgersScreenProps> {

  public componentWillMount() {
    const { dispatch, user, history } = this.props
    // dispatch(createActionObject('ledger/loadLedgerFiles', { user: user.user }))
  }

  public renderHeader(ledger: Ledger, _, isActive) {
    return (
      <View style={styles.row}>
        <Animatable.View
          duration={400}
          style={[styles.header, isActive ? styles.active : styles.inactive]}
          transition="backgroundColor"
        >
          <View>
            <Text style={styles.headerText}>{ledger.name}</Text>
            {ledger.subtitle ? <Text style={styles.subtitle}>{ledger.subtitle}</Text> : <View></View>}
          </View>
        </Animatable.View>
      </View>
    )
  }

  public renderFooter(ledger: Ledger, _, isActive) {
    return (
      <View style={styles.row}>
      </View>
    )
  }

  public renderContent(ledger: Ledger, _, isActive) {
    const { dispatch, history } = this.props
    const model = this.props.ledger
    const onCoinPress = (output, coin) => { dispatch(createAction('ledger/coinSelected', { output, coin }))  }
    const onOutputHeaderPress = (output) => { dispatch(createAction('contract/outputSelected', { output }))  }
    const onOutputToAccountPress = (output) => { dispatch(createAction('contract/outputToAccount', { output }))  }

    const filtered = model.selectedTags.length === 0 ? ledger.outputs : ledger.outputs.filter((o) => intersection(o.tags, model.selectedTags.map((t) => t.tag)).length > 0)
    return (
      <Animatable.View
        duration={400}
        style={[styles.content]}
        transition="backgroundColor"
      >
        <Animatable.View duration={400} animation={isActive ? 'slideInDown' : undefined}>
          <LedgerDetails ledger={ledger} onHeaderPress={() => { return }} />
          { filtered.map((o, i) => (
          <View style={styles.output} key={'ledgeroutput-' + i}>
          <LedgerOutput
            output={o}
            key={`${o.ledger}-${i}`}
            onHeaderPress={(output) => onOutputHeaderPress(output)}
            onCoinPress={(output, coin) => onCoinPress(output, coin)}
            onOutputToAccountPress={(output) => onOutputToAccountPress(output)}
          />
          </View>
          ))}
        </Animatable.View>
      </Animatable.View>
    )
  }

  public render() {
    const { history, ledger, user, dispatch, contract } = this.props
    const onLedgerHeaderPress = () => { return }
    let ledgers = ledger.ledgers
    if (ledgers.length === 0) {
      ledgers = [{
        ledger: '',
        mnemonic: '',
        name: 'Please create a wallet',
        subtitle: 'Please create a wallet by tapping the plus button (top right)',
        account: 0,
        outputs: [],
      }]
    }

    return (
      <Fragment>
        <Screen
          title={`Wallets`}
          spinner={contract.spinner}
          right={ addButton(() => history.push('/addLedger'))}
          left={ refreshButton(() => location.reload(true))}
        >
          { !user.unauthorize &&
            <Accordion
              activeSections={ledger.activeSections}
              sections={ledgers}
              touchableComponent={TouchableOpacity}
              expandMultiple={true}
              renderHeader={this.renderHeader.bind(this)}
              renderContent={this.renderContent.bind(this)}
              renderFooter={this.renderFooter.bind(this)}
              duration={400}
              onChange={(activeSections) => dispatch(createActionObject('ledger/activeSections', { activeSections }))}
            />
          }
          {user.unauthorize && <NotLoggedIn />}
      </Screen>
      </Fragment>
    )
  }
}
export const _LedgersScreen = connect((state) => ({ main: state.main, user: state.user, ledger: state.ledger, contract: state.contract }))(__LedgersScreen)
