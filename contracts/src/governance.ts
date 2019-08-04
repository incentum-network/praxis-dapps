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

  $id := $x.contractKey;
  $doc := {
    'id': $id,
    'docType': '${DocTypes.Gov}',
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,

    'name': $form.name,
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
    'id': $id,
    'orgs': 0,
    'votes': 0,
    'proposals': 0,
    'members': 0,
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
  $x.notNegative($form.joinFee);
  $x.notNegative($form.joinTokens);
  $x.assert.isOk($form.name, 'name is required');
  $x.assert.isOk($form.symbol, 'symbol is required');

  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $i := $inputs[0];
  $o := $i.output;
  $x.assert.equal($count($o.coins), 1, 'must only have one coin');
  $coin := $o.coins[0];
  $x.assert.isTrue($x.coin.same($coin, $state.createOrgFee), 'coin must be PRAX');
  $x.assert.equal($coin.amount, $state.createOrgFee.amount, 'you must send exactly ' & $x.toDisplay($state.createOrgFee) & ' PRAX');

  $idx := $state.orgs;
  $id := $state.name & '/org/' & $idx;
  $doc := {
    'id': $id,
    'name': $form.name,
    'docType': '${DocTypes.Org}',
    'owner': $action.ledger,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,
    'symbol': $form.symbol,
    'decimals': $form.decimals,
    'joinFee': $form.joinFee,
    'joinTokens': $form.joinTokens
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

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

  $idx := $state.proposals;
  $id := $state.name & '/proposal/' & $idx;
  $doc := {
    'docType': '${DocTypes.Proposal}',
    'id': $id,
    'owner': $action.ledger,
    'name': $form.name,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  $retstate := $merge([$state, { 'proposals': $idx + 1 }]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, '', $action.tags, { 'proposalId': $id });
  $x.result($retstate, [$out])
)
`

export const createVoteProposal =
`
(
  $x.notNegative($form.minVoters);
  $x.notNegative($form.maxVoters);
  $x.notNegative($form.stake);
  $x.assert.isOk($form.name, 'name is required');
  $x.assert.isOk($form.voteStart, 'voteStart is required');
  $x.assert.isOk($form.voteEnd, 'voteEnd is required');
  $x.assert.isOk($form.orgId, 'orgId is required');
  $x.assert.isOk($form.proposalId, 'proposalId is required');
  $x.assert.include(['majority','quadratic'], $form.voteType, 'invalid vote type');

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
    'id': $id,
    'docType': '${DocTypes.VoteProposal}',
    'owner': $action.ledger,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description,
    'name': $form.name,
    'voteType': $form.voteType,
    'orgId': $form.orgId,
    'proposalId': $form.proposalId,
    'minVoters': $form.minVoters,
    'maxVoters': $form.maxVoters,
    'voteEnd': $toMillis($form.voteEnd),
    'voteStart': $toMillis($form.voteStart),
    'stake': $form.stake
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  $retstate := $merge([$state, { 'votes': $idx + 1 }]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, '', $action.tags, { 'voteProposalId': $id });
  $x.result($retstate, [$out])
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
    'queryText': 'id:"' & $form.orgId & '" docType:"${DocTypes.Org}"',
    'retrieveFields': ['id', 'joinFee', 'joinTokens', 'decimals', 'symbol']
  };
  $find := $searchSpace($state.space, $query);
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));
  $x.assert.equal($find.hits.totalHits, 1, 'org not found');
  $org := $find.hits.hits[0].fields;

  /* check payment */
  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $i := $inputs[0];
  $o := $i.output;
  $x.assert.equal($count($o.coins), 1, 'must only have one coin');
  $coin := $o.coins[0];
  $joinFee := $x.toCoinUnit($org.joinFee, $x.coin.praxDecimals);
  $joinFeeCoin := $x.coin.prax($joinFee);
  $x.assert.isTrue($x.coin.same($coin, $joinFeeCoin), 'coin must be PRAX');
  $x.assert.equal($coin.amount, $joinFeeCoin.amount, 'you must send exactly ' & $org.joinFee & ' PRAX');

  /* add member */
  $idx := $state.members;
  $id := $org.id & '/member/' & $idx;
  $doc := {
    'docType': '${DocTypes.Member}',
    'id': $id,
    'orgId': $org.id,
    'owner': $action.ledger,
    'title': $form.title,
    'subtitle': $form.subtitle,
    'description': $form.description
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  /* mint my vote tokens */
  $tokens := $x.toCoinUnit($org.joinTokens, $org.decimals);
  $mint := $x.mint($action.ledger, $org.symbol, $tokens, $org.decimals, $form.title, $form.subtitle, '', $action.tags);
  $retstate := $merge([$state, { 'members': $idx + 1 }]);
  $x.result($retstate, [], [$mint])
)
`

export const vote =
`
(
  $x.assert.include(['for','against'], $form.vote, 'invalid vote');

  /* find vote proposal */
  $query := {
    'queryParser': {
      'class': 'classic',
      'defaultOperator': 'and',
      'defaultField': 'id'
    },
    'queryText': 'id:"' & $form.voteProposalId & '" docType:"${DocTypes.VoteProposal}"',
    'retrieveFields': ['id', 'stake', 'orgId', 'proposalId']
  };
  $find := $searchSpace($state.space, $query);
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));
  $x.assert.equal($find.hits.totalHits, 1, 'vote proposal not found');
  $voteProposal := $find.hits.hits[0].fields;

  /* find org */
  $query := {
    'queryParser': {
      'class': 'classic',
      'defaultOperator': 'and',
      'defaultField': 'id'
    },
    'queryText': 'id:"' & $voteProposal.orgId & '" docType:"${DocTypes.Org}"',
    'retrieveFields': ['id', 'decimals', 'symbol']
  };
  $findOrg := $searchSpace($state.space, $query);
  $x.assert.isNotOk($findOrg.error, 'search failed ' & $errorMessage($findOrg));
  $x.assert.equal($findOrg.hits.totalHits, 1, 'org not found');
  $org := $findOrg.hits.hits[0].fields;

  /* find member */
  $query := {
    'queryParser': {
      'class': 'classic',
      'defaultOperator': 'and',
      'defaultField': 'id'
    },
    'queryText': 'orgId:"' & $org.id & '" docType:"${DocTypes.Member}"' & ' owner:"' & $action.ledger & '"',
    'retrieveFields': ['id']
  };
  $findMember := $searchSpace($state.space, $query);
  $x.assert.isNotOk($findMember.error, 'search failed ' & $errorMessage($find));
  $x.assert.equal($findMember.hits.totalHits, 1, 'member not found for org');
  $member := $findMember.hits.hits[0].fields;

  $x.assert.equal($count($inputs), 2, 'two inputs are required');
  /* check stake */
  $i0 := $inputs[0];
  $o0 := $i0.output;
  $x.assert.equal($count($o0.coins), 1, 'must only have one coin');
  $coin0 := $o0.coins[0];
  $stake := $x.toCoinUnit($voteProposal.stake, $x.coin.praxDecimals);
  $stakeCoin := $x.coin.prax($stake);
  $x.assert.isTrue($x.coin.same($coin0, $stakeCoin), 'coin must be PRAX');
  $x.assert.equal($coin0.amount, $stakeCoin.amount, 'you must send exactly ' & $voteProposal.stake & ' PRAX');

  $amount := $voteProposal.voteType = 'majority' ?
  (
    $x.assert.equal(1, $form.votes, 'invalid vote count, must be 1 for majority');
    1
  ) : (
    $x.assert.isAtLeast(1, $form.votes, 'invalid vote count, must be 1 or greater for quadratic');
    $form.votes * $form.votes
  );

  /* check vote tokens */
  $i1 := $inputs[1];
  $o1 := $i1.output;
  $x.assert.equal($count($o1.coins), 1, 'must only have one coin');
  $coin1 := $o1.coins[0];
  $convertAmount := $x.toCoinUnit($amount, $org.decimals);
  $coinAmount := $x.coin.new($convertAmount, $org.symbol, $org.decimals);
  $x.assert.isTrue($x.coin.greaterThanOrEqual($coin1, $coinAmount), 'not enough vote tokens for vote');

  /* add vote */
  $doc := {
    'docType': '${DocTypes.Vote}',
    'memberId': $member.id,
    'voteProposalId': $voteProposal.id,
    'owner': $action.ledger,
    'vote': $form.vote,
    'votes': $form.votes
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  /* compute new vote token amount and send back */
  $out := $x.outputLessCoin($o1, $convertAmount);
  $x.result($state, [$out])
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

export const getVoteProposal =
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
  {
    type: 'createProposal',
    code: createProposal,
    language: 'jsonata',
  },
  {
    type: 'createVoteProposal',
    code: createVoteProposal,
    language: 'jsonata',
  },
  {
    type: 'joinOrg',
    code: joinOrg,
    language: 'jsonata',
  },
  {
    type: 'vote',
    code: vote,
    language: 'jsonata',
  },
]
);
