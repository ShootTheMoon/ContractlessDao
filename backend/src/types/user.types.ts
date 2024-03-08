export type VoteTypes = 'YES' | 'NO' | 'ABSTAIN'

export const voteTypes = ['YES', 'NO', 'ABSTAIN'] as const;

type Votes = (typeof voteTypes)[number];

export const isVote = (x: Votes): x is Votes => voteTypes.includes(x);
