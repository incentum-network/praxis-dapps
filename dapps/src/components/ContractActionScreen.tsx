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
