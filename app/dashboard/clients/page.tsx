"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Minus, Search, Trash2 } from "lucide-react";
import { TablePagination } from "@/components/table-pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IClient, ICreateClient } from "@/types/company";
import { formattedDate } from "@/lib/helper";
import { useCreateClient, useGetClients } from "@/hooks/useClient";
import { Auth } from "@/providers/AuthContext";

const ClientPage = () => {
  const { state } = Auth();

  const { data, isPending } = useGetClients(state.user?.company.id);
  const { asyncCreateClient, isPending: isCreating } = useCreateClient(
    state.user?.company.id,
  );

  const [addOpen, setAddOpen] = useState(false);
  const [users, setUsers] = useState<IClient[]>([]);
  const [newUser, setNewUser] = useState<ICreateClient>({
    name: "",
    number: "",
  });

  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await asyncCreateClient(newUser).then((e) => {
      setUsers((prev) => [e, ...prev]);
      setAddOpen(false);
      setNewUser({
        name: "",
        number: "",
      });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            {"G\u00e9rez les clients de votre entreprise."}
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg btn-gradient px-4 text-sm"
            >
              <Plus className="h-4 w-4" />
              Ajouter un client
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Ajouter un nouveau client
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  placeholder="Jean Dupont"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="number">Numéro de téléphone</Label>
                <Input
                  id="number"
                  type="text"
                  placeholder="456647557"
                  value={newUser.number}
                  onChange={(e) =>
                    setNewUser({ ...newUser, number: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {isCreating ? "Veillez patienter..." : "Ajouter l'utilisateur"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            {"Clients de l'entreprise"} ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Numero de téléphone</TableHead>
                  <TableHead>Commenades totale</TableHead>
                  <TableHead>{"Date d'ajout"}</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {"Veillez patienter..."}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {
                        "Vous n'avez pas de clients enregistrer dans votre boites!"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.number}>
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
                          <span className="font-medium text-foreground">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.number}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium `}
                        >
                          {0}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formattedDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          type="button"
                          // onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          aria-label={`Supprimer ${user.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPage;
