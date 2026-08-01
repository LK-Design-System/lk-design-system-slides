import React from 'react';

/**
 * LDS Slides — Korean phrase grouping for claim-scale text.
 *
 * `keep-all` (SlideSurface) stops mid-WORD breaks; this stops mid-PHRASE
 * breaks. At display scale a line holds three to five words, so a dependent
 * noun stranded at a line head — "…개선할 | 수 없다는…" — is a stumble the
 * whole room sees. Dependent nouns (의존명사) lean on the word before them;
 * they must not open a line.
 *
 * CSS has no phrase-aware breaking for Korean and BudouX ships no Korean
 * model (Korean already has spaces, so segmentation libraries stop at the
 * word), so the medium glues phrases itself: a glued group renders as a
 * no-wrap span and the line may only break between groups. The rule set is
 * deliberately small — glue only what grammar forbids splitting, never
 * style preferences — so a group stays two or three words and cannot grow
 * past the measure.
 */

// A dependent noun, optionally carrying its particle/copula tail (수, 것만,
// 것부터, 때는, 만큼은…) and trailing punctuation. Anchored full-token so
// ordinary words that merely start with the same syllable (중요한, 지연에)
// never match.
const PARTICLE_TAIL =
  '(?:[은는이가을를도만의와과로에]|부터|까지|조차|마저|밖에|이며|이자|이기도|처럼|같이|대로)*';
const PUNCT_TAIL = String.raw`[\].,!?…)”’]*`;
const DEPENDENT_TOKEN = new RegExp(
  `^(?:수|것|줄|듯|때|데|바|번|만큼|뿐|채|셈|터|리|쪽|중|즈음|무렵)${PARTICLE_TAIL}${PUNCT_TAIL}$`,
);

// 부정 부사는 뒤에 오는 용언에 기댄다: "안 | 된다"로 갈라지면 부정이 줄 끝에
// 매달린다. 앞말이 아니라 뒷말에 붙는 유일한 규칙.
const GLUE_FORWARD = /^(안|못)$/;

// "…할 수 없다는"의 수는 앞뒤 양쪽에 기댄다: 수가 앞말에 붙었으면 뒤따르는
// 있다/없다 계열까지 한 호흡이다.
const SU_TOKEN = /^수[은는도]?[.,]?$/;
const SU_CONTINUATION = /^(있|없)/;

export function phraseGroups(text) {
  const tokens = text.split(' ').filter(Boolean);
  const groups = [];
  let glueNext = false;
  for (const token of tokens) {
    const current = groups[groups.length - 1];
    const joinsBack =
      current &&
      (glueNext ||
        DEPENDENT_TOKEN.test(token) ||
        (SU_TOKEN.test(current[current.length - 1]) && SU_CONTINUATION.test(token)));
    if (joinsBack) current.push(token);
    else groups.push([token]);
    glueNext = GLUE_FORWARD.test(token);
  }
  return groups;
}

/**
 * Returns the text with grammar-bound phrases wrapped in no-wrap spans.
 * Non-string content and text with nothing to glue pass through untouched,
 * so the DOM only changes where the rule actually fires.
 */
export function phrased(text) {
  if (typeof text !== 'string' || !text.includes(' ')) return text;
  const groups = phraseGroups(text);
  if (groups.every((group) => group.length === 1)) return text;
  return groups.map((group, index) => (
    <React.Fragment key={index}>
      {index > 0 && ' '}
      {group.length > 1 ? (
        <span data-slide-phrase style={{ whiteSpace: 'nowrap' }}>
          {group.join(' ')}
        </span>
      ) : (
        group[0]
      )}
    </React.Fragment>
  ));
}
