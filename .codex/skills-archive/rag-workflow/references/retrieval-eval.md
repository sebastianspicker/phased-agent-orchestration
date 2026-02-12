# Retrieval evaluation worksheet

## Metrics to track (starter)
- Recall@k: did the top-k retrieved chunks include at least one of the expected sources?
- MRR: how early does a relevant chunk appear?
- Groundedness: are citations only drawn from retrieved chunks?
- Coverage: do answers cite *all* critical sources when multiple are required?

## Common failure modes
- Chunking too small (context missing) or too large (irrelevant noise).
- Missing metadata filters (wrong product area / wrong ACL / stale docs).
- Titles/headers not included -> retriever misses the relevant section.
- “Answer-first” prompts that allow the model to improvise.

## Practical evaluation tips
- Prefer evaluating *sources* over exact answer text.
- Keep an explicit log of:
  - query
  - retrieved chunk IDs
  - citations produced
  - judgement (pass/fail + reason)

