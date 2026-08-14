const processSteps = [
  ['01', 'Listen & explore', 'Start with the people, the problem and the possibilities.'],
  ['02', 'Make it clear', 'Build a useful, accessible foundation before adding the flourish.'],
  ['03', 'Refine with care', 'Test the details, then keep making the experience feel better.'],
]

export function Process() {
  return <section className="process section">
    <div className="container"><div className="process__inner">
      <div><div className="section-label">04 / My approach</div><h2>Curious by default.<br/><em>Intentional by design.</em></h2></div>
      <ol>{processSteps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
    </div></div>
  </section>
}
