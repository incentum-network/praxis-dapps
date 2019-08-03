import React from 'react'
import { connect } from 'dva'
import { View, StyleSheet, Text } from 'react-native'

import colors, { incentumYellow } from '../constants/Colors'
import { ContractModel } from '../models/contract'
import Markdown from 'react-markdown'
import { get, omit } from 'lodash'
import Badge from './Badge'
import { Coin } from '@incentum/praxis-contracts'

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    paddingBottom: 20,
  },
  label: {
    color: incentumYellow,
    fontSize: 16,
    paddingBottom: 5,
    paddingLeft: 1,
    alignItems: 'flex-start',
  },
  badges: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  msgs: {
    marginTop: 10,
    marginBottom: 10,
  },
  msg: {
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
})

interface ActionProps {
  contract: ContractModel
  dispatch: any
  history: any
}

const badges = (coins, mints, onCoinPress) => coins.map((coin, i) => <Badge key={'badge-' + i} amount={Coin.fromJson(coin).display()} symbol={coin.symbol} mint={mints[`${i}`]} onPress={() => onCoinPress(coin, i)}/>)

class _Action extends React.Component<ActionProps> {

  public state = {
    mint: {},
  }

  public componentWillMount() {
  }

  public toggleMint(coin, i) {
    if (this.state.mint[`${i}`]) {
      this.setState((state) => {
        const mint = omit(this.state.mint, `${i}`)
        return {
          ...state,
          mint,
        }
      })
    } else {
      this.setState((state) => {
        const mint = { ...this.state.mint, [`${i}`]: coin.mint}
        return {
          ...state,
          mint,
        }
      })
    }
  }

  public render() {
    const { contract, dispatch } = this.props
    const coins = get(contract, 'action.state.coins', [])
    const msgs = get(contract, 'action.state.state.view.msgs', [])
    const title = get(contract, 'action.state.state.view.title', '')
    const subtitle = get(contract, 'action.state.state.view.subtitle', '')
    const description = get(contract, 'action.state.state.view.description', '')

    return (
        <View
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
          </View>
          <View style={{ padding: 20, borderRadius: 5, backgroundColor: 'white' }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.badges}>
              { coins.length > 0 && badges(coins, this.state.mint, (coin, i) => { this.toggleMint(coin, i) }) }
            </View>
            <View style={styles.msgs}>
              { msgs.map((m) => <Text style={styles.msg}>{m}</Text>) }
            </View>
            <Markdown source={description} />
          </View>
        </View>
    )

  }
}

const Action = connect((state) => ({ contract: state.contract }))(_Action)
export default Action
