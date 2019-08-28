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
import Screen from './Screen'
import { ContractModel, getReducers } from '../models/contract'
import { LedgerModel } from '../models/ledger'
import { UserModel } from '../models/user'
import { searchButton, refreshButton } from '../commonComponents/HeaderButtons'
import ContractStart from './ContractStart'

interface ContractsScreenProps {
  contract: ContractModel
  ledger: LedgerModel
  user: UserModel
  dispatch: any
  history: any
}

class _ContractsScreen extends React.Component<ContractsScreenProps> {

  public componentWillMount() {
  }

  public render() {
    const { ledger, contract, user, dispatch, history } = this.props
    const title = contract.templateIdx >= 0 ? contract.templates[contract.templateIdx].name : 'Start Contract'
    return (
      <Screen
        spinner={contract.spinner}
        title={title}
        right={ searchButton(() => history.push('/templateSearch'))}
        left={ refreshButton(() => location.reload(true))}
      >
        <ContractStart history={history} />
      </Screen>
    )

  }
}

const ContractsScreen = connect((state) => ({ contract: state.contract, ledger: state.ledger, user: state.user }))(_ContractsScreen)
export default ContractsScreen
