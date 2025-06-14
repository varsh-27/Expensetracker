import type { Transaction, Category, Budget, RecurringTransaction } from "./types"

// Simple in-memory storage for demo - in production, this would be a database
class DataStore {
  private transactions: Transaction[] = []
  private categories: Category[] = [
    { id: "1", name: "Food & Dining", type: "expense", color: "#ef4444", userId: "1" },
    { id: "2", name: "Transportation", type: "expense", color: "#f97316", userId: "1" },
    { id: "3", name: "Shopping", type: "expense", color: "#eab308", userId: "1" },
    { id: "4", name: "Entertainment", type: "expense", color: "#22c55e", userId: "1" },
    { id: "5", name: "Bills & Utilities", type: "expense", color: "#3b82f6", userId: "1" },
    { id: "6", name: "Healthcare", type: "expense", color: "#8b5cf6", userId: "1" },
    { id: "7", name: "Salary", type: "income", color: "#10b981", userId: "1" },
    { id: "8", name: "Freelance", type: "income", color: "#06b6d4", userId: "1" },
    { id: "9", name: "Investments", type: "income", color: "#8b5cf6", userId: "1" },
  ]
  private budgets: Budget[] = []
  private recurringTransactions: RecurringTransaction[] = []

  constructor() {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("expense-tracker-data")
      if (stored) {
        const data = JSON.parse(stored)
        this.transactions = data.transactions || []
        this.categories = data.categories || this.categories
        this.budgets = data.budgets || []
        this.recurringTransactions = data.recurringTransactions || []
      }
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "expense-tracker-data",
        JSON.stringify({
          transactions: this.transactions,
          categories: this.categories,
          budgets: this.budgets,
          recurringTransactions: this.recurringTransactions,
        }),
      )
    }
  }

  // Transactions
  getTransactions(userId: string): Transaction[] {
    return this.transactions.filter((t) => t.userId === userId)
  }

  addTransaction(transaction: Omit<Transaction, "id">): Transaction {
    const newTransaction = { ...transaction, id: Date.now().toString() }
    this.transactions.push(newTransaction)
    this.save()
    return newTransaction
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const index = this.transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates }
      this.save()
      return this.transactions[index]
    }
    return null
  }

  deleteTransaction(id: string): boolean {
    const index = this.transactions.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.transactions.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  // Categories
  getCategories(userId: string): Category[] {
    return this.categories.filter((c) => c.userId === userId)
  }

  addCategory(category: Omit<Category, "id">): Category {
    const newCategory = { ...category, id: Date.now().toString() }
    this.categories.push(newCategory)
    this.save()
    return newCategory
  }

  // Budgets
  getBudgets(userId: string): Budget[] {
    return this.budgets.filter((b) => b.userId === userId)
  }

  addBudget(budget: Omit<Budget, "id">): Budget {
    const newBudget = { ...budget, id: Date.now().toString() }
    this.budgets.push(newBudget)
    this.save()
    return newBudget
  }

  updateBudget(id: string, updates: Partial<Budget>): Budget | null {
    const index = this.budgets.findIndex((b) => b.id === id)
    if (index !== -1) {
      this.budgets[index] = { ...this.budgets[index], ...updates }
      this.save()
      return this.budgets[index]
    }
    return null
  }

  // Recurring Transactions
  getRecurringTransactions(userId: string): RecurringTransaction[] {
    return this.recurringTransactions.filter((rt) => rt.userId === userId)
  }

  addRecurringTransaction(transaction: Omit<RecurringTransaction, "id">): RecurringTransaction {
    const newTransaction = { ...transaction, id: Date.now().toString() }
    this.recurringTransactions.push(newTransaction)
    this.save()
    return newTransaction
  }
}

export const dataStore = new DataStore()
