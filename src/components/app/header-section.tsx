'use client'

import type React from 'react'

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  actionButton?: {
    label: string
    onClick?: () => void
    href?: string
    icon?: React.ReactNode
    hidden?: boolean
  }
  backButton?: {
    href: string
    hidden?: boolean
  }
}

export const PageHeader = ({
  title,
  description,
  actionButton,
  backButton
}: PageHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        {/* Botón de volver atrás */}
        {backButton && !backButton.hidden && (
          <div className="mt-2">
            <Button
              variant="outline"
              className="rounded-full"
              size="icon"
              asChild
            >
              <Link href={backButton.href}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Cabecera principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </div>
      {/* Botón de acción */}
      {actionButton && !actionButton.hidden && (
        <>
          {actionButton.href ? (
            <Button asChild>
              <Link href={actionButton.href}>
                {actionButton.icon || <Plus className="h-4 w-4 mr-2" />}
                {actionButton.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={actionButton.onClick}>
              {actionButton.icon || <Plus className="h-4 w-4 mr-2" />}
              {actionButton.label}
            </Button>
          )}
        </>
      )}
    </div>
  )
}
