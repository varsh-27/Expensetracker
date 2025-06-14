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
import { Plus, Edit, Trash2 } from "lucide-react"
import type { Transaction } from "@/lib/types"

export default function TransactionsPage() {
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [searchTerm, setSearchTerm] = useState("")

  const transactions = useMemo(() => {
    return user ? dataStore.getTransactions(user.id) : []
  }, [user])

  const categories = useMemo(() => {
    return user ? dataStore.getCategories(user.id) : []
  }, [user])

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => filter === "all" || t.type === filter)
      .filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filter, searchTerm])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const transactionData = {
      type: formData.get("type") as "income" | "expense",
      amount: Number.parseFloat(formData.get("amount") as string),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      userId: user!.id,
    }

    if (editingTransaction) {
      dataStore.updateTransaction(editingTransaction.id, transactionData)
    } else {
      dataStore.addTransaction(transactionData)
    }

    setIsDialogOpen(false)
    setEditingTransaction(null)
    // Force re-render
    window.location.reload()
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      dataStore.deleteTransaction(id)
      window.location.reload()
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTransaction(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Update your transaction details." : "Add a new income or expense transaction."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingTransaction?.type || "expense"}>
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
                  <Input
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingTransaction?.amount || ""}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={editingTransaction?.category || ""}>
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
                <Input name="description" defaultValue={editingTransaction?.description || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  name="date"
                  type="date"
                  defaultValue={editingTransaction?.date || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTransaction ? "Update Transaction" : "Add Transaction"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={(value: "all" | "income" | "expense") => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>{filteredTransactions.length} transaction(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{transaction.description}</h3>
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>{transaction.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`text-lg font-semibold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found. Add your first transaction to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
