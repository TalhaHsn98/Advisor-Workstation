export type Holding = {
  id: string
  ticker: string
  name: string
  quantity: number
  avgCost?: number
  marketValue?: number
  allocationPercent?: number
  sector?: string
}

export type Account = {
  accountId: string
  accountType: string
  balance: number
  currency: string
  holdings?: Holding[]
}

export type Portfolio = {
  clientId: string
  accounts: Account[]
}
