#!/usr/bin/env node

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

import * as yargs from 'yargs'
import {Argv} from 'yargs';
import { template as governanceTemplate } from './governance'
import { txSaveTemplate, setNetwork, ILedger, IPraxisResult, success, statusMessage } from '@incentum/praxis-client'
import { Identities } from '@incentum/crypto';
import { TemplateJson, hashJson, toTemplateJson } from '@incentum/praxis-interfaces';

const argv: any = yargs
  .command('praxis-save-template', 'Save Template', (yargs: Argv) => {
      return yargs.option('template', {
        describe: 'Template Name',
        default: 'governance',
        demand: true,
      }).option('mnemonic', {
        describe: 'mnemonic',
        demand: true,
      }).option('versionMajor', {
        describe: 'versionMajor',
        demand: true,
      }).option('versionMinor', {
        describe: 'versionMinor',
        type: 'number',
        demand: true,
      }).option('versionPatch', {
        describe: 'versionPatch',
        type: 'number',
        demand: true,
      }).option('network', {
        describe: 'network',
        type: 'number',
        demand: true,
        default: 'local',
      })
  }).argv;

const mnemonic = argv.mnemonic ? argv.mnemonic : 'clay harbor enemy utility margin pretty hub comic piece aerobic umbrella acquire'

let address = ''
switch (argv.network) {
  case 'local': {
    setNetwork('local')
    address = Identities.Address.fromPassphrase(mnemonic, 23)
    break;
  }
  case 'testnet': {
    setNetwork('testnet')
    address = Identities.Address.fromPassphrase(mnemonic, 65)
    break;
  }
  case 'devnet': {
    setNetwork('devnet')
    address = Identities.Address.fromPassphrase(mnemonic, 30)
    break;
  }
  case 'mainnet': {
    setNetwork('mainnet')
    address = Identities.Address.fromPassphrase(mnemonic, 55)
    break;
  }
  default: {
    setNetwork('local')
    address = Identities.Address.fromPassphrase(mnemonic, 23)
    break;
  }
}

const ledger: ILedger = {
  ledger: address,
  mnemonic,
}

let template: TemplateJson
switch (argv.template) {
  case 'governance':
    template = governanceTemplate(ledger.ledger)
    break;
  default:
    template = governanceTemplate(ledger.ledger)
    break;
}

template.versionMajor = argv.versionMajor ? argv.versionMajor : 1
template.versionMinor = argv.versionMinor ? argv.versionMinor : 0
template.versionPatch = argv.versionPatch ? argv.versionPatch : 8

console.log('ledger', ledger);
console.log('template', `${template.name} ${template.versionMajor}.${template.versionMinor}.${template.versionPatch}`)

async function main() {
  try {
    const json = toTemplateJson(template)
    console.log('template', json)
    const result: IPraxisResult = await txSaveTemplate(toTemplateJson(template), ledger)
    if (success(result)) {
      console.log('Template Hash', hashJson(template))
    } else {
      console.log('txSaveTemplate failed', statusMessage(result))
    }
  } catch (e) {
    console.log('txSaveTemplate failed', e)
  }
}

main()
