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

import { CoinJson } from '@incentum/praxis-interfaces'

export interface GovCommon {
  name: string
  title: string
  subtitle: string
  description: string
  space: string
  createOrgFee: number
  createVoteFee: number
  createProposalFee: number
}

// tslint:disable-next-line:no-empty-interface
export interface GovForm extends GovCommon {
}

export interface GovDoc extends GovCommon {
  id: string
  docType: string
  owner: string
  hash: string
  contractHash: string
}

export interface GovState {
  id: string
  orgs: number
  votes: number
  proposals: number
  members: number
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
  name: string
  title: string
  subtitle: string
  description: string
  symbol: string
  decimals: number
  joinFee: number
  joinTokens: number
}

// tslint:disable-next-line:no-empty-interface
export interface OrgForm extends OrgCommon {
}

export interface OrgDoc extends OrgCommon {
  id: string
  docType: string
  owner: string
}

export interface ProposalCommon {
  name: string
  title: string
  subtitle: string
  description: string
}

// tslint:disable-next-line:no-empty-interface
export interface ProposalForm extends ProposalCommon {
}

export interface ProposalDoc extends ProposalCommon {
  id: string
  docType: string
  owner: string
}

export enum VoteValue {
  for = 'for',
  against = 'against',
}

export enum VoteTypes {
  majority = 'majority',
  quadratic = 'quadratic',
}

export interface VoteProposalCommon {
  name: string
  title: string
  subtitle: string
  description: string
  orgId: string
  proposalId: string
  minVoters: number
  maxVoters: number
  stake: number
  winPercent: number
}

export interface VoteProposalForm extends VoteProposalCommon {
  voteStart: string
  voteEnd: string
  voteType: VoteTypes
}

export interface VoteProposalDoc extends VoteProposalCommon {
  id: string
  docType: string
  owner: string
  voteStart: number
  voteEnd: number
  voteType: string
}

export interface MemberCommon {
  title: string
  subtitle: string
  description: string
  orgId: string
}

// tslint:disable-next-line:no-empty-interface
export interface MemberForm extends MemberCommon {
}

export interface MemberDoc extends MemberCommon {
  id: string
  docType: string
  owner: string
}

export interface VoteCommon {
  voteProposalId: string
  memberId: string
  votes: number
  vote: string
}

// tslint:disable-next-line:no-empty-interface
export interface VoteForm extends VoteCommon {
}

export interface VoteDoc extends VoteCommon {
  docType: string
  owner: string
}

export interface VoteResultForm {
  title: string
  maxVoters: number
  voteProposalId: string
}

export interface CloseVoteForm {
  voteProposalId: string
  maxVoters: number
  title: string
  subtitle: string
}

export interface CloseVoteDoc extends VoteProposalDoc {
  for: number
  against: number
  forStake: number
  againstStake: number
}

export interface JoinOrgForm {
  orgId: string
  title: string
  subtitle: string
}

export enum DocTypes {
  Gov = 'praxis-governance',
  Org = 'praxis-organization',
  Proposal = 'praxis-proposal',
  VoteProposal = 'praxis-vote-proposal',
  Member = 'praxis-member',
  Vote = 'praxis-vote',
  CloseVote = 'praxis-close-vote',
}

export const fields =
`
{
  /* common fields */
  'id': $x.fields.keywordField,
  'name': $x.fields.keywordField,
  'title': $x.fields.whitespaceTextField,
  'subtitle': $x.fields.whitespaceTextField,
  'description': $x.fields.whitespaceTextField,
  'docType': $x.fields.keywordField,
  'owner': $x.fields.keywordField,
  'version': $x.fields.longField,
  'govId': $x.fields.keywordField,

  /* gov document */
  'space': $x.fields.keywordField,
  'createOrgFee': $x.fields.longField,
  'createProposalFee': $x.fields.longField,
  'createVoteFee': $x.fields.longField,
  'hash': $x.fields.keywordField,

  /* org document */
  'symbol': $x.fields.keywordField,
  'decimals': $x.fields.intField,
  'joinStake': $x.fields.longField,
  'joinFee': $x.fields.longField,
  'joinTokens': $x.fields.longField,

  /* proposal document */

  /* vote proposal document */
  'voteProposalId':$x.fields.keywordField,
  'orgId': $x.fields.keywordField,
  'proposalId': $x.fields.keywordField,
  'minVoters': $x.fields.longField,
  'maxVoters': $x.fields.longField,
  'voteStart': $x.fields.longField,
  'voteEnd': $x.fields.longField,
  'stake': $x.fields.longField,
  'winPercent': $x.fields.longField,
  'voteType': $x.fields.keywordField,

  /* member document */
  'memberId': $x.fields.keywordField,

  /* vote document */
  'vote': {
    'type': 'text',
    'search': true,
    'facet': 'flat',
    'group': true,
    'store': true,
    'facetIndexFieldName': 'facet_vote'
  },
  'votes': $x.fields.longField,

  /* close vote document */
  'for': $x.fields.longField,
  'against': $x.fields.longField,
  'forStake': $x.fields.floatField,
  'againstStake': $x.fields.floatField,
  'closed': $x.fields.keywordField

}
`
