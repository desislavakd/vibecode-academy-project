'use client'

import { useParams } from 'next/navigation'
import ToolForm from '@/components/ToolForm'

export default function EditToolPage() {
  const { id } = useParams<{ id: string }>()
  return <ToolForm mode="edit" toolId={Number(id)} />
}
