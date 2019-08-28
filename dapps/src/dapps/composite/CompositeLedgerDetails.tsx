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
import { connect } from 'dva'
import { orderBy, uniq } from 'lodash'
import { View, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native'
import { Ledger, LedgerModel } from '../../models/ledger'
import { createActionObject, createAction } from '../../utils'
import { incentumYellow, baseColor, placeHolderColor, thirdBaseColor, OffWhite } from '../../constants/Colors'
import Select from 'react-select'
import { Ionicons } from 'react-web-vector-icons'

const LedgerRow = ({ children }) => (
  <View
    style={[
      styles.walletRow,
      { justifyContent: Array.isArray(children) ? 'space-between' : 'center' },
    ]}
  >
    {children}
  </View>
)

export interface CompositeLedgerDetailsProps {
  ledger: Ledger
  model: LedgerModel
  onHeaderPress: () => void
  dispatch: any
}

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#666' : '#222',
    padding: 5,
  }),
  control: (base, state) => ({
    ...base,
    color: incentumYellow,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopColor: 'transparent',
    borderLeftColor: incentumYellow,
    borderRightColor: incentumYellow,
    borderBottomColor: incentumYellow,
    backgroundColor: 'transparent',
  }),
  menuList: (base, state) => ({
    ...base,
    color: incentumYellow,
    backgroundColor: baseColor,
  }),
  menu: (base, state) => ({
    ...base,
    color: incentumYellow,
    backgroundColor: baseColor,
  }),
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      color: incentumYellow,
      borderColor: incentumYellow,
      backgroundColor: thirdBaseColor,
    }
  },
  placeholder: (styles, { data }) => {
    return {
      ...styles,
      color: '#ccc',
    }
  },
  dropdownIndicator: (styles, { data }) => {
    return {
      ...styles,
      color: incentumYellow,
    }
  },
  indicatorSeparator: (styles, { data }) => {
    return {
      ...styles,
      color: incentumYellow,
    }
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: incentumYellow,
  }),
}

class _CompositeLedgerDetails extends React.Component<CompositeLedgerDetailsProps> {

  public render() {
    const { ledger, model, dispatch } = this.props
    const tags = ledger.outputs.reduce((prev, current, idx, outputs) => prev.concat(current.tags), [] as string[]).filter((t) => t.trim().length > 0)
    const sorted = orderBy(uniq(tags), [tag => tag.toLowerCase()])
    const tagsSorted = sorted.map((tag) => ({ tag, label: tag, value: tag}))

    const ledgername = `${ledger.username && ledger.username !== 'undefined' ? ledger.username : ledger.ledger}`
    const ledgerbalance = ledger.balance ? ledger.balance.toFormat() : ''
    return (
      <View style={{
        flex: 1,
        width: '100%',
        backgroundColor: thirdBaseColor,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 400,
      }}>
        <View style={{width: '100%'}}>
          <Text style={styles.account}>{ledgername}</Text>
        </View>
        <View style={{width: '100%'}}>
          <Text style={styles.balance}>{`${ledgerbalance}`}</Text>
        </View>
          <View style={{display: 'flex', flexDirection: 'row', backgroundColor: thirdBaseColor, alignSelf: 'center'}}>
            <TextInput
              style={styles.amountInput}
              value={`${model.amount}`}
              placeholder="Transfer Amount..."
              placeholderTextColor={placeHolderColor}
              autoCorrect={false}
              onChangeText={(amount) => { dispatch(createAction('ledger/changeAmount', { amount }))} }
            />

            <TouchableOpacity
              onPress={() =>
                dispatch(
                  createActionObject('ledger/accountToOutput', { ledger })
                )
              }
            >
            <View style={{ height: 30, justifyContent: 'center', marginLeft: 10, marginRight: 5 }}>
              <Ionicons
                name="ios-add-circle-outline"
                color={incentumYellow}
                size={30}
              />
            </View>
          </TouchableOpacity>
        </View>

      <View style={styles.wrapper}>
        <div style={{width: '100%', zIndex: 1000}}>
          <Select
            isMulti={true}
            options={tagsSorted}
            placeholder={'Filter Outputs...'}
            styles={customStyles}
            value={model.selectedTags}
            onChange={(selectedTags) => {
              dispatch(createActionObject('ledger/selectTags', { selectedTags }))
            }}
          />
        </div>
        <TouchableOpacity
          onPress={() =>
            dispatch(
              createActionObject('ledger/refreshOutputs', { ledger })
            )
          }
        >
          <View style={{ height: 35, justifyContent: 'center', marginLeft: 10, marginRight: 5 }}>
            <Ionicons
              name="ios-refresh"
              color={incentumYellow}
              size={35}
            />
          </View>
        </TouchableOpacity>

      </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  account: {
    width: '100%',
    backgroundColor: thirdBaseColor,
    fontSize: 12,
    borderWidth: 0,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: 5,
    paddingTop: 10,
  },
  balance: {
    width: '100%',
    backgroundColor: thirdBaseColor,
    fontSize: 14,
    borderWidth: 0,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBottom: 5,
  },
  amountInput: {
    height: 30,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    marginBottom: 10,
    marginLeft: 10,
    color: incentumYellow,
    borderColor: incentumYellow,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 400,
  },
  ledgerContainer: {
    backgroundColor: thirdBaseColor,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 400,
  },
  wrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: baseColor,
    display: 'flex',
    flexDirection: 'row',
    zIndex: 2000,
    paddingLeft: 5,
    paddingRight: 5,
  },
  walletRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  name: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400',
  },
})

const CompositeLedgerDetails = connect((state) => ({ model: state.ledger }))(_CompositeLedgerDetails)

export default CompositeLedgerDetails
