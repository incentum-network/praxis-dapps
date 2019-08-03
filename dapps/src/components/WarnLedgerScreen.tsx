import React from 'react'
import { connect } from 'dva'
import Screen from './Screen'
import { LedgerModel } from '../models/ledger'
import { View } from 'react-native'
import { cancelButton } from '../commonComponents/HeaderButtons'
import { User } from 'firebase'
import { createActionObject } from '../utils'
import Markdown from 'react-markdown'

interface WarnLedgerScreenProps {
  ledger: LedgerModel
  user: User
  dispatch: any
  history: any
}

const markdown =
`
## Please read this carefully.

1. When creating a ledger, make sure you save the 12 word mnemonic in a safe place - it may be the only way to recover a lost ledger.
3. The 12 word mnemonic must also **remain private**. Don't allow access to the mnemonic.
2. One best practice is to copy the 12 word mnemonic to a card and put the card in a safe or safe deposit box.
2. You can create multiple ledgers from the same 12 word mnemonic. The account number (an integer) distinguishes them.
3. You can also download an encrypted and password protected file for each ledger you create. You can use this file to restore a ledger by uploading the file and specifying the password.
3. Praxis keeps copies of the ledgers in localStorage on the device for quick startup. At your discretion, you can remove these when exiting Praxis, and use one of the restore methods to get your ledger back.
3. We will be supporting hardware devices, like the Ledger Nano S and X shortly.
`

class _WarnLedgerScreen extends React.PureComponent<WarnLedgerScreenProps> {

  public async exit() {
    const { history, dispatch } = this.props
    dispatch(createActionObject('ledger/warningRead', { history }))
}

  public render() {
    return (
      <Screen
        title={'Read This Carefully'}
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

const WarnLedgerScreen = connect((state) => ({ user: state.user.user, ledger: state.ledger }))(_WarnLedgerScreen)
export default WarnLedgerScreen
