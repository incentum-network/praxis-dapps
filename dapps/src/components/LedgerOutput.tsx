import React from 'react'
import Markdown from 'react-native-markdown-renderer'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { OutputJson } from '@incentum/praxis-interfaces'
import { Coin } from '@incentum/praxis-contracts'
import Badge from './Badge'
import { omit } from 'lodash'
import { incentumYellow, baseColor } from '../constants/Colors'

const markdown = (md) => (
  <View style={styles.description}>
    <Markdown>{md}</Markdown>
  </View>
)

export interface LedgerOutputProps {
  output: OutputJson
  onCoinPress: (output, coin, i) => void
  onHeaderPress: (output) => void
  onOutputToAccountPress: (output) => void
}

const badges = (output, mints, onCoinPress) => output.coins.map((coin, i) => <Badge key={'badge-' + i} amount={Coin.fromJson(coin).display()} mint={mints[`${i}`]} symbol={coin.symbol} onPress={() => onCoinPress(output, coin, i)}/>)

class LedgerOutput extends React.Component<LedgerOutputProps> {
  public state = {
    mint: {},
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
    const { output, onCoinPress, onHeaderPress, onOutputToAccountPress } = this.props
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity onLongPress={() => onHeaderPress(output)}>
          <Text style={styles.title}>{output.title}</Text>
          { output.subtitle ? <Text style={styles.subtitle}>{output.subtitle}</Text> : <View></View> }
        </TouchableOpacity>
        { (output as any).isPraxisOutput ?
        <TouchableOpacity onLongPress={() => onOutputToAccountPress(output) }>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Send Back to Account</Text>
          </View>
        </TouchableOpacity> : <View></View> }
        <View style={styles.badges}>
          { output.coins.length > 0 ? badges(output, this.state.mint, (output, coin, i) => this.toggleMint(coin, i)) : <View></View> }
        </View>
        <View style={styles.msgs}>
          { output.msgs.map((m) => <Text style={styles.msg}>{m}</Text>) }
        </View>
      </View>)
    }
  }

const styles = StyleSheet.create({
  msgs: {
    marginTop: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 200,
    backgroundColor: baseColor,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 6,
    padding: 5,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: incentumYellow,
  },
  msg: {
    fontStyle: 'italic',
  },
  wrapper: {
    padding: 10,
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    marginTop: 5,
    borderRadius: 5,
    width: '100%',
  },
  badges: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  description: {
    backgroundColor: '#ddd',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})

export default LedgerOutput
