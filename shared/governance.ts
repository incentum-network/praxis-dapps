import { CoinJson } from "@incentum/praxis-interfaces"

export interface GovForm {
  name: string
  title: string
  subtitle: string
  description: string
  space: string
  createOrgFee: number
  createVoteFee: number
  createProposalFee: number
}

export interface GovState {
  orgs: number
  votes: number
  proposals: number
  name: string
  space: string
  owner: string
  createOrgFee: CoinJson
  createVoteFee: CoinJson
  createProposalFee: CoinJson
  view: {
    title: string
    subtitle: string
    description: string
    msgs: string[]
  }
}

export interface OrgCommon {
  title: string
  subtitle: string
  description: string
  symbol: string
  decimals: number
  joinStake: number
  joinFee: number
  joinTokens: number
}

export interface OrgForm extends OrgCommon {
}

export interface OrgDoc extends OrgCommon {
  id: string
  docType: string
  owner: string
}

export enum DocTypes {
  Gov = 'praxis-governance',
  Org = 'praxis-organization',
  Proposal = 'praxis-proposal',
  Vote = 'praxis-vote',
  Member = 'praxis-member',
  Voter = 'praxis-voter',
}

export const fields =
`
{
  /* common fields */
  'id': $x.fields.keywordField,
  'title': $x.fields.whitespaceTextField,
  'subtitle': $x.fields.whitespaceTextField,
  'description': $x.fields.whitespaceTextField,
  'docType': $x.fields.keywordField,
  'owner': $x.fields.keywordField,
  'version': $x.fields.longField,

  /* gov document */
  'space': $x.fields.keywordField,
  'createOrgFee': $x.fields.longField,
  'createProposalFee': $x.fields.longField,
  'createVoteFee': $x.fields.longField,

  /* org document */
  'symbol': $x.fields.keywordField,
  'decimals': $x.fields.intField,
  'joinStake': $x.fields.longField,
  'joinFee': $x.fields.longField,
  'joinTokens': $x.fields.longField,

  /* proposal document */

  /* vote document */
  'voteId':$x.fields.keywordField,
  'orgId': $x.fields.keywordField,
  'proposalId': $x.fields.keywordField,
  'minVoters': $x.fields.longField,
  'maxVoters': $x.fields.longField,
  'voteStart': $x.fields.longField,
  'voteEnd': $x.fields.longField,
  /* joinFee, joinStake */

  /* voter document */
  'memberId': $x.fields.keywordField
}
`
