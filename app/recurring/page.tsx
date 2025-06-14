"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { dataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Repeat, Calendar } from "lucide-react"

export default function RecurringPage() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const categories = useMemo(() => {
    return user ? dataStore.getCategories(user.id) : []
  }, [user])

  const recurringTransactions = useMemo(() => {
    return user ? dataStore.getRecurringTransactions(user.id) : []
  }, [user])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const frequency = formData.get("frequency") as "weekly" | "monthly" | "yearly"
    const nextDate = calculateNextDate(new Date(), frequency)

    const recurringData = {
      type: formData.get("type") as "income" | "expense",
      amount: Number.parseFloat(formData.get("amount") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      frequency,
      nextDate: nextDate.toISOString().split("T")[0],
      userId: user!.id,
    }

    dataStore.addRecurringTransaction(recurringData)
    setIsDialogOpen(false)
    window.location.reload()
  }

  const calculateNextDate = (date: Date, frequency: "weekly" | "monthly" | "yearly"): Date => {
    const nextDate = new Date(date)
    switch (frequency) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
    }
    return nextDate
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "bg-blue-100 text-blue-800"
      case "monthly":
        return "bg-green-100 text-green-800"
      case "yearly":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground">Manage your regular income and expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Recurring Transaction</DialogTitle>
              <DialogDescription>Set up a transaction that repeats automatically.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue="expense">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input name="description" placeholder="e.g., Monthly rent, Weekly groceries" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select name="frequency" defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Recurring Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recurring</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Active transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {recurringTransactions
                .filter((t) => t.type === "income" && t.frequency === "monthly")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Recurring income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              $
              {recurringTransactions
                .filter((t) => t.type === "expense" && t.frequency === "monthly")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Recurring expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Transactions</CardTitle>
          <CardDescription>Your scheduled income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recurringTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{transaction.description}</h3>
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>{transaction.type}</Badge>
                    <Badge variant="outline" className={getFrequencyColor(transaction.frequency)}>
                      {transaction.frequency}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • Next: {new Date(transaction.nextDate).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`text-lg font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
            {recurringTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Repeat className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">No recurring transactions</h3>
                <p className="mb-4">
                  Set up recurring transactions for regular income and expenses like salary, rent, or subscriptions.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recurring Transaction
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
