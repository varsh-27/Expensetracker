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
import { Progress } from "@/components/ui/progress"
import { Plus, Target, AlertTriangle } from "lucide-react"

export default function BudgetsPage() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const transactions = useMemo(() => {
    return user ? dataStore.getTransactions(user.id) : []
  }, [user])

  const categories = useMemo(() => {
    return user ? dataStore.getCategories(user.id).filter((c) => c.type === "expense") : []
  }, [user])

  const budgets = useMemo(() => {
    return user ? dataStore.getBudgets(user.id) : []
  }, [user])

  const currentMonth = new Date().toISOString().slice(0, 7)

  const budgetData = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === "expense" && t.category === budget.category && t.date.startsWith(budget.month))
        .reduce((sum, t) => sum + t.amount, 0)

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      const remaining = budget.amount - spent

      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        remaining,
        isOverBudget: spent > budget.amount,
      }
    })
  }, [budgets, transactions])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const budgetData = {
      category: formData.get("category") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      month: formData.get("month") as string,
      userId: user!.id,
    }

    dataStore.addBudget(budgetData)
    setIsDialogOpen(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Set and track your spending limits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set a spending limit for a category and month.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="amount">Budget Amount</Label>
                <Input name="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input name="month" type="month" defaultValue={currentMonth} required />
              </div>
              <Button type="submit" className="w-full">
                Create Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">Active budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetData.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{budgetData.filter((b) => b.isOverBudget).length}</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetData.map((budget) => (
          <Card key={budget.id} className={budget.isOverBudget ? "border-red-200" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{budget.category}</span>
                {budget.isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </CardTitle>
              <CardDescription>
                {new Date(budget.month + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span className={budget.isOverBudget ? "text-red-600" : ""}>
                    ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                  </span>
                </div>
                <Progress value={budget.percentage} className={budget.isOverBudget ? "bg-red-100" : ""} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {budget.isOverBudget ? "Over budget by" : "Remaining"}
                </span>
                <span className={`font-medium ${budget.isOverBudget ? "text-red-600" : "text-green-600"}`}>
                  ${Math.abs(budget.remaining).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {budgetData.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending limits.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
