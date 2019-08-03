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
import { dropAndCreate, deleteSpace, setExtensions } from '../../helpers'
import { createAction } from '../../../src/helpers'

import { template as govTemplateFunc } from '../../../src/governance'
import { accountOutputsTemplate, accountOutputsContractKey } from '../account-outputs/account-outputs';
import BigNumber from 'bignumber.js';
import { Identities } from '@incentum/crypto'
import { signInputs } from '@incentum/praxis-client'
import { omit } from 'lodash';
import { GovForm, GovState } from '../../../src/shared/governance';

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

let issueId: string
let templateHash: string
let contractHash: string
let govTemplate: TemplateJson;
let createState: any
let issueState: any
let registerToVoteState: any
let accountOutputsContractHash: any

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

      const x = setExtensions(contractHash, ret.contract.key, [context], timestamp)
      const createOrgFee = x.toCoinUnit(form.createOrgFee, 8)
      const createVoteFee = x.toCoinUnit(form.createVoteFee, 8)
      const createProposalFee = x.toCoinUnit(form.createProposalFee, 8)

      createState = omit((ret.action as any).state.state, '_stateSpace')
      const should: GovState = {
        orgs: 0,
        votes: 0,
        proposals: 0,
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

  it.skip('createProposal', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        title: 'start quadratic voting issue title',
        subtitle: 'start quadratic voting issue subtitle',
        description: 'start quadratic voting issue description',
        minVoters: 100,
        maxVoters: 1000,
        registerFee: 1000,
        shortname: 'my-issue',
        voteStart: '2019-08-01T00:00:00.000Z',
        voteEnd: '2019-09-01T00:00:00.000Z',
      }
      let output = await getPrax(ledger, 1000)
      const input = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'createIssue', form);
      action.inputs = [input]
      action.signatures = signInputs([input], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      issueState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const registerFee = x.toCoinUnit(form.registerFee, x.coin.praxDecimals);

      issueId = `${issueState.space}-issue-1`;
      const issue = {
        issueId,
        issue: form.shortname,
        minVoters: form.minVoters,
        maxVoters: form.maxVoters,
        registerFee: x.coin.prax(registerFee),
        voteStart: new Date(form.voteStart).getTime(),
        voteEnd: new Date(form.voteEnd).getTime(),
        voterIdx: 0,
      };
      const issueFees = x.addCoins(issueState.createIssueFee, output.coins[0])

      const newstate = {
        issueIdx: 1,
        issues: { [issueId]: issue },
        issueFees,
      };
      const should = {
        ...createState,
        ...newstate,
      }
      expect(issueState).toEqual(should)
      const outputs = await getUnusedOutputs({ledger})
      output = outputs.outputs.find((o) => o.title === 'start quadratic voting issue title')
      expect(output.title).toEqual('start quadratic voting issue title')
      expect(output.subtitle).toEqual('start quadratic voting issue subtitle')
      expect(output.coins.length).toEqual(0)

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it.skip('registerToVote', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        title: 'registering to vote',
        subtitle: 'registering to vote',
      }
      const output = await getPrax(ledger, 100)
      const input = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'registerToVote', form);
      action.inputs = [input]
      action.signatures = signInputs([input], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      registerToVoteState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const outputs = await getUnusedOutputs({ledger})
      const out = outputs.outputs.find((o) => o.title === 'registering to vote')
      expect(out.coins[0].symbol === 'TEST-TOKENS')
      expect(out.coins[0].amount === '10000')

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });

  it.skip('registerToVoteForIssue', async () => {

    if (!contractHash) { return }

    try {
      const form = {
        title: 'registering to vote for my-issue',
        subtitle: 'registering to vote for my-issue',
        issueId,
      }
      const output = await getPrax(ledger, 1000)
      const input = inputFromOutput(output)
      const action = createAction(ledger, contractHash, 'registerToVoteForIssue', form);
      action.inputs = [input]
      action.signatures = signInputs([input], { ledger, mnemonic: seed0})
      const result = await contractAction(action, timestamp)
      registerToVoteState = omit((result.action as any).state.state, '_stateSpace')

      const x = setExtensions(contractHash, result.contract.key, [context], timestamp)
      const outputs = await getUnusedOutputs({ledger})
      const out = outputs.outputs.find((o) => o.title === 'registering to vote for my-issue')
      expect(out).toBeTruthy()

    } catch (e) {
      console.log('error in contract e2e', e)
      expect(true).toEqual(false)
    }

  });
});
