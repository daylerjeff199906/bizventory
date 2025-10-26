'use client'

import type { ReactNode } from 'react'
import { ArrowUpRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import Image from 'next/image'

export interface EmptyStateProps {
  /** Icono a mostrar en la parte superior */
  icon?: ReactNode
  urlImage?: string
  /** Título principal del estado vacío */
  title: string
  /** Descripción del estado vacío */
  description: string
  /** Array de botones principales */
  actions?: Array<{
    label: string
    onClick?: () => void
    variant?:
      | 'default'
      | 'outline'
      | 'ghost'
      | 'secondary'
      | 'destructive'
      | 'link'
    href?: string
  }>
  /** Link adicional en la parte inferior */
  helpLink?: {
    label: string
    href: string
  }
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  helpLink,
  urlImage
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia variant="default">{icon}</EmptyMedia>}
        {urlImage && (
          <EmptyMedia>
            <Image
              src={urlImage || '/svg/search-businesses.svg'}
              width={150}
              height={150}
              alt="Empty State Image"
              className="mx-auto"
            />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {actions && actions.length > 0 && (
        <EmptyContent>
          <div className="flex gap-2 flex-wrap justify-center">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href}>{action.label}</a>
                ) : (
                  action.label
                )}
              </Button>
            ))}
          </div>
        </EmptyContent>
      )}
      {helpLink && (
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href={helpLink.href}>
            {helpLink.label} <ArrowUpRightIcon className="ml-1" />
          </a>
        </Button>
      )}
    </Empty>
  )
}
