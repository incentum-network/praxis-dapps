import React from 'react'
import { connect } from 'dva'
import { View } from 'react-native'
import { createActionObject, isMobileDevice } from '../../utils'
import Form from 'react-jsonschema-form'
import { baseColor } from '../../constants/Colors'
import { LedgerModel } from '../../models/ledger'
import Screen from '../../components/Screen'
import { infoButton, cancelButton } from '../../commonComponents/HeaderButtons'
import { GovernanceModel, getGov } from './model'
import { ProposalForm } from '../../shared/governance'

interface ProposalFormCreateProps {
  history: any
  dispatch: any
  ledgerModel: LedgerModel
  governance: GovernanceModel
}

function toProposalForm(obj: any): ProposalForm {
  return {
    name: obj.name,
    title: obj.title,
    subtitle: obj.subtitle,
    description: obj.description,
  }
}

class _ProposalFormCreate extends React.PureComponent<ProposalFormCreateProps> {

  public jsonSchemaObject = {
    title: 'Proposal',
    type: 'object',
    required: [
      'name',
      'title',
      'subtitle',
      'description',
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
        title={'Proposal'}
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
              id="governance-gov-form"
              idPrefix="gov"
              formContext={{}}
              formData={getGov(governance)}
              schema={this.jsonSchemaObject}
              onSubmit={org => {
                dispatch(
                  createActionObject('governance/saveProposal', {
                    gov: toProposalForm(org),
                    history,
                  })
                )
              }}
              uiSchema={this.uiSchemaObject}
              submitTitle={'Save Proposal'}
              noValidate={false}
              liveValidate={false}
              showErrorList={false}
            >
              <div>
                <button type="submit" className="btn btn-primary">
                  Save Proposal
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
const ProposalFormCreate = connect((state) => ({ ledgerModel: state.ledger, governance: state.governance }))(_ProposalFormCreate)
export default ProposalFormCreate
