import { TemplateJson } from '@incentum/praxis-interfaces';

const startReducer = `
(
  $newState := {
    'owner': $action.ledger,
    'hashes': {},
    'total': $x.coin.new(0, $form.symbol, $form.decimals)
  };
  $x.result($newState)
)
`

const accountToOutputReducer = `
(
  $x.assert.equal($action.ledger, $state.owner, 'invalid owner');
  $minted := $x.mint($form.sender, $state.total.symbol, $form.amount, $state.total.decimals, $form.title, $form.subtitle, '', $action.tags);
  $total := $x.plus($state.total.amount, $form.amount);
  $coin := $merge([$state.total, { 'amount': $total}]);
  $newState := $merge([$state, { 'total': $coin}]);
  $x.result($newState, [], [$minted])
)
`

const coinToOutputReducer = `
(
  $x.assert.equal($action.ledger, $state.owner, 'invalid owner');
  $exists := $lookup($state.hashes, $form.hash);
  $x.assert.isNotOk($exists, 'hash already exists');
  $hashes := $merge([$state.hashes, { $form.hash: true }]);
  $newState := $merge([$state, { 'hashes': $hashes }]);
  $x.result($newState)
)
`

const outputToAccountReducer = `
(
  $x.assert.equal($action.ledger, $state.owner, 'invalid owner');
  $x.assert.equal($count($inputs), 1, 'only one input allowed');
  $input := $inputs[0];
  $output := $input.output;
  $x.assert.equal($count($output.coins), 1, 'only one coin allowed');
  $coin := $output.coins[0];
  $x.assert.isTrue($x.coin.same($coin, $state.total), 'coin mismatch');
  $total := $x.minus($state.total.amount, $coin.amount);
  $x.assert.isTrue($x.notNegative($total), 'total is negative');
  $coin := $merge([$state.total, { 'amount': $total}]);
  $newState := $merge([$state, { 'total': $coin}]);
  $x.result($newState)
)
`

const accountOutputsTemplateName = 'AccountOutputs'
export const accountOutputsContractKey = `token/PRAX/0`;
export const accountOutputsTemplate = (ledger: string): TemplateJson => {
  return {
    ledger,
    name: accountOutputsTemplateName,
    versionMajor: 1,
    versionMinor: 0,
    versionPatch: 0,
    description: 'Coins to Outputs',
    other: {},
    tags: [],
    reducers: [
      {
        type: 'start',
        language: 'jsonata',
        code: startReducer,
      },
      {
        type: 'accountToOutput',
        language: 'jsonata',
        code: accountToOutputReducer,
      },
      {
        type: 'coinToOutput',
        language: 'jsonata',
        code: coinToOutputReducer,
      },
      {
        type: 'outputToAccount',
        language: 'jsonata',
        code: outputToAccountReducer,
      },
    ],
  };

};
