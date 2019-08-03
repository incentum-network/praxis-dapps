import React from 'react'
import { connect } from 'dva'
import { View, StyleSheet, Text } from 'react-native'

import colors, { incentumYellow } from '../constants/Colors'
import { ContractModel } from '../models/contract'
import Markdown from 'react-markdown'
import { get } from 'lodash'

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
  small: {
    textAlign: 'center',
    fontSize: 12,
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
})

interface ContractInstanceProps {
  contract: ContractModel
  dispatch: any
  history: any
}

export function FieldLabel(props) {
  return (
    <Text style={styles.label}>
      {props.label}
    </Text>
  )
}

export function getMarkdown(contract: ContractModel): string {
  if (contract.schemasIdx < 0) { return ''}
  return contract.schemas[contract.schemasIdx].markdown
}

class _ContractInstance extends React.PureComponent<ContractInstanceProps> {

  public componentWillMount() {
  }

  public render() {
    const { contract, dispatch } = this.props
    const title = get(contract, 'contract.title', 'Contract Action')
    const subtitle = get(contract, 'contract.subtitle', '')
    const description = get(contract, 'contract.description', '')

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
            <Text style={styles.small}>Instance: {contract.instance}</Text>
            <Markdown source={description} />
          </View>
        </View>
    )

  }
}

const ContractInstance = connect((state) => ({ contract: state.contract }))(_ContractInstance)
export default ContractInstance
