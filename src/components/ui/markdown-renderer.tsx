import { useMemo, type ReactNode } from 'react'

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

function sanitizeLinkUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    return SAFE_LINK_PROTOCOLS.has(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      nodes.push(<strong key={key++} className="font-semibold text-slate-900 dark:text-white">{parseInline(boldMatch[1])}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/)
    if (italicMatch) {
      nodes.push(<em key={key++} className="italic text-slate-700 dark:text-slate-300">{parseInline(italicMatch[1])}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+?)`/)
    if (codeMatch) {
      nodes.push(
        <code key={key++} className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-sm text-pink-600 dark:bg-slate-700 dark:text-pink-400">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+?)\]\(([^)]+?)\)/)
    if (linkMatch) {
      const safeHref = sanitizeLinkUrl(linkMatch[2])
      if (safeHref) {
        nodes.push(
          <a key={key++} href={safeHref} target="_blank" rel="noopener noreferrer"
            className="text-cyan-600 underline decoration-cyan-600/30 hover:decoration-cyan-600 dark:text-cyan-400 dark:decoration-cyan-400/30 dark:hover:decoration-cyan-400">
            {parseInline(linkMatch[1])}
          </a>
        )
      } else {
        nodes.push(<span key={key++}>{parseInline(linkMatch[1])}</span>)
      }
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Plain text up to next special character
    const nextSpecial = remaining.slice(1).search(/[*`\[]/)
    if (nextSpecial === -1) {
      nodes.push(remaining)
      break
    }
    nodes.push(remaining.slice(0, nextSpecial + 1))
    remaining = remaining.slice(nextSpecial + 1)
  }

  return nodes
}

interface Block {
  type: 'code' | 'heading' | 'ul' | 'ol' | 'paragraph'
  content: string
  lang?: string
  level?: number
  items?: string[]
}

function parseBlocks(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Blank line — skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Fenced code block
    const codeStart = line.match(/^```(\w*)/)
    if (codeStart) {
      const lang = codeStart[1] || undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({ type: 'code', content: codeLines.join('\n'), lang })
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/)
    if (headingMatch) {
      blocks.push({ type: 'heading', content: headingMatch[2], level: headingMatch[1].length })
      i++
      continue
    }

    // Unordered list
    if (/^[\-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[\-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\-*]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', content: '', items })
      continue
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', content: '', items })
      continue
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('```') &&
      !/^#{2,3}\s+/.test(lines[i]) &&
      !/^[\-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paraLines.join(' ') })
    }
  }

  return blocks
}

function renderBlock(block: Block, index: number): ReactNode {
  switch (block.type) {
    case 'code':
      return (
        <pre key={index} className="overflow-x-auto rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
          <code className="font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300">
            {block.content}
          </code>
        </pre>
      )

    case 'heading':
      if (block.level === 2) {
        return <h2 key={index} className="text-lg font-bold text-slate-900 dark:text-white">{parseInline(block.content)}</h2>
      }
      return <h3 key={index} className="text-base font-bold text-slate-900 dark:text-white">{parseInline(block.content)}</h3>

    case 'ul':
      return (
        <ul key={index} className="list-disc space-y-1 pl-6 text-slate-700 dark:text-slate-300">
          {(block.items ?? []).map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ul>
      )

    case 'ol':
      return (
        <ol key={index} className="list-decimal space-y-1 pl-6 text-slate-700 dark:text-slate-300">
          {(block.items ?? []).map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ol>
      )

    case 'paragraph':
      return <p key={index} className="text-slate-700 dark:text-slate-300">{parseInline(block.content)}</p>
  }
}

export function MarkdownRenderer({ content }: { content: string }) {
  const rendered = useMemo(() => {
    const blocks = parseBlocks(content)
    return blocks.map(renderBlock)
  }, [content])

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {rendered}
    </div>
  )
}
