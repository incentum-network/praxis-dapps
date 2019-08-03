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
