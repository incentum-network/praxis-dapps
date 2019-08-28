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
import { View } from 'react-native'
import { createActionObject, isMobileDevice } from '../../utils'
import Form from 'react-jsonschema-form'
import { baseColor } from '../../constants/Colors'
import { LedgerModel } from '../../models/ledger'
import Screen from '../../components/Screen'
import { infoButton, cancelButton } from '../../commonComponents/HeaderButtons'
import { GovernanceModel, getGov, getVoteProposal } from './model'
import { VoteForm } from '../../shared/governance'
import { get } from 'lodash'

interface VoteFormCreateProps {
  history: any
  dispatch: any
  location: any
  ledgerModel: LedgerModel
  governance: GovernanceModel
}

function toVoteForm({formData}): VoteForm {
  return {
    memberId: formData.memberId,
    voteProposalId: formData.voteProposalId,
    votes: formData.votes,
    vote: formData.vote,
  }
}

class _VoteFormCreate extends React.PureComponent<VoteFormCreateProps> {

  public jsonSchemaObject = {
    title: 'Create Vote',
    type: 'object',
    required: [
      'votes',
      'vote',
      ],
    properties: {
      votes: {
        type: 'integer',
        title: 'Votes',
      },
      vote: {
        type: 'string',
        title: 'Vote',
        enum: [
          'for',
          'against',
        ],
      },
    },
  }

  public uiSchemaObject = {
    description: {
      'ui:widget': 'textarea',
      'ui:rows': 10,
    },
  }

  public async exit() {
    const { history, dispatch } = this.props
    setTimeout(() => history.goBack(), 1000)
  }

  public render() {
    const { history, dispatch, ledgerModel, governance, location } = this.props
    const voteProposal = get(location, 'state.voteProposal')
    return (
      <Screen
        title={'Vote'}
        left={cancelButton(async () => {
          await this.exit()
        })}
        right={infoButton(() => {
          // history.push('/orgForm')
        })}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
            width: '100%',
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#eee',
              borderColor: baseColor,
              borderWidth: 2,
              padding: 20,
              borderRadius: 5,
              marginBottom: 10,
              zIndex: 400,
              minWidth: isMobileDevice ? '100%' : 600,
              maxWidth: isMobileDevice ? '100%' : 700,
              }}
          >
            <Form
              id="governance-vote-form"
              idPrefix="gov"
              formContext={{}}
              formData={{}}
              schema={this.jsonSchemaObject}
              onSubmit={vote => {
                dispatch(
                  createActionObject('governance/vote', {
                    vote: toVoteForm(vote),
                    voteProposal,
                    history,
                  })
                )
              }}
              uiSchema={this.uiSchemaObject}
              submitTitle={'Cast Vote'}
              noValidate={false}
              liveValidate={false}
              showErrorList={false}
            >
              <div>
                <button type="submit" className="btn btn-primary">
                  Save Vote Proposal
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => this.exit()}
                >
                  Cancel
                </button>
              </div>
            </Form>
          </View>
        </View>
      </Screen>
    )
  }
}
const VoteFormCreate = connect((state) => ({ ledgerModel: state.ledger, governance: state.governance }))(_VoteFormCreate)
export default VoteFormCreate
