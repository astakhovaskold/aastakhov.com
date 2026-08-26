import Image from 'next/image'
import Link from 'next/link'

type ProjectImage = {
  alt?: null | string
  height?: null | number
  url?: null | string
  width?: null | number
}

type ReadyProjectImage = {
  alt?: null | string
  height?: null | number
  url: string
  width?: null | number
}

export type ProjectListEntry = {
  description?: null | string
  id: number
  previewImage?: null | number | ProjectImage
  role?: null | string
  slug: string
  status?: null | string
  title: string
  type?: null | string
  year?: null | number
}

function getProjectImage(image: ProjectListEntry['previewImage']): null | ReadyProjectImage {
  if (typeof image === 'object' && image !== null && typeof image.url === 'string' && image.url) {
    return {
      alt: image.alt,
      height: image.height,
      url: image.url,
      width: image.width,
    }
  }

  return null
}

export function ProjectListItem<T extends ProjectListEntry>(props: {
  item: T
  meta?: null | string
  showImage?: boolean
  title?: string
}) {
  const { item, meta, showImage = true, title } = props
  const image = showImage ? getProjectImage(item.previewImage) : null

  return (
    <Link className="row row-link" href={`/projects/${item.slug}`}>
      <span className="project-row-main">
        {image ? (
          <Image
            alt={image.alt || title || item.title}
            className="project-row-image"
            height={image.height || 720}
            src={image.url}
            width={image.width || 1280}
          />
        ) : null}

        <span>
          <span className="row-title">{title || item.title}</span>
          {item.description ? <span className="row-desc">{item.description}</span> : null}
        </span>
      </span>

      {meta ? <span className="row-meta">{meta}</span> : null}
    </Link>
  )
}

export function ProjectList<T extends ProjectListEntry>(props: {
  getMeta?: (item: T) => null | string
  getTitle?: (item: T) => string
  items: T[]
  showImages?: boolean
}) {
  const { getMeta, getTitle, items, showImages = true } = props

  return (
    <div className="rows">
      {items.map((item) => (
        <ProjectListItem
          item={item}
          key={item.id}
          meta={getMeta?.(item) || null}
          showImage={showImages}
          title={getTitle?.(item)}
        />
      ))}
    </div>
  )
}
