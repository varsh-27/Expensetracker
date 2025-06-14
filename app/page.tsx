"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, PieChart, Target, Repeat } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Take Control of Your
            <span className="text-blue-600"> Finances</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track your income and expenses, set budgets, and achieve your financial goals with our comprehensive expense
            tracker.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Track Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Log your income and expenses with detailed categorization and descriptions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <PieChart className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Visual Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View your spending patterns with interactive charts and graphs.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Budget Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Set monthly budgets for different categories and track your progress.</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Repeat className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Recurring Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Automate tracking of regular income and expenses like salary and bills.</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start your financial journey?</h2>
          <p className="text-gray-600 mb-8">Join thousands of users who have taken control of their finances.</p>
          <Link href="/register">
            <Button size="lg" className="px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
