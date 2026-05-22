export type Client = {
  id: string
  name: string
  dob?: string
  email?: string
  phone?: string
  householdId?: string
  primaryAdvisorId?: string
  riskProfile?: string
  kycStatus?: { status: string; lastUpdated?: string }
  onboardingStatus?: string
}
