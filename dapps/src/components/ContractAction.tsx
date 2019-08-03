import React, { Fragment } from 'react'
import { connect } from 'dva'
import { View, StyleSheet, Text, Picker, TouchableOpacity, TextInput } from 'react-native'
import { Switch } from 'react-native-web'

import colors, { incentumYellow, baseColor } from '../constants/Colors'
import { ContractModel, getReducers, getFirstCoinDisplay, formContext } from '../models/contract'
import { createActionObject, selectStyles } from '../utils'
import { Ionicons } from 'react-web-vector-icons'
import Form from 'react-jsonschema-form'
import { LedgerModel } from '../models/ledger'
import CreatableSelect from 'react-select/lib/Creatable'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import Markdown from 'react-markdown'
import ContractInstance from './ContractInstance'
import { get } from 'lodash'
import Action from './Action'
import { UserModel } from '../models/user'

const styles = StyleSheet.create({
  activeTabs: {
    backgroundColor: incentumYellow,
  },
  tabs: {
    height: 40,
    backgroundColor: baseColor,
    color: incentumYellow,
    borderColor: incentumYellow,
  },
  tabText: {
    paddingLeft: 6,
    paddingRight: 6,
    color: incentumYellow,
  },
  activeTabText: {
    color: 'black',
  },
  label: {
    color: '#222',
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
    flexGrow: 1,
  },
  input: {
    height: 40,
    width: '100%',
    color: incentumYellow,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 5,
    marginRight: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopColor: 'transparent',
    flexGrow: 1,
    fontSize: 16,
    alignItems: 'center',
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
  title: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: incentumYellow,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '400',
  },
  subtitle: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: incentumYellow,
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  small: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: incentumYellow,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
})

interface ContractActionProps {
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
  if (contract.schemasActionIdx < 0) { return '{}'}
  const schema = contract.schemasAction[contract.schemasActionIdx]
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
  if (contract.schemasActionIdx < 0) { return '{}'}
  const schema = contract.schemasAction[contract.schemasActionIdx]
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
  if (contract.schemasActionIdx < 0) { return ''}
  return contract.schemasAction[contract.schemasActionIdx].markdown
}

class _ContractAction extends React.Component<ContractActionProps> {

  public render() {
    const { ledger, contract, user, dispatch, history } = this.props
    let title = get(contract, 'contract.title')
    title = title && title.length > 0 ? title : 'Contract Action'
    const subtitle = get(contract, 'contract.subtitle', '')
    const description = get(contract, 'contract.description', '')

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
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-end',
                  paddingBottom: 10,
                }}
              >
                <View style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
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
                  </View>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      dispatch(
                        createActionObject('contract/matchSchemasAction', { ledger, contract })
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
              values={['Run Action', 'Action Doc', 'Contract', 'Last Action']}
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
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    paddingBottom: 10,
                    width: '100%',
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
                <div style={{ width: '100%' }}>
                  <CreatableSelect
                    isMulti={true}
                    options={contract.actionTags}
                    placeholder={'Tags...'}
                    styles={selectStyles}
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
              <View style={{ padding: 20, borderRadius: 5, borderBottomRightRadius: 0, borderBottomLeftRadius: 0, backgroundColor: 'white' }}>
                <Form
                  id="action-form"
                  idPrefix="itum"
                  widgets={widgets}
                  formContext={formContext(contract, ledger)}
                  schema={getJsonSchemaAsObject(contract)}
                  onSubmit={(form) => {
                    dispatch(createActionObject('contract/formSubmittedAction', { form, formContext: formContext(contract, ledger) }))
                  }}
                  uiSchema={getUISchemaAsObject(contract)}
                  formData={contract.formData}
                  onChange={({formData}) => dispatch(createActionObject('contract/formData', { formData }))}
                  submitTitle={'Start Action'}
                  noHtml5Validate={true}
                  noValidate={contract.createLink}
                  liveValidate={false}
                  showErrorList={false}
                >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    paddingTop: 20,
                  }}
                >
                  <button
                    style={{marginRight: 'auto', height: 40}}
                    className="btn btn-primary"
                    type="submit"
                  >Action</button>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      paddingTop: 20,
                    }}
                  >
                    <FieldLabel label="Create Link" />
                  <Switch
                    value={contract.createLink}
                    thumbColor="#bbb"
                    activeThumbColor="black"
                    activeTrackColor="#666"
                    trackColor={'#ccc'}
                    onValueChange={(createLink) => {
                      dispatch(createActionObject('contract/createLink', { createLink }))
                    }}
                  />
                  </div>
                </div>
                </Form>
              </View>
              <TextInput
                  style={styles.input}
                  value={contract.createLinkUrl}
                  autoCorrect={false}
                />
            </Fragment>}
          {contract.segment === 1 &&
            <View style={{ padding: 20, borderRadius: 5, backgroundColor: 'white' }}>
                <Markdown source={getMarkdown(contract)} />
            </View>
          }
          {contract.segment === 2 &&
            <ContractInstance />
          }
          {contract.segment === 3 &&
            <Action />
          }
        </View>
    )

  }
}

const ContractAction = connect((state) => ({ contract: state.contract, ledger: state.ledger, user: state.user }))(_ContractAction)
export default ContractAction
