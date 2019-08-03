import React from 'react'
import { connect } from 'dva'
import Screen from './Screen'
import { LedgerModel } from '../models/ledger'
import { View } from 'react-native'
import { cancelButton } from '../commonComponents/HeaderButtons'
import { User } from 'firebase'
import { createActionObject } from '../utils'
import Markdown from 'react-markdown'
import { get } from 'lodash';

interface OutputDetailScreenProps {
  ledger: LedgerModel
  user: User
  dispatch: any
  history: any
  location: any
}

class _OutputDetailScreen extends React.PureComponent<OutputDetailScreenProps> {

  public async exit() {
    const { history } = this.props
    setTimeout(() => history.goBack(), 1000)
  }

  public render() {
    const markdown = get(this.props.location, 'state.markdown', '')
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

const OutputDetailScreenScreen = connect((state) => ({ user: state.user.user, ledger: state.ledger }))(_OutputDetailScreen)
export default OutputDetailScreenScreen
