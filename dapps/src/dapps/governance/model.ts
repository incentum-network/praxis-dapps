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

import { createActionObject, createAction } from '../../utils'
import { Model } from 'dva'
import { Alert } from 'react-native-web-extended'

import {
  getLedger,
  LedgerModel,
  Ledger,
  ledgerReady,
  getUnusedOutputs,
} from '../../models/ledger'

import {
  OrgDoc,
  GovDoc,
  ProposalDoc,
  MemberDoc,
  VoteProposalDoc,
  OrgForm,
  ProposalForm,
  VoteProposalForm,
  JoinOrgForm,
  DocTypes,
} from './governance'

import {
  IPraxisResult,
  success,
  statusMessage,
  txContractStart,
  txContractAction,
  setNetwork,
  signInputs,
  txAccountToOutput,
  txInstanceSearch,
  txContractFromAction,
  setNetworkUrl
} from '@incentum/praxis-client'

import {
  ActionJson,
  uniqueKey,
  ContractStartPayload,
  hashJson,
  ContractResult,
  ContractActionPayload,
  OutputJson,
  inputFromOutput,
  AccountToOutputPayload,
  InstanceSearchPayload,
  GetContractFromActionPayload
} from '@incentum/praxis-interfaces'

import {
  Hit
} from '@incentum/praxis-spaces'

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
  templateHash: string
}

interface IId {
  id: string
}

export interface Proposal extends ProposalDoc, IId {
  extra: number
}

function toProposal(doc: ProposalDoc): Proposal {
  return {
    ...doc,
    extra: 0,
  }
}

export interface VoteProposal extends VoteProposalDoc, IId {
  extra: number
}

function toVoteProposal(doc: VoteProposalDoc): VoteProposal {
  return {
    ...doc,
    extra: 0,
  }
}

export interface Org extends OrgDoc {
  members: Member[]
}

function toOrg(doc: OrgDoc): Org {
  return {
    ...doc,
    members: [],
  }
}

export interface Member extends MemberDoc {
  ledger: string
}

export function isMember(ledger: Ledger, gov: Gov, org: Org): boolean {
  const hasOrgCoin = !!ledger.outputs.find((o) => o.coins.length > 0 && o.coins[0].symbol === org.symbol && o.coins[0].mint === gov.contractHash)
  return  hasOrgCoin || !!org.members.find((m) => m.orgId === org.id)
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
  output?: OutputJson
}

function toGov(doc: GovDoc): Gov {
  return {
    ...doc,
    orgs: [],
    orgIdx: -1,
    voteProposals: [],
    voteProposalIdx: -1,
    proposals: [],
    proposalIdx: -1,
  }
}

type O = Org | Proposal | VoteProposal
type D = OrgDoc | ProposalDoc | VoteProposalDoc

function mergeDocs(objs: O[], docs: D[], convert: (doc: any) => O): O[] {
  const rets = objs.map((obj) => {
    const doc = docs.find((doc) => doc.id === obj.id)
    return doc ? {
      ...obj,
      ...doc,
    } : obj
  })
  docs.forEach((doc) => {
    const obj = rets.find((obj) => doc.id === obj.id)
    if (!obj) {
      rets.push(convert(doc))
    }
  })
  return rets
}

const model: Model = {
  namespace: 'governance',
  state: {
    spinner: false,
    templateHash: '06e23e2d71abdd83b5f6e2e4bcb477d28c25eb111e5f3db5af11b7a599a169aa',
    govIdx: -1,
    govs: [],
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
    addGov(state: GovernanceModel, { payload: { gov } }): GovernanceModel {
      const govs = state.govs.slice(0)
      govs.push(gov)
      const govIdx = govs.length - 1
      return {
        ...state,
        govs,
        govIdx,
      }
    },
    setGovs(state: GovernanceModel, { payload: { govs } }): GovernanceModel {
      const govIdx = state.govIdx >= 0 ? state.govIdx : govs.length > 0 ? 0 : -1
      return {
        ...state,
        govs,
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
    addProposal(state: GovernanceModel, { payload: { proposal } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const proposals = gov.proposals.slice(0)
      proposals.push(proposal)
      const proposalIdx = proposals.length - 1
      govs[state.govIdx] = {
        ...gov,
        proposals,
        proposalIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    setProposals(state: GovernanceModel, { payload: { proposals } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const proposalIdx = gov.proposalIdx >= 0 ? gov.proposalIdx : proposals.length > 0 ? 1 : -1
      govs[state.govIdx] = {
        ...gov,
        proposals,
        proposalIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    selectVoteProposal(state: GovernanceModel, { payload: { voteProposalIdx } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      govs[state.govIdx] = {
        ...gov,
        voteProposalIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    addVoteProposal(state: GovernanceModel, { payload: { voteProposal } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const voteProposals = gov.voteProposals.slice(0)
      voteProposals.push(voteProposal)
      const voteProposalIdx = voteProposals.length - 1
      govs[state.govIdx] = {
        ...gov,
        voteProposals,
        voteProposalIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    setVoteProposals(state: GovernanceModel, { payload: { voteProposals } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const voteProposalIdx = gov.voteProposalIdx >= 0 ? gov.voteProposalIdx : voteProposals.length > 0 ? 1 : -1
      govs[state.govIdx] = {
        ...gov,
        voteProposals,
        voteProposalIdx,
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
    setOrgs(state: GovernanceModel, { payload: { orgs } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const orgIdx = gov.orgIdx >= 0 ? gov.orgIdx : orgs.length > 0 ? 1 : -1
      govs[state.govIdx] = {
        ...gov,
        orgs,
        orgIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    addOrg(state: GovernanceModel, { payload: { org } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const orgs = gov.orgs.slice(0)
      orgs.push(org)
      const orgIdx = orgs.length - 1
      govs[state.govIdx] = {
        ...gov,
        orgs,
        orgIdx,
      }
      return {
        ...state,
        govs,
      }
    },
    orgJoined(state: GovernanceModel, { payload: { org, member } }): GovernanceModel {
      if (state.govIdx < 0) { return state }
      const gov = getGov(state)!
      const govs = state.govs.slice(0)
      const neworg = {
        ...org,
        members: org.members.concat([member]),
      }
      const orgs = gov.orgs.map((o) => o.id === neworg.id ? neworg : org)
      govs[state.govIdx] = {
        ...gov,
        orgs,
      }
      return {
        ...state,
        govs,
      }
    },
    showAlert(state: GovernanceModel, { payload: { title, msg }}): GovernanceModel {
      console.log('showAlert', title)
      Alert.alert(
        title,
        msg,
        [
          {text: 'OK', onPress: () => { return }, style: 'cancel'},
        ]
      )
      return state
    },
    startSpinner(state: GovernanceModel): GovernanceModel {
      return {
        ...state,
        spinner: true,
      }
    },
    stopSpinner(state: GovernanceModel): GovernanceModel {
      return {
        ...state,
        spinner: false,
      }
    },

  },
  effects: {
    *saveOrg({ payload: { org, history } }, { select, call, put }) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        const current = getLedger(ledger)
        if (!gov || (!(yield call(ledgerReady, current, 'createOrgFee')))) {
          yield put(createActionObject('showAlert', { title: 'Save Org Failed', msg: `Please select a gov and a ledger` }))
        } else {
          yield put(createAction('startSpinner'))
          const createOrgFee = yield call(getPrax, current, gov.createOrgFee)
          yield put(createAction('stopSpinner'))
          if (!(yield call(ledgerReady, current, 'createOrg'))) {
            return
          }
          yield put(createAction('startSpinner'))
          const created: Org = yield call(createOrg, gov, org, current, createOrgFee)
          yield put(createAction('stopSpinner'))
          if (created) {
            yield put(createActionObject('addOrg', { org: created }))
          }
        }
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('saveOrg', e)
        Alert.alert('Save Org Failed', e.toString())
      }
    },

    *saveProposal({ payload: { proposal, history } }, { select, call, put }) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        const current = getLedger(ledger)
        if (!gov || (!(yield call(ledgerReady, current, 'createProposalFee')))) {
          yield put(createActionObject('showAlert', { title: 'Save Proposal Failed', msg: `Please select a gov and a ledger` }))
        } else {
          yield put(createAction('startSpinner'))
          const createProposalFee = yield call(getPrax, current, gov.createProposalFee)
          yield put(createAction('stopSpinner'))
          if (!(yield call(ledgerReady, current, 'createProposal'))) {
            return
          }
          yield put(createAction('startSpinner'))
          const created: Proposal = yield call(createProposal, gov, proposal, current, createProposalFee)
          yield put(createAction('stopSpinner'))
          if (created) {
            yield put(createActionObject('addProposal', { proposal: created }))
          }
        }
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('saveProposal', e)
        Alert.alert('Save Proposal Failed', e.toString())
      }
    },

    *saveVoteProposal({ payload: { voteProposal, history } }, { select, call, put }) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        const current = getLedger(ledger)
        const org = getOrg(governance)
        const proposal = getProposal(governance)
        if (!gov || !org || !proposal || (!(yield call(ledgerReady, current, 'createVoteProposalFee')))) {
          yield put(createActionObject('showAlert', { title: 'Save VoteProposal Failed', msg: `Please select a gov, ledger, org, and proposal` }))
        } else {
          yield put(createAction('startSpinner'))
          const createVoteFee = yield call(getPrax, current, gov.createVoteFee)
          yield put(createAction('stopSpinner'))
          if (!(yield call(ledgerReady, current, 'createVoteProposal'))) {
            return
          }
          voteProposal.orgId = org.id
          voteProposal.proposalId = proposal.id
          console.log('voteProposal form', voteProposal)
          yield put(createAction('startSpinner'))
          const created: VoteProposal = yield call(createVoteProposal, gov, voteProposal, current, createVoteFee)
          yield put(createAction('stopSpinner'))
          if (created) {
            yield put(createActionObject('addVoteProposal', { voteProposal: created }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Save Vote Proposal Failed', msg: `Save Vote Proposal failed` }))
          }
        }
        setTimeout(() => history.goBack(), 1000)
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('saveVoteProposal', e)
        Alert.alert('Save Vote Proposal Failed', e.toString())
      }
    },

    *joinOrg({ payload: { org } }, { select, call, put }) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        const current = getLedger(ledger)
        if (!gov || (!(yield call(ledgerReady, current, 'joinOrgFee')))) {
          yield put(createActionObject('showAlert', { title: 'Join Org Failed', msg: `Please select a gov and ledger` }))
        } else {
          yield put(createAction('startSpinner'))
          const joinOrgFee = yield call(getPrax, current, org.joinFee)
          yield put(createAction('stopSpinner'))
          if (!(yield call(ledgerReady, current, 'joinOrg'))) {
            return
          }
          const form: JoinOrgForm = {
            orgId: org.id,
            title: `Voting tokens for ${org.title}`,
            subtitle: `Voting tokens for ${org.subtitle}`,
          }
          yield put(createAction('startSpinner'))
          const [member, msg]: [Member | null, string] = yield call(joinOrg, gov, current, form, joinOrgFee)
          yield put(createAction('stopSpinner'))
          if (member) {
            yield put(createActionObject('orgJoined', { org, member }))
            yield put(createActionObject('showAlert', { title: 'Join Org', msg: 'Organization Joined' }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Join Org Failed', msg }))
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('joinOrg', e)
        Alert.alert('Join Org Failed', e.toString())
      }
    },

    *vote({ payload: { voteProposal, vote, history } }, { select, call, put }) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        const current = getLedger(ledger)
        if (!gov || (!(yield call(ledgerReady, current, 'voteStake')))) {
          yield put(createActionObject('showAlert', { title: 'Vote Failed', msg: `Please select a gov and ledger` }))
        } else {
          yield put(createAction('startSpinner'))
          console.log('vote', voteProposal)
          const stake = yield call(getPrax, current, voteProposal.stake)
          let tokens = getVoteTokens(current.outputs, voteProposal.orgId)
          if (!tokens) {
            const result: IPraxisResult = yield getUnusedOutputs(current, call)
            tokens = getVoteTokens(result.praxis.outputs, voteProposal.orgId)
          }
          yield put(createAction('stopSpinner'))
          if (!stake || !tokens) {
            yield put(createActionObject('showAlert', { title: 'Vote Failed', msg: 'Vote failed, vote tokens not found or not enough stake' }))
          } else {
            if (!(yield call(ledgerReady, current, 'vote'))) { return }
            yield put(createAction('startSpinner'))
            vote.voteProposalId = voteProposal.id
            const msg = yield call(voteAction, gov, current, vote, tokens, stake)
            yield put(createAction('stopSpinner'))
            if (!msg) {
              yield put(createActionObject('showAlert', { title: 'Vote Successful', msg: 'Vote Accepted' }))
            } else {
              yield put(createActionObject('showAlert', { title: 'Vote Failed', msg }))
            }
          }
          setTimeout(() => history.goBack(), 1000)
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('vote', e)
        Alert.alert('Vote Failed', e.toString())
      }
    },

    *saveGov({ payload: { gov, history, ledger } }, { select, call, put }) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'saveGov', true))) {
          yield put(createActionObject('showAlert', { title: 'Save Gov Failed', msg: `Please select a ledger` }))
        } else {
          const governance: GovernanceModel = yield select(state => state.governance)
          console.log('governance', governance)
          yield put(createAction('startSpinner'))
          const result: IPraxisResult = yield call(saveGov, gov, current, governance)
          yield put(createAction('stopSpinner'))
          if (success(result)) {
            const contract: ContractResult = result.transactionResult!.result
            const govDoc: GovDoc = getEphemeral(result)
            govDoc.contractHash = hashJson(contract.contract)
            yield put(createActionObject('addGov', { gov: toGov(govDoc) }))
            yield put(createActionObject('showAlert', { title: 'Gov Saved', msg: 'Government Saved'}))
            setTimeout(() => history.goBack(), 1000)
          } else {
            yield put(createActionObject('showAlert', { title: 'Save Gov Failed', msg: `Save Gov failed, ${statusMessage(result)}` }))
          }
          }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('saveGov error', e)
        Alert.alert('Save Gov Failed', e.toString())
      }
    },
    *refreshGovs({ payload: { } }, { select, call, put } ) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshGovs'))) { return }
        yield put(createAction('startSpinner'))
        const result: IPraxisResult = yield getUnusedOutputs(current, call)
        yield put(createAction('stopSpinner'))
        console.log('refreshGovs', result)
        if (success(result)) {
          const governance: GovernanceModel = yield select(state => state.governance)
          const govDocs = result.praxis.outputs.filter((o) => o.tags.includes('gov')).map((o) => {
            const ret: [OutputJson, GovDoc] = [o, o.data as GovDoc]
            return ret
          }).filter((doc) => doc[1].hash && doc[1].hash === governance.templateHash)
          const govs = governance.govs.map((gov) => {
            const doc = govDocs.find((doc) => doc[1].id === gov.id)
            return doc ? {
              ...gov,
              ...doc[1],
              output: doc[0],
            } : gov
          })
          govDocs.forEach((doc) => {
            const gov = govs.find((gov) => doc[1].id === gov.id)
            if (!gov) {
              govs.push({...toGov(doc[1]), output: doc[0]})
            }
          })
          for (const gov of govs) {
            if (!gov.contractHash) {
              const payload: GetContractFromActionPayload = {
                hash: gov.output!.actionHash,
              }
              yield put(createAction('startSpinner'))
              const praxisResult: IPraxisResult = yield call(txContractFromAction, payload, current)
              yield put(createAction('stopSpinner'))
              const result: ContractResult = praxisResult.transactionResult.result
              gov.contractHash = hashJson(result.contract)
            }
          }
          console.log('refreshGovs', govs)
          yield put(createActionObject('setGovs', { govs }))
        } else {
          yield put(createActionObject('showAlert', { title: 'Refresh Govs', msg: statusMessage(result) }))
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showAlert', { title: 'Refresh Outputs', msg: e.toString() }))
      }
    },

    *refreshOrgs({ payload: { } }, { select, call, put } ) {
      try {
        console.log('refreshOrgs model')
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshOrgs'))) { return }
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        if (!gov) {
          yield put(createActionObject('showAlert', { title: 'Refresh Orgs', msg: 'Please select a gov' }))
        } else {
          yield put(createAction('startSpinner'))
          const hits: Hit[] = yield call(list, 'listOrgs', gov, current)
          yield put(createAction('stopSpinner'))
          if (hits) {
            const orgDocs: OrgDoc[] = hits.map((h) => h.fields as OrgDoc)
            const orgs = mergeDocs(gov.orgs, orgDocs, toOrg)
            console.log('refreshOrgs', orgs)
            yield put(createActionObject('setOrgs', { orgs }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Refresh Orgs', msg: 'No orgs found' }))
          }
          }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showAlert', { title: 'Refresh Orgs', msg: e.toString() }))
      }
    },

    *refreshProposals({ payload: { } }, { select, call, put } ) {
      try {
        console.log('refreshProposals')
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshProposals'))) { return }
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        if (!gov) {
          yield put(createActionObject('showAlert', { title: 'Refresh Proposals', msg: 'Please select a gov' }))
        } else {
          yield put(createAction('startSpinner'))
          const hits: Hit[] = yield call(list, 'listProposals', gov, current)
          yield put(createAction('stopSpinner'))
          if (hits) {
            const proposalDocs: ProposalDoc[] = hits.map((h) => h.fields as ProposalDoc)
            const proposals = mergeDocs(gov.proposals, proposalDocs, toProposal)
            console.log('refreshProposals', proposals)
            yield put(createActionObject('setProposals', { proposals }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Refresh Proposals', msg: 'Refresh Proposals failed' }))
          }
          }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showAlert', { title: 'Refresh Proposals', msg: e.toString() }))
      }
    },

    *refreshVoteProposals({ payload: { } }, { select, call, put } ) {
      try {
        console.log('refreshVoteProposals')
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshVoteProposals'))) { return }
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        if (!gov) {
          yield put(createActionObject('showAlert', { title: 'Refresh Vote Proposals', msg: 'Please select a gov' }))
        } else {
          yield put(createAction('startSpinner'))
          const hits: Hit[] = yield call(list, 'listVoteProposals', gov, current)
          yield put(createAction('stopSpinner'))
          if (hits) {
            const voteProposalDocs: VoteProposalDoc[] = hits.map((h) => h.fields as VoteProposalDoc)
            const voteProposals = mergeDocs(gov.voteProposals, voteProposalDocs, toVoteProposal)
            console.log('refreshVoteProposals', voteProposals)
            yield put(createActionObject('setVoteProposals', { voteProposals }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Refresh Vote Proposals', msg: 'Refresh Proposals failed' }))
          }
          }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showAlert', { title: 'Refresh Vote Proposals', msg: e.toString() }))
      }
    },

  },
  subscriptions: {
    async setup({ history, dispatch }) {
      setNetworkUrl('local', 'http://192.168.71.120:4003')
    },
  },
}

function getEphemeral<T>(result: IPraxisResult): T {
  return (result.praxis.instances[0].action as any).state.state._ephemeral as T
}

function govContractKey(gov: Gov): string {
  return `gov/${gov.name}`
}

function getVoteTokens(outputs: OutputJson[], orgId: string): OutputJson | undefined {
  console.log('getVoteTokens', outputs)
  console.log('getVoteTokens', orgId)
  return outputs.find((o) => o.data && o.data.docType === DocTypes.Member && o.data.orgId === orgId)
}

async function getPrax(ledger: Ledger, i: number): Promise<OutputJson | undefined> {
  const amount = `${Number(i) * 1e8}`
  const payload: AccountToOutputPayload = { amount }
  const a2o: IPraxisResult = await txAccountToOutput(payload, ledger)
  return a2o.praxis.outputs.find((o) => o.title === 'PRAX tokens from wallet' && o.coins[0].amount === amount)
}

async function saveGov(gov: Gov, ledger: Ledger, governance: GovernanceModel) {
  gov.owner = ledger.ledger
  const action: ActionJson = {
    ...getAction(ledger, 'start', gov),
    contractHash: governance.templateHash,
  }

  const payload: ContractStartPayload = {
    key: govContractKey(gov),
    action,
    initialState: {},
  }

  console.log('saveGov', payload)
  const result = await txContractStart(payload, ledger)
  console.log('saveGov', result)
  return result
}

async function createOrg(gov: Gov, form: OrgForm, ledger: Ledger, fee: OutputJson): Promise<Org | undefined> {
  const org = await create<OrgDoc>(gov, 'createOrg', form, ledger, fee)
  console.log('createOrg', org)
  return org ? toOrg(org) : undefined
}

async function createProposal(gov: Gov, form: ProposalForm, ledger: Ledger, fee: OutputJson): Promise<Proposal | undefined> {
  const proposal = await create<Proposal>(gov, 'createProposal', form, ledger, fee)
  console.log('createProposal', proposal)
  return proposal ? toProposal(proposal) : undefined
}

async function createVoteProposal(gov: Gov, form: VoteProposalForm, ledger: Ledger, fee: OutputJson): Promise<VoteProposal | undefined> {
  const voteProposal = await create<VoteProposal>(gov, 'createVoteProposal', form, ledger, fee)
  console.log('createVoteProposal', voteProposal)
  return voteProposal ? toVoteProposal(voteProposal) : undefined
}

async function create<T>(gov: Gov, reducer: string, form: any, ledger: Ledger, fee: OutputJson): Promise<T | undefined> {
  const action: ActionJson = {
    ...getAction(ledger, reducer, form),
    contractHash: gov.contractHash,
  }
  const inputs = [inputFromOutput(fee)]
  const signatures = signInputs(inputs, ledger)
  action.inputs = inputs
  action.signatures = signatures
  const payload: ContractActionPayload = {
    action,
  }
  const result = await txContractAction(payload, ledger)
  console.log('create', result)
  return success(result) ? getEphemeral(result) : undefined
}

async function list<T>(reducer: string, gov: Gov, ledger: Ledger): Promise<T | undefined> {
  console.log(reducer, gov)
  const action: ActionJson = {
    ...getAction(ledger, reducer, { max: 100}),
    contractHash: gov.contractHash,
  }
  const payload: ContractActionPayload = {
    action,
  }
  const result = await txContractAction(payload, ledger)
  console.log(reducer, result)
  return success(result) ? getEphemeral(result) : undefined
}

async function joinOrg(gov: Gov, ledger: Ledger, form: any, joinOrgFee: OutputJson): Promise<[Member | null, string]> {
  const action: ActionJson = {
    ...getAction(ledger, 'joinOrg', form),
    contractHash: gov.contractHash,
  }
  const inputs = [inputFromOutput(joinOrgFee)]
  const signatures = signInputs(inputs, ledger)
  action.inputs = inputs
  action.signatures = signatures
  const payload: ContractActionPayload = {
    action,
  }
  const result = await txContractAction(payload, ledger)
  console.log('joinOrg', result)
  return success(result) ? [getEphemeral(result), ''] : [null, statusMessage(result)]
}

async function voteAction(gov: Gov, ledger: Ledger, form: any, tokens: OutputJson, stake: OutputJson): Promise<string> {
  console.log('voteAction', form)
  const action: ActionJson = {
    ...getAction(ledger, 'vote', form),
    contractHash: gov.contractHash,
  }
  const inputs = [inputFromOutput(stake), inputFromOutput(tokens)]
  const signatures = signInputs(inputs, ledger)
  action.inputs = inputs
  action.signatures = signatures
  const payload: ContractActionPayload = {
    action,
  }
  const result = await txContractAction(payload, ledger)
  console.log('vote', result)
  return success(result) ? '' : statusMessage(result)
}

function getAction(ledger: Ledger, type: string, form: any): ActionJson {
  return {
    form,
    type,
    nonce: uniqueKey(),
    ledger: ledger.ledger,

    key: '',
    other: {},
    tags: [],
    outputs: [],
    inputs: [],
    signatures: [],
    transaction: '',
    previousHash: '',
    contractHash: '',
    timestamp: Date.now(),
  }
}

export default model
