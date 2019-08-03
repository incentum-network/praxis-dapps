import { createActionObject } from '../../utils'
import { Model } from 'dva'
import { hashContractKey } from '@incentum/praxis-contracts'
import { Org } from '../../shared/forms/orgs'

export enum SegmentTabOrder {
  orgs = 0,
  proposals = 1,
  voting = 2,
}

export interface GovernanceModel {
  spinner: boolean
  orgs: Org[]
  selectedTab: SegmentTabOrder
  activeSections: any[]
  orgForm?: Org
}

const model: Model = {
  namespace: 'governance',
  state: {
    spinner: false,
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
      },
    ],
    selectedTab: 0,
    activeSections: [],
  },
  reducers: {
    changeTab(state: GovernanceModel, { payload: { selectedTab } }): GovernanceModel {
      return {
        ...state,
        selectedTab,
      }
    },
    activeSections(state: GovernanceModel, { payload: { activeSections } }): GovernanceModel {
      return {
        ...state,
        activeSections,
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
