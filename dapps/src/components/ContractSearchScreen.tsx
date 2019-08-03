import React from 'react'
import { connect } from 'dva'
import Screen from './Screen'
import { createAction, createActionObject } from '../utils'
import { LedgerModel } from '../models/ledger'
import { incentumYellow, baseColor, placeHolderColor } from '../constants/Colors'
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import { infoButton, cancelButton } from '../commonComponents/HeaderButtons'
import { User } from 'firebase'
import { ContractModel } from '../models/contract'
import { Ionicons } from 'react-web-vector-icons'

const styles = StyleSheet.create({
  inputMiddle: {
    height: 40,
    flexGrow: 1,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    color: incentumYellow,
    marginBottom: 10,
    marginTop: 10,
    padding: 5,
    paddingLeft: 10,
  },
  inputName: {
    height: 40,
    flexGrow: 1,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    color: incentumYellow,
    marginBottom: 10,
    padding: 5,
    paddingLeft: 10,
  },
  form: {
    backgroundColor: baseColor,
    padding: 12,
  },
  wrapper: {
    padding: 10,
    backgroundColor: '#eee',
    marginTop: 5,
    borderRadius: 5,
    width: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  small: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
})

interface ContractSearchScreenProps {
  ledger: LedgerModel
  user: User
  dispatch: any
  history: any
  contract: ContractModel
}

const ContractSearchItem = ({ result, onPress }) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={() => onPress(result)}>
        <Text style={styles.title}>{result.contract.title}</Text>
        { result.contract.subtitle ? <Text style={styles.subtitle}>{result.contract.subtitle}</Text> : <View></View> }
        { result.instance ? <Text style={styles.small}>{`Instance: ${result.instance}`}</Text> : <View></View> }
      </TouchableOpacity>
    </View>
  )
}

class _ContractSearchScreen extends React.PureComponent<ContractSearchScreenProps> {

  public async exit() {
    const { history } = this.props
    // await this.view.slideOutDown(400)
    history.goBack()
}

  public render() {
    const { ledger, user, history, dispatch, contract } = this.props
    return (
      <Screen
        spinner={contract.spinner}
        title={'Contract Search'}
        left={cancelButton( async () => {
          await this.exit()
        })}
        right={infoButton(() => {
          history.push('/contractSearchInfo')
        })}
      >
            <View style={styles.form}>
                      <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingBottom: 0,
            }}
          >

              <TextInput
                style={styles.inputMiddle}
                value={`${contract.search}`}
                placeholder="Search..."
                placeholderTextColor={placeHolderColor}
                autoCorrect={false}
                onChangeText={(search) => dispatch(createAction('contract/changeSearch', { search })) }
              />
              <TouchableOpacity onPress={() => dispatch(createActionObject('contract/searchInstance', { ledger, contract }))} >
                <View style={{ justifyContent: 'center', marginRight: 5, marginLeft: 10 }}>
                  <Ionicons
                    name="ios-search"
                    color={incentumYellow}
                    size={40}
                  />
                </View>
              </TouchableOpacity>
              </View>
            </View>
            <View>
              { contract.searchResults.map((result) => <ContractSearchItem result={result} onPress={(result) => {
                history.goBack()
                dispatch(createActionObject('contract/setContractAction', { ...result, save: result }))}
              }/> )}
            </View>
      </Screen>
    )
  }
}

const ContractSearchScreen = connect((state) => ({ user: state.user.user, ledger: state.ledger, contract: state.contract }))(_ContractSearchScreen)
export default ContractSearchScreen
