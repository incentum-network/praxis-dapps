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
import { View, StyleSheet, Text, Picker, TouchableOpacity, TextInput } from 'react-native'

import colors, { incentumYellow, baseColor, thirdBaseColor, placeHolderColor } from '../constants/Colors'
import { ContractModel, getReducers, getFirstCoinDisplay, formContext } from '../models/contract'
import { createActionObject, createAction } from '../utils'
import { Ionicons } from 'react-web-vector-icons'
import Form from 'react-jsonschema-form'
import { LedgerModel } from '../models/ledger'
import CreatableSelect from 'react-select/lib/Creatable'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import Markdown from 'react-markdown'
import ContractInstance from './ContractInstance'
import { UserModel } from '../models/user'

const styles = StyleSheet.create({
  activeTabs: {
    backgroundColor: incentumYellow,
  },
  tabs: {
    height: 40,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: baseColor,
    color: incentumYellow,
    borderColor: incentumYellow,
  },
  tabText: {
    paddingLeft: 10,
    paddingRight: 10,
    color: incentumYellow,
  },
  activeTabText: {
    color: 'black',
  },
  label: {
    color: incentumYellow,
    fontSize: 16,
    paddingBottom: 5,
    paddingLeft: 1,
    alignItems: 'flex-start',
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
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
  },
  detail: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 12,
  },
  output: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 12,
  },
  picker: {
    height: 40,
    width: '100%',
    color: incentumYellow,
    backgroundColor: baseColor,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 5,
    borderColor: incentumYellow,
  },
  inputName: {
    height: 40,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    paddingLeft: 10,
    width: '100%',
    marginBottom: 10,
    color: incentumYellow,
  },
  outputPicker: {
    height: 40,
    borderRadius: 5,
  },
  widget: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
})

interface ContractsScreenProps {
  contract: ContractModel
  ledger: LedgerModel
  user: UserModel
  dispatch: any
  history: any
}

export function FieldLabel(props) {
  return (
    <Text style={styles.label}>
      {props.label}
    </Text>
  )
}

class OutputWidget extends React.Component<any, any> {

  public render() {
    const { formContext, onChange, value } = this.props
    return (
      <View style={styles.widget}>
        <Picker
          selectedValue={value}
          style={styles.outputPicker}
          onValueChange={(itemValue, itemIndex) => {
            onChange(itemValue)
          }}
        >
          <Picker.Item label={`Select an output...`} value={'Select an output'} />
          {formContext.outputs.map((t, idx) => (
            <Picker.Item label={`${t.title} - ${t.output.title}${getFirstCoinDisplay(t.output)}`} value={`${t.output.key}`} />
          ))}
        </Picker>
      </View>
    )
  }
}

const widgets = {
  praxOutputs: OutputWidget,
}

function getUISchema(contract: ContractModel): string {
  if (contract.schemasIdx < 0) { return '{}'}
  const schema = contract.schemas[contract.schemasIdx]
  return schema.uiSchema
}

function getUISchemaAsObject(contract: ContractModel): object {
  try {
    return JSON.parse(getUISchema(contract))
  } catch {
    return {}
  }
}

function getJsonSchema(contract: ContractModel): string {
  if (contract.schemasIdx < 0) { return '{}'}
  const schema = contract.schemas[contract.schemasIdx]
  return schema.jsonSchema
}

function getJsonSchemaAsObject(contract: ContractModel): object {
  try {
    return JSON.parse(getJsonSchema(contract))
  } catch {
    return {}
  }
}

export function getMarkdown(contract: ContractModel): string {
  if (contract.schemasIdx < 0) { return ''}
  return contract.schemas[contract.schemasIdx].markdown
}

class _ContractStart extends React.Component<ContractsScreenProps> {

  public componentWillMount() {
  }

  public render() {
    const { ledger, contract, user, dispatch, history } = this.props
    const title = contract.templateIdx >= 0 ? contract.templates[contract.templateIdx].name : 'Start Contract'
    return (
        <View
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            padding: 5,
            flexDirection: 'column',
          }}
        >
          <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  paddingBottom: 10,
                }}
              >
                <Picker
                  style={styles.picker}

                  selectedValue={ledger.selectedLedgerIndex}
                  onValueChange={index => {
                    dispatch(
                      createActionObject('ledger/changeSelectedLedgerIndex', {
                        selectedLedgerIndex: index,
                      })
                    )
                  }}
                >
                  {ledger.ledgers.map((ledger, index) => (
                    <Picker.Item label={`${ledger.name}`} value={index} />
                  ))}
                </Picker>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-end',
                  width: '100%',
                  paddingBottom: 10,
                }}
              >
                    <Picker
                      selectedValue={contract.reducerIdx}
                      style={styles.picker}
                      onValueChange={(itemValue, reducerIdx) =>
                        dispatch({
                          type: 'contract/selectReducer',
                          payload: { reducerIdx },
                        })
                      }
                    >
                      }>
                  {getReducers(contract).map((r, idx) => (
                        <Picker.Item label={r.type} value={idx} />
                      ))}
                    </Picker>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(
                        createActionObject('contract/matchSchemas', { ledger, contract })
                      )
                    }
                  >
                    <View style={{ height: 40, justifyContent: 'center', marginLeft: 5, marginRight: 5 }}>
                      <Ionicons
                        name="ios-refresh"
                        color={incentumYellow}
                        size={40}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 10,
            }}
          >
            <SegmentedControlTab
              values={['Start Contract', 'Action Doc']}
              tabTextStyle={styles.tabText}
              tabStyle={styles.tabs}
              activeTabTextStyle={styles.activeTabText}
              activeTabStyle={styles.activeTabs}
              selectedIndex={contract.segment}
              onTabPress={(segment) => { dispatch(createActionObject('contract/changeSegment', { segment })) }}
            />
          </View>
          {contract.segment === 0 &&
            <Fragment>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  paddingBottom: 10,
                  zIndex: 2000,
                  width: '100%',
                }}
              >
                <TextInput
                  style={styles.inputName}
                  value={contract.contractName}
                  placeholder="Optional contract name, globally unique in ledger namespace..."
                  placeholderTextColor={placeHolderColor}
                  autoCorrect={false}
                  onChangeText={(contractName) => dispatch(createAction('contract/changeContractName', { contractName })) }
                />
                <div style={{ width: '100%' }}>
                  <CreatableSelect
                    isMulti={true}
                    options={contract.actionTags}
                    placeholder={'Tags...'}
                    styles={customStyles}
                    value={contract.selectedTags}
                    onChange={(selectedTags) => {
                      dispatch(createActionObject('contract/selectTags', { selectedTags }))
                    }}
                    onInputChange={(actionTagsInput) => {
                      dispatch(createActionObject('contract/tagInputChanged', { actionTagsInput }))
                    }}
                    onCreateOption={(tag) => {
                      dispatch(createActionObject('contract/createTag', { tag }))
                    }}
                  />
                </div>
              </View>
              <View style={{ padding: 20, borderRadius: 5, backgroundColor: 'white' }}>
                <Form
                  id="schema-form"
                  idPrefix="itum"
                  widgets={widgets}
                  formData={contract.formData}
                  onChange={({formData}) => dispatch(createActionObject('contract/formData', { formData }))}
                  formContext={formContext(contract, ledger)}
                  schema={getJsonSchemaAsObject(contract)}
                  onSubmit={(form) => {
                    dispatch(createActionObject('contract/formSubmitted', { form, formContext: formContext(contract, ledger) }))
                  }}
                  uiSchema={getUISchemaAsObject(contract)}
                  submitTitle={'Start Action'}
                  noValidate={false}
                  liveValidate={false}
                  showErrorList={false}
                >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}
                >
                  <button className="btn btn-primary" type="submit">Action</button>
                </div>
                </Form>
              </View>
            </Fragment>}
          {contract.segment === 1 &&
            <View style={{ padding: 20, borderRadius: 5, backgroundColor: 'white' }}>
                <Markdown source={getMarkdown(contract)} />
            </View>
          }
          {contract.segment === 2 &&
            <ContractInstance />
          }
        </View>
    )

  }
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
    borderColor: incentumYellow,
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

const ContractStart = connect((state) => ({ contract: state.contract, ledger: state.ledger, user: state.user }))(_ContractStart)
export default ContractStart
