'use client'

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-neutral-500">
          {description}
        </p>
      )}
    </div>
  )
}
