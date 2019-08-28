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
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import colors from '../constants/Colors'
import { Ledger } from '../models/ledger'

const LedgerCard = ({ ledger, isSelected, onPress }: { ledger: Ledger, isSelected: boolean, onPress: any}) => (
  <TouchableOpacity
    activeOpacity={isSelected ? 1 : 0.7}
    onPress={() => onPress(ledger.ledger)}
    style={[
      styles.cardTouchable,
      { borderColor: isSelected ? colors.headerBackground : '#fff' },
    ]}
  >
    <View style={[styles.cardWrap, { opacity: isSelected ? 1 : 0.6 }]}>
      <Text style={styles.header}>{ledger.name}</Text>
      <View style={styles.cardBottom}>
        <Text style={styles.value}>{ledger.subtitle}</Text>
      </View>
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  cardTouchable: {
    borderRadius: 6,
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 18,
    borderWidth: 3,
    borderStyle: 'solid',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 110,
  },
  header: {
    fontSize: 20,
    marginBottom: 4,
    fontWeight: '400',
  },
  cardBottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 28,
    fontWeight: '200',
    color: '#666',
  },
})

export default LedgerCard
