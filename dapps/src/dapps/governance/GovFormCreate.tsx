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
import { GovForm } from '../../shared/governance'

interface GovFormCreateProps {
  history: any
  dispatch: any
  ledgerModel: LedgerModel
  governance: GovernanceModel
}

function toGovForm(obj: any): GovForm {
  return {
    name: obj.name,
    title: obj.title,
    subtitle: obj.subtitle,
    description: obj.description,
    space: obj.space,
    createOrgFee: obj.createOrgFee,
    createVoteFee: obj.createVoteFee,
    createProposalFee: obj.createProposalFee,
  }
}

class _GovFormCreate extends React.PureComponent<GovFormCreateProps> {

  public jsonSchemaObject = {
    title: 'Government',
    type: 'object',
    required: [
      'name',
      'title',
      'subtitle',
      'description',
      'space',
      'createOrgFee',
      'createVoteFee',
      'createProposalFee',
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
      space: {
        type: 'string',
        title: 'Praxis Space Name',
      },
      createOrgFee: {
        type: 'integer',
        title: 'Create Org Fee in PRAX',
      },
      createVoteFee: {
        type: 'integer',
        title: 'Create Vote Fee in PRAX',
      },
      createProposalFee: {
        type: 'integer',
        title: 'Create Proposal Fee in PRAX',
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
        title={'Governmant'}
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
                  createActionObject('governance/saveGov', {
                    gov: toGovForm(org),
                    history,
                  })
                )
              }}
              uiSchema={this.uiSchemaObject}
              submitTitle={'Save Gov'}
              noValidate={false}
              liveValidate={false}
              showErrorList={false}
            >
              <div>
                <button type="submit" className="btn btn-primary">
                  Save Gov
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
const GovFormCreate = connect((state) => ({ ledgerModel: state.ledger, governance: state.governance }))(_GovFormCreate)
export default GovFormCreate
