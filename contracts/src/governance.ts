import { createTemplate } from './helpers';
import { TemplateJson } from '@incentum/praxis-interfaces';
import { DocTypes, fields, VoteValue } from './shared/governance'

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
  $inputMustBe($inputs[0], $state.createOrgFee);

  $idx := $state.orgs;
  $id := $state.name & '/org/' & $idx;
  $doc := {
    'id': $id,
    'name': $form.name,
    'govId': $x.contractKey,
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

  $retstate := $merge([$state, { 'orgs': $idx + 1 }]);
  $out := $x.output($action.ledger, [], $form.title, $form.subtitle, 'Send this output to the contract to interact with it', $action.tags);
  $x.result($retstate, [$out])
)
`

export const createProposal =
`
(
  $x.assert.equal($count($inputs), 1, 'only one input is allowed');
  $inputMustBe($inputs[0], $state.createProposalFee);

  $idx := $state.proposals;
  $id := $state.name & '/proposal/' & $idx;
  $doc := {
    'docType': '${DocTypes.Proposal}',
    'id': $id,
    'govId': $x.contractKey,
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
  $inputMustBe($inputs[0], $state.createVoteFee);

  $idx := $state.votes;
  $id := $join([$x.contractKey, '/', $state.name, '/vote/', $string($idx)]);
  $doc := {
    'id': $id,
    'docType': '${DocTypes.VoteProposal}',
    'govId': $x.contractKey,
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
  $x.assert.equal($count($inputs), 1, 'only one input is allowed');

  /* find org */
  $queryText := ['govId', $x.contractKey, 'id', $form.orgId, 'docType', '${DocTypes.Org}'];
  $q := $query($queryText, ['id', 'joinFee', 'joinTokens', 'decimals', 'symbol']);
  $org := $searchSpace($state.space, $q) ~> $getSingleHit('org');

  /* check payment */
  $joinFee := $x.toCoinUnit($org.joinFee, $x.coin.praxDecimals);
  $joinFeeCoin := $x.coin.prax($joinFee);
  $inputMustBe($inputs[0], $joinFeeCoin);

  /* add member */
  $idx := $state.members;
  $id := $org.id & '/member/' & $idx;
  $doc := {
    'docType': '${DocTypes.Member}',
    'id': $id,
    'govId': $x.contractKey,
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
  $x.assert.equal($count($inputs), 2, 'two inputs are required');
  $x.assert.include(['${VoteValue.for}','${VoteValue.against}'], $form.vote, 'invalid vote');

  /* find vote proposal */
  $queryText := ['govId', $x.contractKey, 'id', $form.voteProposalId, 'docType', '${DocTypes.VoteProposal}'];
  $q := $query($queryText, ['id', 'stake', 'orgId', 'proposalId', 'voteStart', 'voteEnd']);
  $voteProposal := $searchSpace($state.space, $q) ~> $getSingleHit('voteProposal');
  $x.assert.isAtLeast($x.now, $voteProposal.voteStart);
  $x.assert.isBelow($x.now, $voteProposal.voteEnd);

  /* find org */
  $orgText := ['govId', $x.contractKey, 'id', $voteProposal.orgId, 'docType', '${DocTypes.Org}'];
  $q := $query($orgText, ['id', 'decimals', 'symbol']);
  $org := $searchSpace($state.space, $q) ~> $getSingleHit('org');

  /* find member */
  $memberText := ['govId', $x.contractKey, 'orgId', $org.id, 'docType', '${DocTypes.Member}', 'owner', $action.ledger];
  $q := $query($memberText, ['id']);
  $member := $searchSpace($state.space, $q) ~> $getSingleHit('member');

  /* find member */
  $votedText := ['govId', $x.contractKey, 'memberId', $member.id, 'docType', '${DocTypes.Vote}', 'voteProposalId', $voteProposal.id];
  $votedQ := $query($votedText, ['id']);
  $voted := $searchSpace($state.space, $votedQ);
  $x.assert.isNotOk($voted.error, 'search failed ' & $errorMessage($voted));
  $x.assert.equal($voted.hits.totalHits, 0, 'you already voted');

  /* check stake */
  $stake := $x.toCoinUnit($voteProposal.stake, $x.coin.praxDecimals);
  $stakeCoin := $x.coin.prax($stake);
  $inputMustBe($inputs[0], $stakeCoin);

  $amount := $voteProposal.voteType = 'majority' ?
  (
    $x.assert.equal(1, $form.votes, 'invalid vote count, must be 1 for majority');
    1
  ) : (
    $x.assert.isAtLeast(1, $form.votes, 'invalid vote count, must be 1 or greater for quadratic');
    $form.votes * $form.votes
  );

  /* check vote tokens */
  $convertAmount := $x.toCoinUnit($amount, $org.decimals);
  $coinAmount := $x.coin.new($convertAmount, $org.symbol, $org.decimals);
  $inputMustBeAtLeast($inputs[1], $coinAmount);

  /* add vote */
  $doc := {
    'docType': '${DocTypes.Vote}',
    'govId': $x.contractKey,
    'memberId': $member.id,
    'voteProposalId': $voteProposal.id,
    'owner': $action.ledger,
    'vote': $form.vote,
    'votes': $form.votes
  };
  $addDocumentToSpaceThenCommit($state.space, $doc);

  /* compute new vote token amount and send back */
  $out := $x.outputLessCoin($inputs[1].output, $convertAmount);
  $x.result($state, [$out])
)
`

export const getVoteResult =
`
(
  $x.assert.isAtLeast($form.maxVoters, 10, 'invalid maxVoters');
  $queryText := ['govId', $x.contractKey, 'voteProposalId', $form.voteProposalId, 'docType', '${DocTypes.Vote}'];
  $q := $query($queryText, ['vote', 'votes']);
  $find := $searchSpace($state.space, $merge([$q, { 'topHits': $form.maxVoters, 'facets':[{ 'dim': 'vote', 'topN': 10 }] }]));
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));

  $reducer := function($r, $v) {
    (
      $vote := $v.fields.vote;
      $votes := $v.fields.votes;
      $vote = 'for' ? ({ 'for': $r.for + $votes, 'against': $r.against }) : ({ 'for': $r.for, 'against': $r.against + $votes})
    )
  };
  $results := $reduce($find.hits.hits, $reducer, { 'for': 0, 'against': 0 });

  /* Need to implement associated values in facets so we don't have to retrieve all documents
  $facetHit := $find.hits.facets[0];
  $vfor := $filter($facetHit.counts, function($v) { $v[0] = 'for' });
  $vagainst := $filter($facetHit.counts, function($v) { $v[0] = 'against' });
  $ifor := $vfor ? $vfor[1] : 0;
  $iagainst := $vagainst ? $vagainst[1] : 0;
  */

  $subtitle := 'for ' & $results.for & ', against ' & $results.against;
  $out := $x.output($action.ledger, [],  $form.title, $subtitle, '', $action.tags, $results);
  $x.result($state, [$out])
)
`

export const listOrgs =
`
(
  $x.assert.isAtLeast($form.max, 1, 'invalid max');
  $queryText := ['govId', $x.contractKey, 'docType', '${DocTypes.Org}'];
  $q := $query($queryText, [
    'id',
    'govId',
    'name',
    'owner',
    'title',
    'subtitle',
    'description',
    'symbol',
    'decimals',
    'joinFee',
    'joinTokens'
  ]);
  $find := $searchSpace($state.space, $merge([$q, { 'topHits': $form.max}]));
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));

  $out := $x.output($action.ledger, [],  $form.title, $form.subtitle, '', $action.tags, $find.hits.hits);
  $x.result($state, [$out])
)
`

export const listProposals =
`
(
  $x.assert.isAtLeast($form.max, 1, 'invalid max');
  $queryText := ['govId', $x.contractKey, 'docType', '${DocTypes.Proposal}'];
  $q := $query($queryText, [
    'id',
    'govId',
    'owner',
    'name',
    'title',
    'subtitle',
    'description'
  ]);
  $find := $searchSpace($state.space, $merge([$q, { 'topHits': $form.max }]));
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));

  $out := $x.output($action.ledger, [],  $form.title, $form.subtitle, '', $action.tags, $find.hits.hits);
  $x.result($state, [$out])
)
`

export const listVoteProposals =
`
(
  $x.assert.isAtLeast($form.max, 1, 'invalid max');
  $queryText := ['govId', $x.contractKey, 'docType', '${DocTypes.VoteProposal}'];
  $q := $query($queryText, [
    'id',
    'govId',
    'owner',
    'title',
    'subtitle',
    'description',
    'name',
    'voteType',
    'orgId',
    'proposalId',
    'minVoters',
    'maxVoters',
    'voteEnd',
    'voteStart',
    'stake'
  ]);
  $find := $searchSpace($state.space, $merge([$q, { 'topHits': $form.max}]));
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));

  $out := $x.output($action.ledger, [],  $form.title, $form.subtitle, '', $action.tags, $find.hits.hits);
  $x.result($state, [$out])
)
`

export const closeVote =
`
(
  $x.assert.isAtLeast($form.maxVoters, 10, 'invalid maxVoters');

  /* find vote proposal */
  $queryText := ['govId', $x.contractKey, 'id', $form.voteProposalId, 'docType', '${DocTypes.VoteProposal}'];
  $q := $query($queryText, [
    'id',
    'govId',
    'owner',
    'title',
    'subtitle',
    'description',
    'name',
    'voteType',
    'orgId',
    'proposalId',
    'minVoters',
    'maxVoters',
    'voteEnd',
    'voteStart',
    'stake',
    'docType'
  ]);
  $voteProposal := $searchSpace($state.space, $q) ~> $getSingleHit('voteProposal');
  $x.assert.equal($voteProposal.owner, $action.ledger, 'you are not the owner of this proposal');
  $x.assert.isAbove($x.now, $voteProposal.voteEnd, 'voting is not over yet');
  $x.assert.isNotOk($voteProposal.closed, 'voting is already closed');

  $queryText := ['govId', $x.contractKey, 'voteProposalId', $form.voteProposalId, 'docType', '${DocTypes.Vote}'];
  $q := $query($queryText, ['vote', 'votes']);
  $find := $searchSpace($state.space, $merge([$q, { 'topHits': $form.maxVoters, 'facets':[{ 'dim': 'vote', 'topN': 10 }] }]));
  $x.assert.isNotOk($find.error, 'search failed ' & $errorMessage($find));

  $reducer := function($r, $v) {
    (
      $vote := $v.fields.vote;
      $votes := $v.fields.votes;
      $vote = 'for' ? ({ 'for': $r.for + $votes, 'against': $r.against }) : ({ 'for': $r.for, 'against': $r.against + $votes})
    )
  };
  $results := $reduce($find.hits.hits, $reducer, { 'for': 0, 'against': 0 });

  $doc := $merge([$voteProposal, $results, {'closed': 'yes'}]);
  $deleteDocumentsFromSpace($state.space, 'id', [$voteProposal.id]);
  $addDocumentToSpaceThenCommit($state.space, $doc);

  /* compute new vote token amount and send back */
  $out := $x.output($action.ledger, [],  $form.title, $form.subtitle, '', $action.tags, $doc);
  $x.result($state, [$out])
)
`

export const claimVote =
`
(
  /* find vote proposal */
  $queryText := ['govId', $x.contractKey, 'id', $form.voteProposalId, 'docType', '${DocTypes.VoteProposal}', 'closed', 'yes'];
  $q := $query($queryText, ['id', 'stake', 'orgId', 'proposalId', 'voteStart', 'voteEnd', 'owner']);
  $voteProposal := $searchSpace($state.space, $q);
  $x.assert.isNotOk($voteProposal.error, 'search failed ' & $errorMessage($voteProposal));
  $x.log($voteProposal.hits);

  $x.result($state, [])
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
  {
    type: 'getVoteResult',
    code: getVoteResult,
    language: 'jsonata',
  },
  {
    type: 'listOrgs',
    code: listOrgs,
    language: 'jsonata',
  },
  {
    type: 'listProposals',
    code: listProposals,
    language: 'jsonata',
  },
  {
    type: 'listVoteProposals',
    code: listVoteProposals,
    language: 'jsonata',
  },
  {
    type: 'closeVote',
    code: closeVote,
    language: 'jsonata',
  },
  {
    type: 'claimVote',
    code: claimVote,
    language: 'jsonata',
  },
]
);
