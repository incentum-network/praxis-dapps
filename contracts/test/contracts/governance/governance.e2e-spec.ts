import {
  TemplateJson,
  hashJson,
  ActionJson,
  StateJson,
  toContractJson,
  toTemplateJson,
  OutputJson,
} from '@incentum/praxis-interfaces';

import { saveTemplate, startContract, contractAction, getUnusedOutputs } from '@incentum/praxis-db'
import { uniqueKey, Template, inputFromOutput } from '@incentum/praxis-contracts';
import { spaceExtensionContext, setRootDir, setDevEnv, Commit } from '@incentum/praxis-spaces';
import { dropAndCreate, deleteSpace, setExtensions, findDocumentById, findByQuery } from '../../helpers'
import { createAction } from '../../../src/helpers'

import { template as govTemplateFunc } from '../../../src/governance'
import { accountOutputsTemplate, accountOutputsContractKey } from '../account-outputs/account-outputs';
import BigNumber from 'bignumber.js';
import { Identities } from '@incentum/crypto'
import { signInputs } from '@incentum/praxis-client'
import { omit } from 'lodash';
import {
  GovForm,
  GovState,
  OrgForm,
  OrgDoc,
  DocTypes,
  ProposalForm,
  ProposalDoc,
  VoteProposalForm,
  VoteProposalDoc,
  MemberDoc,
  VoteTypes,
  VoteDoc,
  VoteValue
} from '../../../src/shared/governance';

declare var expect: any
declare var describe: any
declare var beforeAll: any
declare var afterAll: any
declare var it: any

const space = 'testGov'

const seed0 = 'wife smoke shuffle decade dizzy swim verb marriage leave gown reject wild'
const seed1 = 'gather table measure power ticket tuition attend under twice awake crunch party'
const ledger = Identities.Address.fromPassphrase(seed0, 30)
const contractKey = 'governance/0'
let startContractKey;
const anotherLedger = Identities.Address.fromPassphrase(seed1, 30)
const accountLedger = 'DBAgvThPiCKBpBCCFBHQaGwRkevSXbBGFp'
const state: StateJson = {
  coins: [],
  state: {},
}

function findLastCommit(hash: string): Promise<Commit> {
  return undefined
}

const context = spaceExtensionContext(ledger, state, contractKey, findLastCommit)
const anotherContext = spaceExtensionContext(anotherLedger, state, contractKey, findLastCommit)
const anotherSpace = `${ledger}:${space}`

setRootDir('/home/bill/.spaces-test')
setDevEnv()
const timestamp = Date.now()

let orgState: any
let voteState: any
let memberState: any
let orgId: string
let templateHash: string
let voteProposalId: string
let memberId: string
let proposalId: string
let proposalState: any
let contractHash: string
let govTemplate: TemplateJson;
let createState: any
let accountOutputsContractHash: any
let out: OutputJson
let voteout: OutputJson

async function getPrax(ledger: string, amount): Promise<OutputJson> {
  const random = `${uniqueKey()}`
  const form = {
    title: 'some prax',
    subtitle: random,
    sender: ledger,
    amount: (new BigNumber(amount)).shiftedBy(8).toString(),
  }
  const action = createAction(accountLedger, accountOutputsContractHash, 'accountToOutput', form);
  const result = await contractAction(action, timestamp)
  const outputs = await getUnusedOutputs({ledger})
  return outputs.outputs.find((o) => o.subtitle === random)
}

describe('governance e2e', async () => {

  beforeAll(async () => {
    await dropAndCreate()
    await deleteSpace(context, space)
  });

  afterAll(async () => {
    await deleteSpace(context, space)
  });

  it('start account-outputs and get some prax', async () => {

    const template = accountOutputsTemplate(accountLedger)
    try {
      templateHash = hashJson(template)
      const result: any = await saveTemplate({ template })
      const compareHash = hashJson(toTemplateJson(result))
      expect(compareHash).toEqual(templateHash)

      const ttemplate = new Template(template)
      const state: StateJson = { state: {}, coins: []}
      const form: any = {
        decimals: 8,
        symbol: 'PRAX',
      }
      const action: ActionJson = createAction(accountLedger, templateHash, 'start', form);
      const key = accountOutputsContractKey
      const ret = await startContract(key, action, {}, {}, timestamp)
      // expect
      accountOutputsContractHash = hashJson(toContractJson(ret.contract))
    } catch (e) {
      console.log('saveTemplate failed', e)
      expect(true).toEqual(false)
    }
  });

  it('create template', async () => {

    govTemplate = govTemplateFunc(ledger)
    try {
      templateHash = hashJson(govTemplate)
      const result = await saveTemplate({ template: govTemplate })
      const compareHash = hashJson(toTemplateJson(result))
      expect(compareHash).toEqual(templateHash)
    } catch (e) {
      console.log('saveTemplate failed', e)
      expect(true).toEqual(false)
    }

  });

  it('start governance', async () => {
    const name = 'empire'
    const form: GovForm = {
      space,
      name,
      title: 'start governance title',
      subtitle: 'start governance subtitle',
      description: 'start governance description',
      createOrgFee: 100,
      createVoteFee: 100,
      createProposalFee: 100,
    }
    const action = createAction(ledger, templateHash, 'start', form);

    try {
      const ret = await startContract(contractKey, action, {}, {}, timestamp)
      startContractKey = ret.contract.key

      const x = setExtensions(contractHash, ret.contract.key, [context], timestamp)
      const createOrgFee = x.toCoinUnit(form.createOrgFee, 8)
      const createVoteFee = x.toCoinUnit(form.createVoteFee, 8)
      const createProposalFee = x.toCoinUnit(form.createProposalFee, 8)

      createState = omit((ret.action as any).state.state, '_stateSpace')
      const should: GovState = {
        id: startContractKey,
        orgs: 0,
        votes: 0,
        proposals: 0,
        members: 0,
        name,
        space: `${ledger}:${space}`,
        owner: ledger,
        createOrgFee: x.coin.prax(createOrgFee),
        createVoteFee: x.coin.prax(createVoteFee),
        createProposalFee: x.coin.prax(createProposalFee),
        view: {
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          msgs: ['gov started'],
        },
      };

      expect(createState).toEqual(should)
      contractHash = hashJson(toContractJson(ret.contract))

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }
  });

  it('createOrg', async () => {

    if (!contractHash) { return }

    try {
      const form: OrgForm = {
        name: 'myorg',
        title: 'create org title',
        subtitle: 'create org subtitle',
        description: 'create org description',
        decimals: 0,
        symbol: 'MYORGTOKENS',
        joinFee: 100,
        joinTokens: 10000,
      }
      let output = await getPrax(ledger, 100)
      const input = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'createOrg', form);
      action.inputs = [input]
      action.signatures = signInputs([input], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      orgState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const idx = 0
      orgId = `${orgState.name}/org/${idx}`

      const doc = await findDocumentById(context, space, orgId, DocTypes.Org,
        ['id', 'docType', 'owner', 'name', 'title', 'subtitle', 'description', 'decimals', 'symbol', 'joinFee', 'joinTokens']
      )
      const orgDoc: OrgDoc = {
        id: orgId,
        docType: DocTypes.Org,
        owner: ledger,
        name: form.name,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        decimals: form.decimals,
        symbol: form.symbol,
        joinFee: form.joinFee,
        joinTokens: form.joinTokens,
      };
      expect(orgDoc).toEqual(doc)

      const newstate = {
        orgs: 1,
      };
      const should = {
        ...createState,
        ...newstate,
      }
      expect(orgState).toEqual(should)
      const outputs = await getUnusedOutputs({ledger})
      output = outputs.outputs.find((o) => o.title === 'create org title')
      expect(output.title).toEqual('create org title')
      expect(output.subtitle).toEqual('create org subtitle')
      expect(output.coins.length).toEqual(0)

    } catch (e) {
      console.log('error in createOrg e2e', e)
      expect(true).toEqual(false)
    }

  });

  it('createProposal', async () => {

    if (!contractHash) { return }

    try {
      const form: ProposalForm = {
        name: 'myproposal',
        title: 'a proposal title',
        subtitle: 'a proposal subtitle',
        description: 'a proposal description',
      }
      let output = await getPrax(ledger, 100)
      const fee = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'createProposal', form);
      action.inputs = [fee]
      action.signatures = signInputs([fee], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      proposalState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const idx = 0
      proposalId = `${orgState.name}/proposal/${idx}`

      const doc = await findDocumentById(context, space, proposalId, DocTypes.Proposal,
        ['id', 'docType', 'owner', 'name', 'title', 'subtitle', 'description']
      )
      const proposalDoc: ProposalDoc = {
        id: proposalId,
        docType: DocTypes.Proposal,
        owner: ledger,
        name: form.name,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
      };
      expect(proposalDoc).toEqual(doc)

      const newstate = {
        orgs: 1,
      };
      const should = {
        ...proposalState,
        ...newstate,
      }
      expect(proposalState).toEqual(should)
      const outputs = await getUnusedOutputs({ledger})
      output = outputs.outputs.find((o) => o.title === form.title)
      expect(output.title).toEqual(form.title)
      expect(output.subtitle).toEqual(form.subtitle)
      expect(output.coins.length).toEqual(0)

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it('createVoteProposal', async () => {

    if (!contractHash) { return }

    try {
      const form: VoteProposalForm = {
        name: 'myvote',
        title: 'a vote title',
        subtitle: 'a vote subtitle',
        description: 'a vote description',
        orgId,
        proposalId,
        voteType: VoteTypes.majority,
        stake: 100,
        minVoters: 10,
        maxVoters: 10000,
        voteStart: '2019-07-31',
        voteEnd: '2019-08-30',
      }
      let output = await getPrax(ledger, 100)
      const input = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'createVoteProposal', form);
      action.inputs = [input]
      action.signatures = signInputs([input], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      voteState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const idx = 0
      voteProposalId = `${voteState.name}/vote/${idx}`

      const doc = await findDocumentById(context, space, voteProposalId, DocTypes.VoteProposal,
        ['id', 'docType', 'owner', 'name', 'title', 'subtitle', 'description', 'voteType', 'minVoters', 'maxVoters', 'stake', 'voteStart', 'voteEnd', 'orgId', 'proposalId']
      )
      const voteDoc: VoteProposalDoc = {
        id: voteProposalId,
        orgId,
        proposalId,
        docType: DocTypes.VoteProposal,
        owner: ledger,
        voteType: form.voteType,
        name: form.name,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        minVoters: form.minVoters,
        maxVoters: form.maxVoters,
        stake: form.stake,
        voteStart: new Date(form.voteStart).getTime(),
        voteEnd: new Date(form.voteEnd).getTime(),
      };
      expect(voteDoc).toEqual(doc)

      const newstate = {
        votes: 1,
      };
      const should = {
        ...voteState,
        ...newstate,
      }
      expect(voteState).toEqual(should)
      const outputs = await getUnusedOutputs({ledger})
      output = outputs.outputs.find((o) => o.title === form.title)
      expect(output.title).toEqual(form.title)
      expect(output.subtitle).toEqual(form.subtitle)
      expect(output.coins.length).toEqual(0)

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it('joinOrg', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        title: 'joining org myorg',
        subtitle: 'joining org myorg',
        description: 'joining org myorg',
        orgId,
      }
      const output = await getPrax(ledger, 100)
      const input = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'joinOrg', form);
      action.inputs = [input]
      action.signatures = signInputs([input], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      memberState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const idx = 0
      memberId = `${orgId}/member/${idx}`

      const doc = await findDocumentById(context, space, memberId, DocTypes.Member,
        ['id', 'docType', 'owner', 'title', 'subtitle', 'description', 'orgId']
      )
      const memberDoc: MemberDoc = {
        id: memberId,
        orgId,
        docType: DocTypes.Member,
        owner: ledger,
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
      };
      expect(memberDoc).toEqual(doc)

      const outputs = await getUnusedOutputs({ledger})
      out = outputs.outputs.find((o) => o.title === form.title)
      expect(out).toBeTruthy()
      expect(out.coins.length).toBe(1)
      expect(out.coins[0].symbol).toBe('MYORGTOKENS')
      expect(out.coins[0].amount).toBe('10000')

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it('vote', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        vote: VoteValue.for,
        voteProposalId,
        votes: 1,
      }
      const output = await getPrax(ledger, 100)
      const fee = inputFromOutput(output)
      const voteTokens = inputFromOutput(out)
      const action = createAction(ledger, contractHash, 'vote', form);
      const inputs = [fee, voteTokens]
      action.inputs = inputs
      action.signatures = signInputs(inputs, { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      voteState = omit((result.action as any).state.state, '_stateSpace')

      const queryText = `voteProposalId:"${voteProposalId}" docType:"${DocTypes.Vote}"`
      const query = {
        facets: [
          { dim: 'vote', topN: 10 },
        ],
        queryParser: {
          class: 'classic',
          defaultOperator: 'and',
          defaultField: 'id',
        },
        retrieveFields: ['id', 'docType', 'owner', 'vote', 'votes', 'memberId', 'voteProposalId'],
        queryText,
      }
      const hits = await findByQuery(context, space, query)
      const facetHit = hits.facets[0]
      const vfor = facetHit.counts.find((fh: any[]) => fh[0] === VoteValue.for)
      const vagainst = facetHit.counts.find((fh: any[]) => fh[0] === VoteValue.against)
      const ifor = vfor ? vfor[1] : 0
      const iagainst = vagainst ? vagainst[1] : 0
      expect(ifor).toEqual(1)
      expect(iagainst).toEqual(0)

      const outputs = await getUnusedOutputs({ledger})
      voteout = outputs.outputs.find((o) => o.title === out.title)
      expect(voteout).toBeTruthy()
      expect(voteout.coins.length).toBe(1)
      expect(voteout.coins[0].symbol).toBe('MYORGTOKENS')
      expect(voteout.coins[0].amount).toBe('9999')

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it('vote again', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        vote: VoteValue.against,
        voteProposalId,
        votes: 1,
      }
      const output = await getPrax(ledger, 100)
      const fee = inputFromOutput(output)
      const voteTokens = inputFromOutput(voteout)
      const action = createAction(ledger, contractHash, 'vote', form);
      const inputs = [fee, voteTokens]
      action.inputs = inputs
      action.signatures = signInputs(inputs, { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      voteState = omit((result.action as any).state.state, '_stateSpace')

      const queryText = `voteProposalId:"${voteProposalId}" docType:"${DocTypes.Vote}"`
      const query = {
        facets: [
          { dim: 'vote', topN: 10 },
        ],
        queryParser: {
          class: 'classic',
          defaultOperator: 'and',
          defaultField: 'id',
        },
        retrieveFields: ['id', 'docType', 'owner', 'vote', 'votes', 'memberId', 'voteProposalId'],
        queryText,
      }
      const hits = await findByQuery(context, space, query)
      const facetHit = hits.facets[0]
      const vfor = facetHit.counts.find((fh: any[]) => fh[0] === VoteValue.for)
      const vagainst = facetHit.counts.find((fh: any[]) => fh[0] === VoteValue.against)
      const ifor = vfor ? vfor[1] : 0
      const iagainst = vagainst ? vagainst[1] : 0
      expect(ifor).toEqual(1)
      expect(iagainst).toEqual(1)

      const outputs = await getUnusedOutputs({ledger})
      const resout = outputs.outputs.find((o) => o.title === out.title)
      expect(resout).toBeTruthy()
      expect(resout.coins.length).toBe(1)
      expect(resout.coins[0].symbol).toBe('MYORGTOKENS')
      expect(resout.coins[0].amount).toBe('9998')

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it('get vote result', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        voteProposalId,
        maxVoters: 1000,
        title: 'Vote result for myproposal',
      }
      const action = createAction(ledger, contractHash, 'getVoteResult', form);
      const result = await contractAction(action, timestamp)

      const outputs = await getUnusedOutputs({ledger})
      const resout = outputs.outputs.find((o) => o.title === form.title)
      expect(resout).toBeTruthy()
      expect(resout.subtitle).toBe('for 1, against 1')
      expect(resout.data).toEqual({ for: 1, against: 1})

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

});
