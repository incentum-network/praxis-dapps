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
