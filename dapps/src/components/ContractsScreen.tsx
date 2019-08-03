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
