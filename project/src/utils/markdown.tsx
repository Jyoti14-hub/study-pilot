import React from 'react';

/**
 * A lightweight markdown-to-JSX renderer.
 * Supports: headings (#, ##, ###), bold (**), inline code (`),
 * ordered lists (1. ), unordered lists (- ), paragraphs, line breaks.
 * Not a full markdown parser — just enough for chat responses.
 */
export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ol' | 'ul' | null = null;
  let key = 0;

  function flushList() {
    if (listItems.length === 0 || !listType) return;
    const items = listItems.map((item, i) => (
      <li key={i}>{renderInline(item)}</li>
    ));
    if (listType === 'ol') {
      elements.push(<ol key={key++}>{items}</ol>);
    } else {
      elements.push(<ul key={key++}>{items}</ul>);
    }
    listItems = [];
    listType = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList();
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.*)/);
    const ulMatch = trimmed.match(/^[-\*]\s+(.*)/);

    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(olMatch[1]);
      continue;
    }

    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(ulMatch[1]);
      continue;
    }

    flushList();

    const h3 = trimmed.match(/^###\s+(.*)/);
    const h2 = trimmed.match(/^##\s+(.*)/);
    const h1 = trimmed.match(/^#\s+(.*)/);

    if (h1) {
      elements.push(<h1 key={key++}>{renderInline(h1[1])}</h1>);
    } else if (h2) {
      elements.push(<h2 key={key++}>{renderInline(h2[1])}</h2>);
    } else if (h3) {
      elements.push(<h3 key={key++}>{renderInline(h3[1])}</h3>);
    } else {
      elements.push(<p key={key++}>{renderInline(trimmed)}</p>);
    }
  }

  flushList();

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Handle bold, inline code, and italic
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    const matches = [
      boldMatch && { type: 'bold' as const, start: boldMatch.index!, length: boldMatch[0].length, content: boldMatch[1] },
      codeMatch && { type: 'code' as const, start: codeMatch.index!, length: codeMatch[0].length, content: codeMatch[1] },
      italicMatch && { type: 'italic' as const, start: italicMatch.index!, length: italicMatch[0].length, content: italicMatch[1] },
    ].filter(Boolean) as { type: 'bold' | 'code' | 'italic'; start: number; length: number; content: string }[];

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    matches.sort((a, b) => a.start - b.start);
    const first = matches[0];

    if (first.start > 0) {
      parts.push(remaining.slice(0, first.start));
    }

    if (first.type === 'bold') {
      parts.push(<strong key={key++}>{first.content}</strong>);
    } else if (first.type === 'code') {
      parts.push(<code key={key++}>{first.content}</code>);
    } else if (first.type === 'italic') {
      parts.push(<em key={key++}>{first.content}</em>);
    }

    remaining = remaining.slice(first.start + first.length);
  }

  return <>{parts}</>;
}
