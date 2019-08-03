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
