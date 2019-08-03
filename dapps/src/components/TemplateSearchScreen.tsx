import React, { Fragment } from 'react'
import { connect } from 'dva'
import Screen from './Screen'
import { createAction, createActionObject, selectStyles } from '../utils'
import { LedgerModel } from '../models/ledger'
import colors, { incentumYellow, baseColor } from '../constants/Colors'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Picker } from 'react-native'
import { infoButton, cancelButton } from '../commonComponents/HeaderButtons'
import { User } from 'firebase'
import { ContractModel } from '../models/contract'
import { Ionicons } from 'react-web-vector-icons'
import { TemplateJson } from '@incentum/praxis-interfaces'

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
    marginBottom: 10,
  },
})

const placeHolderColor = '#ddd'

interface TemplateSearchScreenProps {
  ledger: LedgerModel
  user: User
  dispatch: any
  history: any
  contract: ContractModel
}

const TemplateSearchItem = ({ template, onPress }: { template: TemplateJson, onPress: any}) => (
  <View style={styles.wrapper}>
    <TouchableOpacity onPress={() => onPress(template)}>
      <Text style={styles.title}>{`${template.name}-${template.versionMajor}.${template.versionMinor}.${template.versionPatch}`}</Text>
      <Text style={styles.small}>{`${template.ledger}`}</Text>
      { template.description && <Text style={styles.subtitle}>{template.description}</Text> }
    </TouchableOpacity>
  </View>
)

class _TemplateSearchScreen extends React.PureComponent<TemplateSearchScreenProps> {

  public async exit() {
    const { history } = this.props
    history.goBack()
}

  public render() {
    const { ledger, user, dispatch, contract, history } = this.props
    return (
      <Screen
        spinner={contract.spinner}
        title={'Template Search'}
        left={cancelButton( async () => {
          await this.exit()
        })}
        right={infoButton(() => {
          history.push('/templateSearchInfo')
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
              <TouchableOpacity onPress={() => dispatch(createActionObject('contract/search', { ledger, contract }))} >
                <View style={{ justifyContent: 'center', marginRight: 5, marginLeft: 5 }}>
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
            { contract.templates.map((template, templateIdx) => (
              <TemplateSearchItem
                template={template}
                onPress={(result) => {
                  this.exit()
                  dispatch(createActionObject('contract/templateSelected', { templateIdx }))}
                }/>)
            )}
          </View>
      </Screen>
    )
  }
}

const TemplateSearchScreen = connect((state) => ({ user: state.user.user, ledger: state.ledger, contract: state.contract }))(_TemplateSearchScreen)
export default TemplateSearchScreen
