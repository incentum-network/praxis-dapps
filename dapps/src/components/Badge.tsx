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
