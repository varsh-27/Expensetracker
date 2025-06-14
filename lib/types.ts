export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  isRecurring?: boolean
  recurringFrequency?: "weekly" | "monthly" | "yearly"
  userId: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color: string
  userId: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  month: string // YYYY-MM format
  userId: string
}

export interface RecurringTransaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  frequency: "weekly" | "monthly" | "yearly"
  nextDate: string
  userId: string
}
