import React from 'react'
import { connect } from 'dva'
import Screen from './Screen'
import { LedgerModel } from '../models/ledger'
import { View } from 'react-native'
import { cancelButton } from '../commonComponents/HeaderButtons'
import { User } from 'firebase'
import { createActionObject } from '../utils'
import Markdown from 'react-markdown'

interface ContractSearchInfoScreenProps {
  ledger: LedgerModel
  user: User
  dispatch: any
  history: any
}

const markdown =
`
### Contract Search

* a term will perform a regex search on all contract instance fields
* if you know the contract ledger address and name, specify as 'ledger/name'. This is a very fast lookup.

`

class _ContractSearchInfoScreen extends React.PureComponent<ContractSearchInfoScreenProps> {

  public async exit() {
    const { history, dispatch } = this.props
    setTimeout(() => history.goBack(), 1000)
}

  public render() {
    return (
      <Screen
        title={'Contract Search Help'}
        left={cancelButton( async () => {
          await this.exit()
        })}
      >
        <View style={{ padding: 20, borderRadius: 5, backgroundColor: 'white' }}>
          <Markdown source={markdown} />
        </View>
      </Screen>
    )
  }
}

const ContractSearchInfoScreen = connect((state) => ({ user: state.user.user, ledger: state.ledger }))(_ContractSearchInfoScreen)
export default ContractSearchInfoScreen
