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
import { VoteProposalForm } from '../../shared/governance'

interface VoteProposalFormCreateProps {
  history: any
  dispatch: any
  ledgerModel: LedgerModel
  governance: GovernanceModel
}

function toVoteProposalForm(obj: any): VoteProposalForm {
  return {
    name: obj.name,
    title: obj.title,
    subtitle: obj.subtitle,
    description: obj.description,
    orgId: obj.orgId,
    proposalId: obj.proposalId,
    minVoters: obj.minVoters,
    maxVoters: obj.maxVoters,
    stake: obj.stake,
    winPercent: obj.winPercent,
    voteStart: obj.voteStart,
    voteEnd: obj.voteEnd,
    voteType: obj.voteType,
  }
}

class _VoteProposalFormCreate extends React.PureComponent<VoteProposalFormCreateProps> {

  public jsonSchemaObject = {
    title: 'Create Vote Proposal',
    type: 'object',
    required: [
      'name',
      'title',
      'subtitle',
      'description',
      'orgId',
      'proposalId',
      'minVoters',
      'maxVoters',
      'stake',
      'winPercent',
      'voteStart',
      'voteEnd',
      'voteType',
      ],
    properties: {
      name: {
        type: 'string',
        title: 'Name',
      },
      title: {
        type: 'string',
        title: 'Title',
      },
      subtitle: {
        type: 'string',
        title: 'Subtitle',
      },
      description: {
        type: 'string',
        title: 'Description',
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
    const { history, dispatch, ledgerModel, governance } = this.props

    return (
      <Screen
        title={'Vote Proposal'}
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
              id="governance-vote-proposal-form"
              idPrefix="gov"
              formContext={{}}
              formData={getVoteProposal(governance)}
              schema={this.jsonSchemaObject}
              onSubmit={org => {
                dispatch(
                  createActionObject('governance/saveVoteProposal', {
                    gov: toVoteProposalForm(org),
                    history,
                  })
                )
              }}
              uiSchema={this.uiSchemaObject}
              submitTitle={'Save Vote Proposal'}
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
const VoteProposalFormCreate = connect((state) => ({ ledgerModel: state.ledger, governance: state.governance }))(_VoteProposalFormCreate)
export default VoteProposalFormCreate
