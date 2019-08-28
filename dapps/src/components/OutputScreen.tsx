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
import { View, StyleSheet } from 'react-native'

import { connect } from 'dva'
import { LedgerModel } from '../models/ledger'

import colors from '../constants/Colors'
import Screen from './Screen'

const styles = StyleSheet.create({
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
})

interface OutputScreenProps {
  ledger: LedgerModel
  navigation: any
}

class _OutputScreen extends React.PureComponent<OutputScreenProps> {

  public componentWillMount() {
  }

  public render() {
    const { ledger } = this.props
    return (
      <Screen title={'Outputs'}>
        <View style={{width: '100%', height: '100%', backgroundColor: 'red'}}>
        </View>
      </Screen>
      )

  }
}

const OutputScreen = connect((state) => ({ ledger: state.ledger }))(_OutputScreen)
export default OutputScreen
