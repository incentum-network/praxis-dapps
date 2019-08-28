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
