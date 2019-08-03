import React from 'react'
import { connect } from 'dva'
import { View, StyleSheet, Text } from 'react-native'

import { incentumYellow } from '../constants/Colors'
import Screen from './Screen'
import { ContractModel, TabLabels } from '../models/contract'
import { createActionObject } from '../utils'
import { LedgerModel } from '../models/ledger'
import { searchButton, refreshButton } from '../commonComponents/HeaderButtons'
import { get } from 'lodash'
import { UserModel } from '../models/user'
import ContractAction from './ContractAction'

const styles = StyleSheet.create({
  label: {
    color: '#222',
    fontSize: 16,
    paddingBottom: 5,
    paddingLeft: 1,
    alignItems: 'flex-start',
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

class _ContractActionScreen extends React.Component<ContractActionProps> {

  public render() {
    const { ledger, contract, user, dispatch, history } = this.props
    let title = get(contract, 'contract.title')
    title = title && title.length > 0 ? title : 'Contract Action'
    const subtitle = get(contract, 'contract.subtitle', '')
    const description = get(contract, 'contract.description', '')

    return (
      <Screen
        spinner={contract.spinner}
        title={title}
        titleComponent={
          <View style={{display: 'flex', flexDirection: 'column', width: '50%'}}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        }
        right={ searchButton(() => history.push('/contractSearch'))}
        left={ refreshButton(() => location.reload(true))}
        >
        <ContractAction history={history} />
      </Screen>
    )

  }
}

const ContractActionScreen = connect((state) => ({ contract: state.contract, ledger: state.ledger, user: state.user }))(_ContractActionScreen)
export default ContractActionScreen
