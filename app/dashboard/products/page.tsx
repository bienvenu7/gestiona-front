"use client";

import React, { useEffect } from "react";
import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Minus, Search } from "lucide-react";
import { type Product, initialProducts } from "@/lib/mock-data";
import { TablePagination } from "@/components/table-pagination";
import {
  useCreateManyProduct,
  useCreateOneProduct,
  useGetProducts,
} from "@/hooks/useProduct";
import { Auth } from "@/providers/AuthContext";
import { useSocket } from "@/providers/Socket";
import { IProducts, IUploadInterfaceFromFileSokect } from "@/types/socket";

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const { state } = Auth();
  const socket = useSocket();

  const { data, isPending: loading } = useGetProducts(state.user?.company.id);
  const { createProducts, error, isPending } = useCreateManyProduct();
  const { asyncCreateProduct, isPending: isCreating } = useCreateOneProduct();

  const [products, setProducts] = useState<IProducts[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addOpen2, setAddOpen2] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });
  const [socketResponse, setSocketResponse] =
    useState<IUploadInterfaceFromFileSokect>({
      failed: 0,
      percentage: 0,
      processed: 0,
      total: 0,
    });

  const [file, setFile] = useState<File | null>(null);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku!.toLowerCase().includes(q),
      );
    }
    return result;
  }, [products, searchQuery, categoryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const product: IProducts = {
      name: newProduct.name,
      price: Number.parseFloat(newProduct.price),
      stockQuantity: Number.parseInt(newProduct.stock),
      companyId: state.user?.company.id!,
    };

    await asyncCreateProduct(product)
      .then(() => {
        setNewProduct({ name: "", price: "", stock: "", category: "" });
        setAddOpen(false);
        setCurrentPage(1);
      })
      .catch((e) => console.log(e));
  };

  const updateStock = (id: string, delta: number) => {
    // setProducts(
    //   products.map((p) =>
    //     p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
    //   ),
    // );
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setFile(e.target.files[0]);
  };

  const uploadFile = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file!);

    await createProducts({
      entry: formData,
      id: state.user?.company.id!,
    })
      .then((e) => {
        setAddOpen2(false);
        setCurrentPage(1);
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    if (data) setProducts(data.data);
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    socket.on("uploadProgress", (data: IUploadInterfaceFromFileSokect) => {
      setSocketResponse(data);
    });

    socket.on("productsCreated", (data: IProducts[]) => {
      setProducts((prev) => [...data, ...prev]);
    });

    socket.on("newProduct", (data: IProducts) => {
      setProducts((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("uploadProgress");
      socket.off("productsCreated");
      socket.off("newProduct");
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Produits
          </h1>
          <p className="text-sm text-muted-foreground">
            {"G\u00e9rez votre inventaire de produits"}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen2} onOpenChange={setAddOpen2}>
            <DialogTrigger asChild>
              <button className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent cursor-pointer">
                <Upload className="h-4 w-4" />
                Importer Excel
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Ajouter un ban de produits via un ficher excel.
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={uploadFile} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="upload"
                    className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Importer un ficher Excel
                  </label>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    id="upload"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {file?.name}
                  </p>
                </div>
                <button
                  type="submit"
                  className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
                  disabled={isPending}
                >
                  {isPending
                    ? `En cours de telechargement: ${socketResponse.processed} / ${socketResponse.total} | ${socketResponse.percentage}%`
                    : "Ajouter les produits"}
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-lg btn-gradient px-4 text-sm"
              >
                <Plus className="h-4 w-4" />
                Ajouter un produit
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Ajouter un nouveau produit
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nom du produit</Label>
                  <Input
                    id="name"
                    placeholder="ex. Souris sans fil"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="price">{"Prix (\u20ac)"}</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="29,99"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="stock">Stock initial</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="100"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
                >
                  {isCreating ? "Veillez patienter..." : "Ajouter le produit"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher des produits..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={"Cat\u00e9gorie"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Toutes les cat\u00e9gories"}</SelectItem>
            <SelectItem value="Electronics">{"\u00c9lectronique"}</SelectItem>
            <SelectItem value="Accessories">Accessoires</SelectItem>
            <SelectItem value="Furniture">Mobilier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Tous les produits ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="border-b-2 border-border">
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  {/* <TableHead>{"Cat\u00e9gorie"}</TableHead> */}
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Vendus</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {"Veillez patienter..."}
                    </TableCell>
                  </TableRow>
                ) : paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {"Aucun produit trouv\u00e9."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.sku}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.sku}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {product.price.toFixed(2)} Franc CFA
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            product.stockQuantity < 15
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {product.stockQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        0
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateStock(product.sku!, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-card text-foreground hover:bg-accent"
                            aria-label={`Diminuer le stock de ${product.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStock(product.sku!, 10)}
                            className="flex h-7 items-center justify-center rounded-md btn-gradient px-2 text-xs"
                          >
                            +10
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length > 0 && (
            <TablePagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
