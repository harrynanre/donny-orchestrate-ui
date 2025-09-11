"use client"

import { Crown, CreditCard, Download, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function Billing() {
  const currentPlan = {
    name: "Professional",
    price: 49,
    period: "month",
    features: [
      "Up to 25 active agents",
      "10,000 tasks per month",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
  }

  const usage = {
    agents: { current: 12, limit: 25 },
    tasks: { current: 3247, limit: 10000 },
    storage: { current: 2.1, limit: 10 }, // GB
  }

  const plans = [
    {
      name: "Starter",
      price: 0,
      period: "month",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 3 active agents",
        "1,000 tasks per month",
        "Basic analytics",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: 49,
      period: "month", 
      description: "Ideal for growing teams and businesses",
      features: [
        "Up to 25 active agents",
        "10,000 tasks per month",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: 199,
      period: "month",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited agents",
        "Unlimited tasks",
        "Advanced security",
        "Dedicated support",
        "Custom deployment",
        "SLA guarantee",
      ],
      popular: false,
    },
  ]

  const billingHistory = [
    {
      id: "1",
      date: "2024-03-01",
      amount: 49,
      status: "paid",
      description: "Professional Plan - March 2024",
    },
    {
      id: "2",
      date: "2024-02-01", 
      amount: 49,
      status: "paid",
      description: "Professional Plan - February 2024",
    },
    {
      id: "3",
      date: "2024-01-01",
      amount: 49,
      status: "paid",
      description: "Professional Plan - January 2024",
    },
  ]

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive"
    if (percentage >= 75) return "text-warning"
    return "text-success"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and monitor usage
        </p>
      </div>

      {/* Current Plan */}
      <Card className="card-enterprise">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Current Plan: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                ${currentPlan.price}/{currentPlan.period} • Next billing: April 1, 2024
              </CardDescription>
            </div>
            <Button className="button-primary">
              Upgrade Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Agents Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Agents</span>
                <span className={getUsageColor(getUsagePercentage(usage.agents.current, usage.agents.limit))}>
                  {usage.agents.current} / {usage.agents.limit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.agents.current, usage.agents.limit)} 
                className="h-2"
              />
            </div>

            {/* Tasks Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Tasks</span>
                <span className={getUsageColor(getUsagePercentage(usage.tasks.current, usage.tasks.limit))}>
                  {usage.tasks.current.toLocaleString()} / {usage.tasks.limit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.tasks.current, usage.tasks.limit)} 
                className="h-2"
              />
            </div>

            {/* Storage Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span className={getUsageColor(getUsagePercentage(usage.storage.current, usage.storage.limit))}>
                  {usage.storage.current}GB / {usage.storage.limit}GB
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(usage.storage.current, usage.storage.limit)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`card-enterprise relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="gradient-primary text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.name === currentPlan.name ? "w-full" : "button-primary w-full"}
                  variant={plan.name === currentPlan.name ? "outline" : "default"}
                  disabled={plan.name === currentPlan.name}
                >
                  {plan.name === currentPlan.name ? "Current Plan" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Your default payment method for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-muted">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">•••• •••• •••• 4242</div>
                <div className="text-sm text-muted-foreground">Expires 12/26</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="card-enterprise">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Billing History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
          <CardDescription>
            Your recent billing statements and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingHistory.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.description}</div>
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="status-pill status-success">
                      {item.status}
                    </Badge>
                    <div className="font-medium">${item.amount}</div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {index < billingHistory.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}