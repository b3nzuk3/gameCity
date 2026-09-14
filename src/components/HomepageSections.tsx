import HomepageProductSection from './HomepageProductSection'
import type { HomepageSection } from '@/services/backendService'

export default function HomepageSections({ sections }: { sections: HomepageSection[] }) {
  return <div data-home-merchandising-sections>{sections.slice().sort((left, right) => left.sortOrder - right.sortOrder).map((section) => <HomepageProductSection key={section.id} section={section} />)}</div>
}
