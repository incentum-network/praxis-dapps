import React, { Fragment } from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'

import { connect } from 'dva'
import { MainModel } from '../../models/main'
import { UserModel } from '../../models/user'
import { LedgerModel, Ledger } from '../../models/ledger'

import { rowBackground, rowSeparator, OffWhite, baseColor, thirdBaseColor, incentumYellow, secondBaseColor } from '../../constants/Colors'
import { addButton, refreshButton } from '../../commonComponents/HeaderButtons'

import Screen from '../../components/Screen'
import CompositeLedgerDetails from './CompositeLedgerDetails'
import CompositeLedgerOutput from './CompositeLedgerOutput'
import { createAction, createActionObject } from '../../utils'
import { intersection } from 'lodash'
import * as Animatable from 'react-native-animatable'
import Accordion from 'react-native-collapsible/Accordion'
import { ContractModel, ContractSection, SaveContractAction } from '../../models/contract'
import { Ionicons } from 'react-web-vector-icons'
import { IWalletTemplate } from '@incentum/praxis-client'

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
  },
  ledgers: {
    width: 300,
  },
  contracts: {
    flex: 1,
    marginLeft: 5,
  },
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
    marginBottom: 20,
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
  subtitleText: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    paddingHorizontal: 10,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  titleText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '300',
    paddingHorizontal: 10,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  buttonText: {
    fontSize: 18,
    color: incentumYellow,
    fontWeight: '300',
    maxWidth: 300,
    paddingHorizontal: 10,
  },
  ledger: {
    fontSize: 12,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: baseColor,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    marginTop: 5,
  },
})

interface CompositeScreenProps {
  main: MainModel
  user: UserModel
  ledger: LedgerModel
  contract: ContractModel
  dispatch: any
  history: any
}

const StateView = ({ result }) => {
    return <View></View>
}

const TemplateView = ({ template, contract, dispatch, idx }: { template: IWalletTemplate, contract: ContractModel, dispatch: any, idx: number}) => {
  const title = `${template.template.name}-${template.template.versionMajor}-${template.template.versionMinor}-${template.template.versionPatch}`
  const subtitle = template.template.description
  return (
    <View style={{width: '50%', marginTop: 5, backgroundColor: baseColor}}>
      <View style={{width: '99%', backgroundColor: secondBaseColor, padding: 10}}>
          <View style={{display: 'flex', flexDirection: 'column' }}>
            <TouchableOpacity onPress={() => dispatch(createAction('contract/showContractStart', { template, idx }))} >
              <View style={{display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                <View><Text style={styles.titleText}>{title}</Text></View>
                <View><Text style={styles.subtitleText}>{subtitle}</Text></View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
    </View>
  )
}

const ContractView = ({ result, contract, dispatch }: { result: SaveContractAction, contract: ContractModel, dispatch: any}) => {
  const title = result.title
  const subtitle = result.subtitle
  return (
    <View style={{width: '50%', backgroundColor: baseColor, marginTop: 5}}>
      <View style={{width: '99%', backgroundColor: secondBaseColor, padding: 10}}>
        <View style={{display: 'flex', flexDirection: 'column' }}>
          <TouchableOpacity onPress={() => dispatch(createAction('contract/showContractAction', { result }))} >
            <View style={{display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
              <View><Text style={styles.titleText}>{title}</Text></View>
              <View><Text style={styles.subtitleText}>{subtitle}</Text></View>
            </View>
          </TouchableOpacity>
          <StateView result={result} />
        </View>
      </View>
    </View>
  )
}

class __CompositeScreen extends React.PureComponent<CompositeScreenProps> {

  public componentWillMount() {
    const { dispatch, user, history } = this.props
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
          <CompositeLedgerDetails ledger={ledger} onHeaderPress={() => { return }} />
          { filtered.map((o, i) => (
          <View style={styles.output} key={'ledgeroutput-' + i}>
          <CompositeLedgerOutput
            history={history}
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

  public renderContractHeader(section: ContractSection, _, isActive) {
    const { dispatch, history, contract } = this.props
    return (
      <View style={styles.row}>
        <Animatable.View
          duration={400}
          style={[styles.header, isActive ? styles.active : styles.inactive]}
          transition="backgroundColor"
        >
          <View style={{display: 'flex', flexDirection: 'row' }}>
            <View style={{display: 'flex', flexDirection: 'column', flex: 1 }}>
              <View><Text style={styles.headerText}>{section.title}</Text></View>
              {section.subtitle ? <View><Text style={styles.subtitle}>{section.subtitle}</Text></View> : <View></View>}
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  section.templates(contract).length > 0 ?
                    history.push('/templateSearch') :
                    history.push('/contractSearch')
                }}
              >
                <View style={{ height: 40, justifyContent: 'center', marginLeft: 40, marginRight: 5 }}>
                  <Ionicons
                    name="ios-search"
                    color={incentumYellow}
                    size={35}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>
      </View>
    )
  }

  public renderContractFooter(section: ContractSection, _, isActive) {
    const { dispatch, history, contract } = this.props
    return (
      <View style={styles.row}>
      </View>
    )
  }

  public renderContractContent(section: ContractSection, _, isActive) {
    const { dispatch, contract, history } = this.props

    return (
      <Animatable.View
        duration={400}
        style={[styles.content]}
        transition="backgroundColor"
      >
        <Animatable.View duration={400} animation={isActive ? 'slideInDown' : undefined}>
          <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 5, marginLeft: 5}}>
            { section.templates(contract).map((template: IWalletTemplate, idx) => {
              return <TemplateView template={template} contract={contract} dispatch={dispatch} idx={idx}/>

            })}
            { section.instances(contract).map((result: SaveContractAction, idx: number) => {
              return <ContractView result={result} contract={contract} dispatch={dispatch}/>
            })}
          </View>
        </Animatable.View>
      </Animatable.View>
    )
  }

  public render() {
    const { history, ledger, contract, dispatch } = this.props
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
          spinner={contract.spinner}
          title={`Praxis Smart Contracts`}
          right={ addButton(() => history.push('/addLedger'))}
          left={ refreshButton(() => location.reload(true))}
        >
          <View style={styles.container}>
            <View style={styles.ledgers}>
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
            </View>
            <View style={styles.contracts}>
              <Accordion
                activeSections={contract.activeSections}
                sections={contract.sections}
                touchableComponent={TouchableOpacity}
                expandMultiple={true}
                renderHeader={this.renderContractHeader.bind(this)}
                renderContent={this.renderContractContent.bind(this)}
                renderFooter={this.renderContractFooter.bind(this)}
                duration={400}
                onChange={(activeSections) => dispatch(createActionObject('contract/activeSections', { activeSections }))}
              />
            </View>
          </View>
      </Screen>

      </Fragment>
    )
  }
}
export const CompositeScreen = connect((state) => ({ main: state.main, user: state.user, ledger: state.ledger, contract: state.contract }))(__CompositeScreen)
