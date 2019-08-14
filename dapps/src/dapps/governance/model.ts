import { createActionObject, createAction } from '../../utils'
import { Model } from 'dva'
import { hashContractKey } from '@incentum/praxis-contracts'
import { OrgDoc, GovDoc, ProposalDoc, MemberDoc, VoteProposalDoc } from '../../shared/governance'
import { Alert } from 'react-native'
import { getLedger, LedgerModel, Ledger, ledgerReady, getUnusedOutputs } from '../../models/ledger'
import { IPraxisResult, success, statusMessage, txContractStart, txContractAction, setNetwork } from '@incentum/praxis-client'
import { ActionJson, uniqueKey, ContractStartPayload, hashJson, ContractResult, ContractActionPayload } from '@incentum/praxis-interfaces'

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
    templateHash: '1409a3dec1b50dfc53fd1d4e5c2c7c21df51313bb1d2d52acd8eb392e85d42ff',
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
    showAlert(state: GovernanceModel, { payload: { title, msg }}): GovernanceModel {
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
        if (!gov || !(yield call(ledgerReady, current, 'saveGov'))) {
          yield put(createActionObject('showAlert', { title: 'Save Org Failed', msg: `Please select a gov and a ledger` }))
        } else {
          yield put(createAction('ledger/changeAmount', { amount: gov.createOrgFee  }))
          yield put(createActionObject('ledger/accountToOutput', { ledger: current }))
          const ledger: LedgerModel = yield select(state => state.ledger)
          const oledger = getLedger(ledger)
          const createOrgFee = `${Number(gov.createOrgFee) * 1e8}`
          const fee = oledger.outputs.find((o) => o.title === 'PRAX tokens from wallet' && o.coins[0].amount === createOrgFee)
          const created: Org = yield call(createOrg, org, ledger, fee)
          yield put(createActionObject('addOrg', { org: created }))
        }
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
            gov.contractHash = hashJson(contract.contract)
            yield put(createActionObject('addGov', { gov, result }))
            yield put(createActionObject('showAlert', { title: 'Gov Saved', msg: 'Government Saved'}))
            setTimeout(() => history.goBack(), 1000)
          } else {
            yield put(createActionObject('showAlert', { title: 'Save Gov Failed', msg: `Save Gov failed, ${statusMessage(result)}` }))
          }
          }
      } catch (e) {
        console.log('saveGov error', e)
        // yield put(createAction('stopSpinner'))
        // Alert.alert('Save Gov Failed', e.toString())
      }
    },
    *refreshGovs({ payload: { } }, { select, call, put } ) {
      try {
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'saveGov'))) { return }
        yield put(createAction('startSpinner'))
        const result: IPraxisResult = yield getUnusedOutputs(current, call)
        yield put(createAction('stopSpinner'))
        console.log('refreshGovs', result)
        if (success(result)) {
          const governance: GovernanceModel = yield select(state => state.governance)
          const govDocs: GovDoc[] = result.praxis.outputs.filter((o) => o.tags.includes('gov')).map((o) => o.data)
          const govs = governance.govs.map((gov) => {
            const doc = govDocs.find((doc) => doc.id === gov.id)
            return doc ? {
              ...gov,
              ...doc,
            } : gov
          })
          govDocs.forEach((doc) => {
            const gov = govs.find((gov) => doc.id === gov.id)
            if (!gov) {
              govs.push(toGov(doc))
            }
          })
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
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshTab'))) { return }
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        if (!gov) {
          yield put(createActionObject('showAlert', { title: 'Refresh Orgs', msg: 'Please select a gov' }))
        } else {
          yield put(createAction('startSpinner'))
          const result: IPraxisResult = yield call(list, 'listOrgs', gov, current)
          yield put(createAction('stopSpinner'))
          console.log('refreshOrgs', result)
          if (success(result)) {
            const contractResult: ContractResult = result.praxis.instances[0]
            const orgDocs: OrgDoc[] = (contractResult.action as any).state.orgs
            const orgs = mergeDocs(gov.orgs, orgDocs, toOrg)
            console.log('refreshOrgs', orgs)
            yield put(createActionObject('setOrgs', { orgs }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Refresh Orgs', msg: statusMessage(result) }))
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
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshProposals'))) { return }
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        if (!gov) {
          yield put(createActionObject('showAlert', { title: 'Refresh Proposals', msg: 'Please select a gov' }))
        } else {
          yield put(createAction('startSpinner'))
          const result: IPraxisResult = yield call(list, 'listProposals', gov, current)
          yield put(createAction('stopSpinner'))
          console.log('refreshProposals', result)
          if (success(result)) {
            const contractResult: ContractResult = result.praxis.instances[0]
            const docs: ProposalDoc[] = (contractResult.action as any).state.orgs
            const proposals = mergeDocs(gov.proposals, docs, toProposal)
            console.log('refreshProposals', proposals)
            yield put(createActionObject('setProposals', { proposals }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Refresh Proposals', msg: statusMessage(result) }))
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
        const ledger: LedgerModel = yield select(state => state.ledger)
        const current = getLedger(ledger)
        if (!(yield call(ledgerReady, current, 'refreshVoteProposals'))) { return }
        const governance: GovernanceModel = yield select(state => state.governance)
        const gov = getGov(governance)
        if (!gov) {
          yield put(createActionObject('showAlert', { title: 'Refresh Vote Proposals', msg: 'Please select a gov' }))
        } else {
          yield put(createAction('startSpinner'))
          const result: IPraxisResult = yield call(list, 'listVoteProposals', gov, current)
          yield put(createAction('stopSpinner'))
          console.log('refreshVoteProposals', result)
          if (success(result)) {
            const contractResult: ContractResult = result.praxis.instances[0]
            const docs: VoteProposalDoc[] = (contractResult.action as any).state.orgs
            const voteProposals = mergeDocs(gov.voteProposals, docs, toVoteProposal)
            console.log('refreshVoteProposals', voteProposals)
            yield put(createActionObject('setVoteProposals', { voteProposals }))
          } else {
            yield put(createActionObject('showAlert', { title: 'Refresh Vote Proposals', msg: statusMessage(result) }))
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
      setNetwork('local')
    },
  },
}

function govContractKey(gov: Gov): string {
  return `gov/${gov.name}`
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

async function saveOrg(gov: Gov, ledger: Ledger, org: Org, governance: GovernanceModel) {
  gov.owner = ledger.ledger
  const action: ActionJson = {
    ...getAction(ledger, 'createOrg', org),
    contractHash: gov.contractHash,
  }

  const payload: ContractActionPayload = {
    action,
  }

  return await txContractAction(payload, ledger)
}

async function list(reducer: string, gov: Gov, ledger: Ledger) {
  const action: ActionJson = {
    ...getAction(ledger, reducer, { max: 100}),
    contractHash: gov.contractHash,
  }
  const payload: ContractActionPayload = {
    action,
  }
  return await txContractAction(payload, ledger)
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
