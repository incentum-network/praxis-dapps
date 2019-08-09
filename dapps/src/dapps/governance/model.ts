import { createActionObject } from '../../utils'
import { Model } from 'dva'
import { hashContractKey } from '@incentum/praxis-contracts'
import { OrgDoc, GovDoc, ProposalDoc, MemberDoc, VoteProposalDoc } from '../../shared/governance'

export enum SegmentTabOrder {
  orgs = 0,
  proposals = 1,
  voting = 2,
}

export interface GovernanceModel {
  spinner: boolean
  govs: Gov[]
  idx: number
  selectedTab: SegmentTabOrder
  orgSections: any[]
  proposalSections: any[]
  voteSections: any[]
}

export interface Proposal extends ProposalDoc {
  extra: number
}

export interface Vote extends VoteProposalDoc {
  extra: number
}

export interface Org extends OrgDoc {
  members: Member[]
}

export interface Member extends MemberDoc {
  ledger: string
}

export function getMember(ledger: string, org: Org): MemberDoc | undefined {
  return org.members && org.members.find((m) => m.ledger === ledger)
}

export interface Gov extends GovDoc {
  orgs: Org[]
  votes: Vote[]
  proposals: Proposal[]
}

const model: Model = {
  namespace: 'governance',
  state: {
    spinner: false,
    idx: 0,
    govs: [
      {
        orgs: [
          {
            title: 'Org Title 0',
            subtitle: 'Org Subtitle 0',
            owner: 'ownerasdfadfadf',
            contractKey: 'org/yachters',
            id: hashContractKey('ownerasfasdf', 'org/yachters'),
            version: 1,
            description: '### Markdown description\nThis is the greatest yacht club ever!',
            symbol: 'YACHT',
            decimals: 1,
            joinStake: 1000,
            joinFee: 50,
            approveJoin: false,
            approver: '',
            voteProposalFee: 500,
            joinTokens: 10000,
            extra: 0,
          },
        ],
        proposals: [
          {
            title: 'Some proposal',
            subtitle: 'Some proposal subtitle',
            description: '### Proposal Description',
          },
        ],
        votes: [],
      },
    ],
    selectedTab: 0,
    orgSections: [],
    proposalSections: [],
    voteSections: [],
  },
  reducers: {
    changeTab(state: GovernanceModel, { payload: { selectedTab } }): GovernanceModel {
      return {
        ...state,
        selectedTab,
      }
    },
    orgSections(state: GovernanceModel, { payload: { orgSections } }): GovernanceModel {
      return {
        ...state,
        orgSections,
      }
    },
    voteSections(state: GovernanceModel, { payload: { voteSections } }): GovernanceModel {
      return {
        ...state,
        voteSections,
      }
    },
    proposalSections(state: GovernanceModel, { payload: { proposalSections } }): GovernanceModel {
      return {
        ...state,
        proposalSections,
      }
    },
  },
  effects: {
  },
  subscriptions: {
    async setup({ history, dispatch }) {
    },
  },
}

export default model
