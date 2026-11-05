import siteContent from './content/site.json'
import { Site } from './Site'
import type { SiteContent } from './types/content'

function App() {
  return <Site content={siteContent as SiteContent}/>
}

export default App
