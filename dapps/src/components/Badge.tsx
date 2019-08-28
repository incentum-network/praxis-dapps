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

import React, { Fragment } from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'
import { incentumYellow } from '../constants/Colors'

export interface BadgeProps {
    symbol: string
    amount: string
    onPress: () => void
    mint?: string
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 5,
    maxWidth: 200,
  },
  text: {
    fontSize: 14,
  },
  mint: {
    fontSize: 10,
    paddingTop: 10,
    paddingBottom: 10,
    color: incentumYellow,
    fontStyle: 'italic',
  },
  BTC: {
    color: '#222',
    backgroundColor: '#F9B23B',
  },
  ETH: {
    color: '#fff',
    backgroundColor: '#8F9EB0',
  },
  PRAX: {
    color: incentumYellow,
    backgroundColor: '#111',
  },
  default: {
    color: '#00ff00',
    backgroundColor: '#111',
  },
})

const backgroundColorStyles = StyleSheet.create({
  BTC: {
    backgroundColor: '#F9B23B',
  },
  ETH: {
    backgroundColor: '#8F9EB0',
  },
  PRAX: {
    backgroundColor: '#111',
  },
  default: {
    backgroundColor: '#111',
  },
})

const Badge = ({ symbol, amount, mint, onPress }: BadgeProps) => {
  const xtra = (styles[symbol] || styles.default)
  return (
    <Fragment>
      <View style={[styles.badge, backgroundColorStyles[symbol] || backgroundColorStyles.default ]}>
    <TouchableOpacity onPress={() => onPress()}>
        <Text style={[styles.text, xtra]}>{amount} {symbol}</Text>
    </TouchableOpacity>
    {mint ? <Text style={styles.mint}>{mint}</Text> : <View />}
    </View>
    </Fragment>
    )
}

export default Badge
