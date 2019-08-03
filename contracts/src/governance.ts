import { createTemplate } from './helpers';
import { TemplateJson } from '@incentum/praxis-interfaces';
import { DocTypes, fields } from './shared/governance'

export const start =
`
(
  $x.notNegative($form.createOrgFee);
  $x.notNegative($form.createVoteFee);
  $x.notNegative($form.createProposalFee);

  $space := $form.space;
  $permissions := {
    "_praxis_commitSpace": true,
    "_praxis_addDocument": true,
    "_praxis_deleteDocument": true,
    "_praxis_updateDocument": true,
    "_praxis_search": true
  };

  $cs := $createSpace($space, $permissions);
  $x.assert.isNotOk($cs.error, 'createSpace failed ' & $errorMessage($cs));

  $fields := ${fields};
  $rf := $registerFieldsForSpace($space, $fields);
  $x.assert.isNotOk($rf.error, 'registerFieldsForSpace failed ' & $errorMessage($rf));

  $doc := {
    'docType': '${DocTypes.Gov}',
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,

    'owner': $action.ledger,
    'space': $action.ledger & ':' & $space,
    'createOrgFee': $form.createOrgFee,
    'createVoteFee': $form.createVoteFee,
    'createProposalFee': $form.createProposalFee
  };
  $addDocumentToSpaceThenCommit($space, $doc);

  $createOrgFee := $x.toCoinUnit($form.createOrgFee, $x.coin.praxDecimals);
  $createVoteFee := $x.toCoinUnit($form.createVoteFee, $x.coin.praxDecimals);
  $createProposalFee := $x.toCoinUnit($form.createProposalFee, $x.coin.praxDecimals);
  $newstate := {
    'orgs': 0,
    'votes': 0,
    'proposals': 0,
    'name': $form.name,
    'space': $action.ledger & ':' & $space,
    'owner': $action.ledger,
    'createOrgFee': $x.coin.prax($createOrgFee),
    'createVoteFee': $x.coin.prax($createVoteFee),
    'createProposalFee': $x.coin.prax($createProposalFee),
    'view': {
      'title': $form.title,
      'subtitle': $form.subtitle,
      'description': $form.description,
      'msgs': ['gov started']
    }
  };
  $retstate := $merge([$state, $newstate]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, 'Send this output to the contract to interact with it', $action.tags);
  $x.result($retstate, [$out])
)
`

export const createOrg =
`
(
  $x.notNegative($form.decimals);
  $x.notNegative($form.joinStake);
  $x.notNegative($form.joinFee);
  $x.notNegative($form.joinTokens);
  $x.assert.isOk($form.symbol, 'symbol is required');

  $idx := $state.orgs;
  $doc := {
    'id': $state.name & '/org/' & $idx
    'docType': '${DocTypes.Org}',
    'owner': $action.ledger,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,
    'symbol': $form.symbol,
    'decimals': $form.decimals,
    'joinFee': $form.joinFee,
    'joinStake': $form.joinStake,
    'joinTokens': $form.joinTokens,
  };
  $addDocumentToSpaceThenCommit($space, $doc);

  $newstate := {
    'orgs': $idx + 1
  };
  $retstate := $merge([$state, $newstate]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, 'Send this output to the contract to interact with it', $action.tags);
  $x.result($retstate, [$out])
)
`

export const createProposal =
`
(
  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $i := $inputs[0];
  $o := $i.output;
  $x.assert.equal($count($o.coins), 1, 'must only have one coin');
  $coin := $o.coins[0];
  $x.assert.isTrue($x.coin.same($coin, $state.createProposalFee), 'coin must be PRAX');
  $x.assert.equal($coin.amount, $state.createProposalFee.amount, 'you must send exactly ' & $x.toDisplay($state.createProposalFee) & ' PRAX');

  $idx := $state.proposal;
  $registerFee := $x.toCoinUnit($form.registerFee, $x.coin.praxDecimals);
  $id := $state.name & '/proposal/' & $idx;

  $doc := {
    'docType': '${DocTypes.Proposal}',
    'id': $id,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,
    'owner': $action.ledger,
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  $retstate := $merge([$state, { 'proposals': $idx + 1 }]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, '', $action.tags, { 'proposalId': $proposalId });
  $x.result($retstate, [$out])
)
`

export const createVote =
`
(
  $x.notNegative($form.minVoters);
  $x.notNegative($form.maxVoters);
  $x.notNegative($form.registerFee);
  $x.assert.isOk($form.orgId, 'orgId is required');
  $x.assert.isOk($form.orgId, 'proposalId is required');

  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $i := $inputs[0];
  $o := $i.output;
  $x.assert.equal($count($o.coins), 1, 'must only have one coin');
  $coin := $o.coins[0];
  $x.assert.isTrue($x.coin.same($coin, $state.createVoteFee), 'coin must be PRAX');
  $x.assert.equal($coin.amount, $state.createVoteFee.amount, 'you must send exactly ' & $x.toDisplay($state.createVoteFee) & ' PRAX');

  $idx := $state.votes;
  $id := $state.name & '/vote/' & $idx;

  $doc := {
    'docType': '${DocTypes.Vote}',
    'orgId': $form.orgId,
    'proposalId': $form.proposalId,
    'minVoters': $form.minVoters,
    'maxVoters': $form.maxVoters,
    'voteEnd': $toMillis($form.voteEnd),
    'voteStart': $toMillis($form.voteStart),
    'registerFee': form.registerFee,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,
    'owner': $action.ledger,
    'docType': 'incentum-quadratic-voting-issue'
  };

  $addDocumentToSpaceThenCommit($state.space, $doc);

  $registerFee := $x.toCoinUnit($form.registerFee, $x.coin.praxDecimals);
  $issue := {
    'issueId': $issueId,
    'issue': $form.shortname,
    'minVoters': $form.minVoters,
    'maxVoters': $form.maxVoters,
    'registerFee': $x.coin.prax($registerFee),
    'voteStart': $toMillis($form.voteStart),
    'voteEnd': $toMillis($form.voteEnd),
    'voterIdx': 0
  };

  $newstate := {
    'issueIdx': $idx,
    'issues': $merge([$state.issues, { $issueId: $issue }]),
    'issueFees': $x.addCoins($state.createIssueFee, $coin)
  };

  $retstate := $merge([$state, $newstate]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, '', $action.tags, { 'issueId': $issueId });
  $x.result($retstate, [$out])
)
`

export const registerToVote =
`
(
  $queryText := 'voteId:"' & $form.voteId & '" docType:"${DocTypes.Vote}"';
  $query := {
    'queryParser': {
      'class': 'classic',
      'defaultOperator': 'and',
      'defaultField': 'voteId'
    },
    'queryText': $queryText
  };
  $find := $searchSpace($state.space, $query);
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));
  $x.assert.equal($find.hits.totalHits, 1, 'vote not found');

  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $i := $inputs[0];
  $o := $i.output;
  $x.assert.equal($count($o.coins), 1, 'must only have one coin');
  $coin := $o.coins[0];
  $x.assert.isOk($x.coin.same($coin, $state.createIssueFee), 'coin must be PRAX');
  $issue := $lookup($state.issues, $form.issueId);
  $x.assert.isOk($issue, 'issue not found for ' & $form.issueId);
  $x.assert.equal($coin.amount, $issue.registerFee.amount, 'you must send ' & $x.toDisplay($issue.registerFee) & ' PRAX');
  $x.assert.isAtMost($x.now, $issue.voteStart, 'voting has already started');
  $x.assert.isAtMost($issue.voterIdx, $issue.maxVoters, 'too many voters');


  $doc := {
    'issueId': $issue.issueId,
    'voterIdx': $issue.voterIdx,
    'space': $state.space,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,
    'voter': $action.ledger,
    'docType': 'incentum-quadratic-voting-issue-register'
  };

  $addDocumentToSpaceThenCommit($state.space, $doc);

  $newstate := $state ~> |issues|{ $form.issueId: $issue ~> |$|{ 'voterIdx': voterIdx + 1 }|}|;
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, '', $action.tags, { 'issueId': $issueId });
  $x.result($newstate, [$out])
)
`

export const joinOrg =
`
(
  /* find org */
  $query := {
    'queryParser': {
      'class': 'classic',
      'defaultOperator': 'and',
      'defaultField': 'id'
    },
    'queryText': 'id:"' & $form.orgId & '" docType:"${DocTypes.Org}"'
  };
  $find := $searchSpace($state.space, $query);
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));
  $x.assert.equal($find.hits.totalHits, 1, 'org not found');
  $org := $find.hits.hits[0];

  /* check payment */
  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $i := $inputs[0];
  $o := $i.output;
  $x.assert.equal($count($o.coins), 1, 'must only have one coin');
  $coin := $o.coins[0];
  $joinFee := $x.toCoinUnit($form.joinFee, $x.coin.praxDecimals);
  $joinFeeCoin := $x.coin.prax($joinFee);
  $x.assert.isTrue($x.coin.same($coin, $joinFeeCoin), 'coin must be PRAX');
  $x.assert.equal($coin.amount, $joinFeeCoin.amount, 'you must send exactly ' & $form.joinFee & ' PRAX');

  /* add member */
  $idx := $state.members;
  $id := $org.id & '/member/' & $idx;
  $doc := {
    'docType': '${DocTypes.Member}',
    'id': $id,
    'org': $org.id,
    'owner': $action.ledger
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  /* mint my vote tokens */
  $token := $state.joinTokens;
  $mint := $x.mint($action.ledger, $token.symbol, $token.amount, $token.decimals, $form.title, $form.subtitle, '', $action.tags);
  $x.result($state, [], [$mint])
)
`

export const vote =
`
(
)
`

export const listOrgs =
`
(
)
`

export const listProposals =
`
(
)
`

export const listVotes =
`
(
)
`

export const getOrg =
`
(
)
`

export const getProposal =
`
(
)
`

export const getVote =
`
(
)
`

export const template = (ledger): TemplateJson => createTemplate('incentum-governance', ledger,
[
  {
    type: 'start',
    code: start,
    language: 'jsonata',
  },
  {
    type: 'createOrg',
    code: createOrg,
    language: 'jsonata',
  },
]
);
