import React from 'react';

/**
 * LDS Editorial — TopicList
 * The two-level list of a reading page (READING_DECK_PROPOSAL 변경 2-1):
 * topics at note rank / semibold / strong, details one rank down at
 * note-body / regular / neutral, indented by the table's own inline pad so
 * lists and tables share a left rhythm. Two levels is the contract, not a
 * default — the pilot's source material carried three indent levels and the
 * third bought nothing a governing or a page split didn't do better. A
 * deeper hierarchy is a structure, and structures go to a table or another
 * page, not to indentation.
 *
 * The medium owns the density: everything here reads the --editorial-* seam,
 * so the same list tightens on a document and opens up on a slide surface.
 */
export function TopicList({ items = [], style, ...rest }) {
  return (
    <ul
      data-lds-topic-list
      style={{
        margin: 0,
        paddingLeft: '1.2em',
        display: 'grid',
        gap: 'var(--space-5)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--editorial-note-size)',
        lineHeight: 'var(--editorial-note-line)',
        letterSpacing: 'var(--editorial-note-spacing)',
        ...style,
      }}
      {...rest}
    >
      {items.map(({ topic, details = [] }) => (
        <li
          key={topic}
          data-topic
          style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--color-semantic-label-strong)' }}
        >
          {topic}
          {details.length > 0 && (
            <ul
              data-topic-details
              style={{
                margin: 'var(--space-2) 0 0',
                paddingLeft: 'var(--editorial-cell-pad-inline)',
                listStyle: 'disc',
                display: 'grid',
                gap: 'var(--space-2)',
                fontSize: 'var(--editorial-note-body-size)',
                lineHeight: 'var(--editorial-note-body-line)',
                letterSpacing: 'var(--editorial-note-body-spacing)',
                fontWeight: 'var(--fw-regular)',
                color: 'var(--color-semantic-label-neutral)',
              }}
            >
              {details.map((detail) => <li key={detail}>{detail}</li>)}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
