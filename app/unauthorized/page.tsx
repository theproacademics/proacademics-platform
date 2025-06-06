import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black to-slate-900">
      <div className="max-w-md w-full">
        <Card className="glass-card futuristic-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              This page requires higher privileges or you need to be logged in to access it.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600">Return to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
