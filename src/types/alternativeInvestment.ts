export interface AttachmentItem {
  id: string
  name: string
  uploadedAt: string
  custodian?: string
  dataUrl?: string
}

export interface AlternativeInvestment {
  id: string
  name: string
  custodian?: string
  commitment?: number
  distributions?: number
  lastValuation?: number
  lastUpdated?: string
  notes?: string
  attachments?: AttachmentItem[]
}
