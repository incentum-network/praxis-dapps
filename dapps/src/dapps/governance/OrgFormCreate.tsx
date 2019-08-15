import React from 'react'
import { connect } from 'dva'
import { View } from 'react-native'
import { createActionObject, isMobileDevice } from '../../utils'
import Form from 'react-jsonschema-form'
import { baseColor } from '../../constants/Colors'
import { LedgerModel } from '../../models/ledger'
import Screen from '../../components/Screen'
import { infoButton, cancelButton } from '../../commonComponents/HeaderButtons'
import { GovernanceModel, getOrg } from './model'
import { OrgForm } from '../../shared/governance'

interface OrgFormCreateProps {
  history: any
  dispatch: any
  ledgerModel: LedgerModel
  governance: GovernanceModel
}

function toOrgForm({ formData }): OrgForm {
  return {
    name: formData.name,
    title: formData.title,
    subtitle: formData.subtitle,
    description: formData.description,
    symbol: formData.symbol,
    decimals: formData.decimals,
    joinFee: formData.joinFee,
    joinTokens: formData.joinTokens,
  }
}

class _OrgFormCreate extends React.PureComponent<OrgFormCreateProps> {
  public jsonSchemaObject = {
    title: 'Organization',
    type: 'object',
    required: [
      'name',
      'title',
      'subtitle',
      'symbol',
      'decimals',
      'description',
      'joinFee',
      'joinTokens',
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
      symbol: {
        type: 'string',
        title: 'Vote Token Symbol',
      },
      decimals: {
        type: 'integer',
        title: 'Decimals',
      },
      joinFee: {
        type: 'integer',
        title: 'Join Fee in PRAX',
      },
      joinTokens: {
        type: 'integer',
        title: 'Vote Tokens For Joining',
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
        title={'Organization'}
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
              id="governance-org-form"
              idPrefix="gov"
              formContext={{}}
              formData={getOrg(governance)}
              schema={this.jsonSchemaObject}
              onSubmit={org => {
                dispatch(
                  createActionObject('governance/saveOrg', {
                    org: toOrgForm(org),
                    history,
                  })
                )
              }}
              uiSchema={this.uiSchemaObject}
              submitTitle={'Save Org'}
              noValidate={false}
              liveValidate={false}
              showErrorList={false}
            >
              <div>
                <button type="submit" className="btn btn-primary">
                  Save Org
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
const OrgFormCreate = connect(state => ({
  ledgerModel: state.ledger,
  governance: state.governance,
}))(_OrgFormCreate)
export default OrgFormCreate
