import Link from 'next/link'

export type SelectedWorkEntry = {
  caption: string
  description: string
  id: number
  slug: string
  title: string
}

export function SelectedWorkList(props: { items: SelectedWorkEntry[] }) {
  const { items } = props

  return (
    <div className="rows">
      {items.map((item) => (
        <Link className="row row-link" href={`/posts/${item.slug}`} key={item.id}>
          <span>
            <span className="row-title">{item.title}</span>
            <span className="row-desc">{item.description}</span>
          </span>
          <span className="row-meta">{item.caption}</span>
        </Link>
      ))}
    </div>
  )
}
