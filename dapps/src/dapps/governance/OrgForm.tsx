import React from 'react'
import { connect } from 'dva'
import { View, Picker, StyleSheet } from 'react-native'
import { createActionObject, createAction } from '../../utils'
import Form from 'react-jsonschema-form'
import * as Animatable from 'react-native-animatable'
import { incentumYellow, baseColor } from '../../constants/Colors'
import { LedgerModel } from '../../models/ledger'
import Screen from '../../components/Screen'
import { infoButton, cancelButton } from '../../commonComponents/HeaderButtons'
import { GovernanceModel, Org } from './model'

const styles = StyleSheet.create({
  picker: {
    height: 30,
    width: '100%',
    color: incentumYellow,
    backgroundColor: baseColor,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 5,
    borderColor: incentumYellow,
    flexGrow: 1,
  },
})

interface OrgFormProps {
  history: any
  dispatch: any
  ledgerModel: LedgerModel
  governance: GovernanceModel
}

class _OrgForm extends React.PureComponent<OrgFormProps> {

  public jsonSchemaObject = {
    title: 'Edit Organization',
    type: 'object',
    required: [
      'title',
      'subtitle',
      'symbol',
      'decimals',
      'joinStake',
      'joinFee',
      'approveJoin',
      'contractKey',
      'voteProposalFee',
      'joinTokens',
    ],
    properties: {
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
      joinStake: {
        type: 'integer',
        title: 'Join Stake in PRAX',
      },
      joinFee: {
        type: 'integer',
        title: 'Join Fee in PRAX',
      },
      joinTokens: {
        type: 'integer',
        title: 'Vote Tokens For Joining',
      },
      voteProposalFee: {
        type: 'integer',
        title: 'Vote Proposal Fee in PRAX',
      },
      approver: {
        type: 'string',
        title: 'Approver Address',
      },
      approveJoin: {
        type: 'boolean',
        title: 'Approve Member Join Request',
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
        title={'Edit Organization'}
        left={cancelButton( async () => {
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
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          paddingBottom: 10,
          width: '100%',
        }}
      >
        <View style={{width: '100%', backgroundColor: '#eee', borderColor: baseColor, borderWidth: 2, padding: 20, borderRadius: 5, marginBottom: 10, zIndex: 400 }}>
        <Form
          id="governance-org-form"
          idPrefix="gov"
          formContext={{}}
          formData={governance.orgForm}
          schema={this.jsonSchemaObject}
          onSubmit={(org) => {
            dispatch(createActionObject('governance/saveOrg', { org }))
          }}
          uiSchema={this.uiSchemaObject}
          submitTitle={'Save Org'}
          noValidate={false}
          liveValidate={false}
          showErrorList={false}
        >
          <div>
            <button type="submit" className="btn btn-primary">Save Org</button>
            <button type="button" className="btn btn-light" onClick={() => this.exit()}>Cancel</button>
          </div>
        </Form>
      </View>
      </View>

      </Screen>
    )
  }
}
const OrgForm = connect((state) => ({ ledgerModel: state.ledger, governance: state.governance }))(_OrgForm)
export default OrgForm
