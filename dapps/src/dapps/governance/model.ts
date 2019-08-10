import { createActionObject } from '../../utils'
import { Model } from 'dva'
import { hashContractKey } from '@incentum/praxis-contracts'
import { OrgDoc, GovDoc, ProposalDoc, MemberDoc, VoteProposalDoc } from '../../shared/governance'
import { Alert } from 'react-native'

export enum SegmentTabOrder {
  orgs = 0,
  proposals = 1,
  voting = 2,
}

export interface GovernanceModel {
  spinner: boolean
  govs: Gov[]
  govIdx: number
  selectedTab: SegmentTabOrder
  orgSections: any[]
  proposalSections: any[]
  voteSections: any[]
}

export interface Proposal extends ProposalDoc {
  extra: number
}

export interface VoteProposal extends VoteProposalDoc {
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

export function getGov(model: GovernanceModel): Gov | undefined {
  return model.govIdx >= 0 ? model.govs[model.govIdx] : undefined
}

export function getOrgs(model: GovernanceModel): Org[] {
  const gov = getGov(model)
  return gov ? gov.orgs : []
}

export function getOrg(model: GovernanceModel): Org | undefined {
  const gov = getGov(model)
  return gov && gov.orgIdx >= 0 ? gov.orgs[gov.orgIdx] : undefined
}

export function getProposals(model: GovernanceModel): Proposal[] {
  const gov = getGov(model)
  return gov ? gov.proposals : []
}

export function getProposal(model: GovernanceModel): Proposal | undefined {
  const gov = getGov(model)
  return gov && gov.proposalIdx >= 0 ? gov.proposals[gov.proposalIdx] : undefined
}

export function getProposalIdx(model: GovernanceModel): number {
  const gov = getGov(model)
  return gov ? gov.proposalIdx : -1
}

export function getOrgIdx(model: GovernanceModel): number {
  const gov = getGov(model)
  return gov ? gov.orgIdx : -1
}

export function getVoteProposals(model: GovernanceModel): VoteProposal[] {
  const gov = getGov(model)
  return gov ? gov.voteProposals : []
}

export function getVoteProposal(model: GovernanceModel): VoteProposal | undefined {
  const gov = getGov(model)
  return gov && gov.voteProposalIdx >= 0 ? gov.voteProposals[gov.voteProposalIdx] : undefined
}

export interface Gov extends GovDoc {
  orgs: Org[]
  orgIdx: number
  voteProposals: VoteProposal[]
  voteProposalIdx: number
  proposals: Proposal[]
  proposalIdx: number
}

const model: Model = {
  namespace: 'governance',
  state: {
    spinner: false,
    govIdx: 0,
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
        name: 'US of T&A',
        voteProposals: [],
        orgIdx: -1,
        voteProposalIdx: -1,
        proposalIdx: -1,
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
    selectGov(state: GovernanceModel, { payload: { govIdx } }): GovernanceModel {
      return {
        ...state,
        govIdx,
      }
    },
    selectProposal(state: GovernanceModel, { payload: { proposalIdx } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      govs[state.govIdx] = {
        ...gov,
        proposalIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    selectOrg(state: GovernanceModel, { payload: { orgIdx } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      govs[state.govIdx] = {
        ...gov,
        orgIdx,
      }
      return {
        ...state,
        govs,
      }
    },
  },
  effects: {
    *saveOrg({ payload: { org, history } }, { select, call, put }) {
      try {
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        console.log('saveOrg', e)
        Alert.alert('Save Org Failed', e.toString())
      }
    },

    *saveProposal({ payload: { proposal, history } }, { select, call, put }) {
      try {
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        console.log('saveOrg', e)
        Alert.alert('Save Org Failed', e.toString())
      }
    },

    *saveVoteProposal({ payload: { voteProposal, history } }, { select, call, put }) {
      try {
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        console.log('saveOrg', e)
        Alert.alert('Save Org Failed', e.toString())
      }
    },

    *saveGov({ payload: { gov, history } }, { select, call, put }) {
      try {
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        console.log('saveGov', e)
        Alert.alert('Save Gov Failed', e.toString())
      }
    },

  },
  subscriptions: {
    async setup({ history, dispatch }) {
    },
  },
}

export default model
