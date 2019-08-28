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

import React, { Fragment } from 'react'
import { connect } from 'dva'
import Screen from './Screen'
import { createAction, createActionObject } from '../utils'
import { LedgerModel } from '../models/ledger'
import colors, { incentumYellow, tabColor, baseColor, placeHolderColor } from '../constants/Colors'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Picker, ActivityIndicator } from 'react-native'
import { infoButton, cancelButton } from '../commonComponents/HeaderButtons'
import { User } from 'firebase'
import { FieldLabel } from './ContractStart'
import { ContractModel } from '../models/contract'
import { Ionicons } from 'react-web-vector-icons'

const styles = StyleSheet.create({
  textError: {
    paddingBottom: 10,
    color: 'red',
  },
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
  inputLast: {
    height: 40,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    color: incentumYellow,
    marginBottom: 10,
  },
  inputMiddle: {
    height: 40,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    color: incentumYellow,
    padding: 5,
  },
  inputFirst: {
    height: 40,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    color: incentumYellow,
    marginTop: 10,
  },
  mnemonic: {
    display: 'flex',
    flexDirection: 'row',
    height: 40,
  },
  mnemonicInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    flex: 1,
    color: incentumYellow,
    borderColor: incentumYellow,
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
  },
  generate: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    color: incentumYellow,
    backgroundColor: baseColor,
    borderWidth: 1,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 18,
    color: incentumYellow,
  },
  textWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    color: colors.headerTintColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconWrap: {
    marginTop: 2,
    marginLeft: 3,
  },
  form: {
    paddingTop: 20,
    backgroundColor: baseColor,
    padding: 12,
  },
  picker: {
    height: 40,
    width: '100%',
    color: incentumYellow,
    backgroundColor: baseColor,
    borderRadius: 5,
    paddingLeft: 10,
    borderColor: incentumYellow,
    flexGrow: 1,
  },
})

interface AddLedgerScreenProps {
  ledger: LedgerModel
  user: User
  dispatch: any
  history: any
  contract: ContractModel
}

const segmented = [
  'Restore Wallet',
]

interface AddLedgerScreenState {
  loading: boolean
}

enum SegmentOrder {
  restore = 0,
  import = 1,
}

function errorMsg(msg) {
  if (msg) {
    return <Text style={styles.textError}>{msg}</Text>
  } else {
    return <Fragment></Fragment>
  }
}

class _AddLedgerScreen extends React.PureComponent<AddLedgerScreenProps, AddLedgerScreenState> {

  public state = {
    loading: false,
  }
  public componentWillMount() {
    const { dispatch, user, ledger, history } = this.props
    // dispatch(createAction('ledger/fetchFiles'))
    // dispatch(createActionObject('ledger/loadLedgerFiles', { user }))
    // if (!ledger.warningRead && ledger.ledgers.length <= 0) {
    //   setTimeout(() => history.push('/warnLedger'), 1000)
    // }
  }

  public async exit() {
    const { history, dispatch } = this.props
    this.setState((state) => {
      return {
        ...state,
        loading: false,
      }
    })
    setTimeout(() => history.goBack(), 1000)
  }

  public setLoading() {
    const { history } = this.props
    this.setState((state) => {
      return {
        ...state,
        loading: true,
      }
    })
  }

  public render() {
    const { ledger, user, dispatch, history, contract } = this.props
    return (
      <Screen
        title={'Add Ledger'}
        left={cancelButton( async () => {
          await this.exit()
        })}
        right={infoButton(() => {
          history.push('/warnLedger')
        })}
        titleComponent={
          <SegmentedControlTab
            values={segmented}
            tabTextStyle={styles.tabText}
            tabStyle={styles.tabs}
            activeTabTextStyle={styles.activeTabText}
            activeTabStyle={styles.activeTabs}
            selectedIndex={ledger.selectedAddLedgerIndex}
            onTabPress={(selectedAddLedgerIndex) => { dispatch(createAction('ledger/changeSelectedAddLedgerIndex', { selectedAddLedgerIndex })) }}
          />
        }
      >
        { ledger.selectedAddLedgerIndex === SegmentOrder.import &&
            <View style={styles.form}>
              <FieldLabel label={'Select a File'} />
              <Picker
                style={styles.picker}
                selectedValue={ledger.selectedLedgerFileIndex}
                onValueChange={index => { dispatch(createActionObject('ledger/changeSelectedLedgerFileIndex', { selectedLedgerFileIndex: index }))}}
              >
                { ledger.ledgerFiles.map((ledgerFile, index) => <Picker.Item label={ledgerFile.name} value={index} />) }
              </Picker>
              <TextInput
                style={styles.inputFirst}
                secureTextEntry={true}
                value={ledger.password}
                placeholder="Enter Password..."
                placeholderTextColor={placeHolderColor}
                autoCorrect={false}
                onChangeText={(password) => dispatch(createAction('ledger/changePassword', { password })) }
              />
              {errorMsg(ledger.errorPassword)}
              <TouchableOpacity onPress={() => dispatch(createAction('ledger/importSelectedFile', { user, done: () => this.exit()}))}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Import</Text>
                </View>
              </TouchableOpacity>
            </View> ||
          ledger.selectedAddLedgerIndex === SegmentOrder.restore &&
          <View style={styles.form}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <TextInput
              style={styles.mnemonicInput}
              value={ledger.mnemonic}
              placeholder="Enter Passphrase..."
              placeholderTextColor={placeHolderColor}
              secureTextEntry={ledger.mnemonicHide}
              autoCorrect={false}
              onChangeText={(mnemonic) => dispatch(createAction('ledger/changeMnemonic', { mnemonic })) }
            />
            <TouchableOpacity onPress={() => dispatch(createAction('ledger/toggleMnemonic')) }>
              <View style={{ height: 40, justifyContent: 'center', marginLeft: 10, marginRight: 5 }}>
                <Ionicons
                  name={ledger.mnemonicHide ? 'ios-eye' : 'ios-eye-off'}
                  color={incentumYellow}
                  size={40}
                />
              </View>
            </TouchableOpacity>
          </View>
          {errorMsg(ledger.errorMnemonic)}
          <TextInput
            style={styles.inputFirst}
            value={ledger.ledgerName}
            placeholder="Your name for this wallet..."
            placeholderTextColor={placeHolderColor}
            autoCorrect={false}
            onChangeText={(ledgerName) => dispatch(createAction('ledger/changeLedgerName', { ledgerName })) }
          />
          {errorMsg(ledger.errorName)}
          <TextInput
            style={styles.inputLast}
            value={ledger.description}
            placeholder="Your short description for this wallet..."
            placeholderTextColor={placeHolderColor}
            autoCorrect={false}
            onChangeText={(description) => dispatch(createAction('ledger/changeDescription', { description })) }
          />
          <TouchableOpacity onPress={() => dispatch(createActionObject('ledger/restoreWallet', { user, done: () => this.exit()})) }>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Create Wallet</Text>
            </View>
          </TouchableOpacity>
          <ActivityIndicator style={{marginTop: 10}} animating={this.state.loading} />
        </View>
    }
      </Screen>
    )
  }
}

const AddLedgerScreen = connect((state) => ({ user: state.user.user, ledger: state.ledger, contract: state.contract }))(_AddLedgerScreen)
export default AddLedgerScreen
