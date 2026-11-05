import { Fragment } from 'react'

type RichTextProps = { text: string }

// Renders the CMS heading markup without ever using innerHTML:
// `*words*` become <em>, and each new line becomes a <br/>.
export function RichText({ text }: RichTextProps) {
  return <>{text.split('\n').map((line, lineIndex) => <Fragment key={lineIndex}>
    {lineIndex > 0 && <br/>}
    {line.split('*').map((part, partIndex) => partIndex % 2 ? <em key={partIndex}>{part}</em> : part)}
  </Fragment>)}</>
}
