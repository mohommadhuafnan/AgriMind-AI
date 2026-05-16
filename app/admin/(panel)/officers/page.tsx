"use client"

import { useEffect, useState } from "react"
import { Loader2, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

interface OfficerRow {
  firebaseUid: string
  displayName: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt?: string
}

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<OfficerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/officers")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setOfficers(json.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Officers & Admins</h1>
        <p className="text-muted-foreground">
          Promote users via <code className="text-xs">scripts/create-admin.ts</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Staff accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.map((o) => (
                  <TableRow key={o.firebaseUid}>
                    <TableCell className="font-medium">{o.displayName}</TableCell>
                    <TableCell>{o.email}</TableCell>
                    <TableCell className="capitalize">{o.role}</TableCell>
                    <TableCell>{o.isActive ? "Active" : "Inactive"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {o.lastLoginAt
                        ? formatDistanceToNow(new Date(o.lastLoginAt), { addSuffix: true })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
