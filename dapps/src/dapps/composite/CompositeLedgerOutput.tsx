import React from 'react'
import Markdown from 'react-native-markdown-renderer'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { OutputJson } from '@incentum/praxis-interfaces'
import { Coin } from '@incentum/praxis-contracts'
import Badge from '../../components/Badge'
import { omit } from 'lodash'
import { incentumYellow, baseColor } from '../../constants/Colors'

const markdown = (md) => (
  <View style={styles.description}>
    <Markdown>{md}</Markdown>
  </View>
)

export interface CompositeLedgerOutputProps {
  output: OutputJson
  onCoinPress: (output, coin, i) => void
  onHeaderPress: (output) => void
  onOutputToAccountPress: (output) => void
  history
}

const badges = (output, mints, onCoinPress) => output.coins.map((coin, i) => <Badge key={'badge-' + i} amount={Coin.fromJson(coin).display()} mint={mints[`${i}`]} symbol={coin.symbol} onPress={() => onCoinPress(output, coin, i)}/>)

class CompositeLedgerOutput extends React.Component<CompositeLedgerOutputProps> {
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
    const { output, history, onHeaderPress, onOutputToAccountPress } = this.props
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity onLongPress={() => onHeaderPress(output)}>
          <Text style={styles.title}>{output.title}</Text>
          { output.subtitle ? <Text style={styles.subtitle}>{output.subtitle}</Text> : <View></View> }
        </TouchableOpacity>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
          { (output as any).isPraxisOutput ?
          <TouchableOpacity onLongPress={() => onOutputToAccountPress(output) }>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Send Back to Account</Text>
            </View>
          </TouchableOpacity> : <View></View> }
          { output.description ?
          <TouchableOpacity onPress={() => history.push('/outputDetail', { markdown: output.description}) }>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Show Details</Text>
            </View>
          </TouchableOpacity> : <View></View> }
        </View>
        <View style={styles.badges}>
          { output.coins.length > 0 ? badges(output, this.state.mint, (output, coin, i) => this.toggleMint(coin, i)) : <View></View> }
        </View>
        { output.msgs.length > 0 ?
        <View style={styles.msgs}>
          { output.msgs.map((m) => <Text style={styles.msg}>{m}</Text>) }
        </View> : <View></View> }
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
    height: 20,
    backgroundColor: baseColor,
    borderColor: incentumYellow,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 10,
    color: incentumYellow,
  },
  msg: {
    fontStyle: 'italic',
  },
  wrapper: {
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#eee',
    display: 'flex',
    flexDirection: 'column',
    marginTop: 5,
    borderRadius: 5,
    width: '100%',
  },
  badges: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '400',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  description: {
    backgroundColor: '#ddd',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})

export default CompositeLedgerOutput
