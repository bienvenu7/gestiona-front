"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Trash2 } from "lucide-react"
import { type User, initialUsers } from "@/lib/mock-data"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [addOpen, setAddOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
  })

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    const user: User = {
      id: `U${String(users.length + 1).padStart(3, "0")}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as User["role"],
      joinedDate: new Date().toISOString().split("T")[0],
    }
    setUsers([user, ...users])
    setNewUser({ name: "", email: "", role: "" })
    setAddOpen(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const roleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case "manager":
        return "bg-cyan-100 text-cyan-700 border-cyan-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur"
      case "manager":
        return "Responsable"
      case "staff":
        return "Personnel"
      default:
        return role
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">{"G\u00e9rez les membres de l'\u00e9quipe et les acc\u00e8s"}</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg btn-gradient px-4 text-sm"
            >
              <Plus className="h-4 w-4" />
              Ajouter un utilisateur
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Ajouter un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@gestiona.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">{"R\u00f4le"}</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"S\u00e9lectionner un r\u00f4le"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Responsable</SelectItem>
                    <SelectItem value="staff">Personnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {"Ajouter l'utilisateur"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            {"Membres de l'\u00e9quipe"} ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>{"R\u00f4le"}</TableHead>
                  <TableHead>{"Date d'ajout"}</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="btn-gradient text-xs text-white">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${roleColor(user.role)}`}>
                        {roleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.joinedDate}</TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        aria-label={`Supprimer ${user.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
