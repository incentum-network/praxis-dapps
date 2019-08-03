import React from 'react'
import { connect } from 'dva'
import { orderBy, uniqBy, uniq } from 'lodash'

import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { Ledger, LedgerModel, Tag } from '../models/ledger'
import { createActionObject, createAction } from '../utils'
import { incentumYellow, OffWhite, baseColor, placeHolderColor, thirdBaseColor } from '../constants/Colors'
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

export interface LedgerDetailsProps {
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

class _LedgerDetails extends React.Component<LedgerDetailsProps> {
  public multiSelect

  public render() {
    const { ledger, model, dispatch } = this.props
    const tags = ledger.outputs.reduce((prev, current, idx, outputs) => prev.concat(current.tags), [] as string[]).filter((t) => t.trim().length > 0)
    const sorted = orderBy(uniq(tags), [tag => tag.toLowerCase()])
    const tagsSorted = sorted.map((tag) => ({ tag, label: tag, value: tag}))

    const ledgername = `${ledger.username || ledger.ledger}`
    const ledgerhead = ledger.balance ? `${ledgername} - ${ledger.balance}` : ledgername
    return (
      <View style={styles.container}>
        <View style={styles.ledgerContainer}>
          <div style={{
            backgroundColor: thirdBaseColor,
            fontSize: 14,
            borderWidth: 0,
            color: OffWhite,
            fontStyle: 'italic',
            textAlign: 'center',
            paddingBottom: 10,
            paddingTop: 10,
          }}
        >{ledgerhead}</div>
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
          <View style={{ height: 30, justifyContent: 'center', marginLeft: 10, marginRight: 5, marginTop: 5 }}>
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
  amountInput: {
    height: 30,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    marginTop: 5,
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
    flex: 1,
    width: '100%',
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

const LedgerDetails = connect((state) => ({ model: state.ledger }))(_LedgerDetails)

export default LedgerDetails
