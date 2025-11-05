"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Edit,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import Link from "next/link";

interface UserAddress {
  id: number;
  label: string | null;
  isDefault: boolean;
  address: {
    id: number;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function AddressesPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "France",
    label: "",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress.id}`
        : "/api/user/addresses";
      const method = editingAddress ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchAddresses();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la sauvegarde de l'adresse");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Erreur lors de la sauvegarde de l'adresse");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAddresses();
      } else {
        alert("Erreur lors de la suppression de l'adresse");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Erreur lors de la suppression de l'adresse");
    }
  };

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      street: address.address.street,
      city: address.address.city,
      state: address.address.state,
      zipCode: address.address.zipCode,
      country: address.address.country,
      label: address.label || "",
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAddress(null);
    setFormData({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "France",
      label: "",
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au compte
          </Link>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une adresse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingAddress
                      ? "Modifier l'adresse"
                      : "Nouvelle adresse"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAddress
                      ? "Modifiez les informations de votre adresse"
                      : "Ajoutez une nouvelle adresse à votre carnet"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">
                      Label <span className="text-muted-foreground">(optionnel)</span>
                    </Label>
                    <Select
                      value={formData.label}
                      onValueChange={(value) =>
                        setFormData({ ...formData, label: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun</SelectItem>
                        <SelectItem value="Domicile">Domicile</SelectItem>
                        <SelectItem value="Travail">Travail</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">
                      Rue <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="street"
                      required
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder="123 Rue de la Paix"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">
                        Code postal <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        placeholder="75001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">
                        Ville <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Paris"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Pays <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isDefault">Adresse par défaut</Label>
                    <Switch
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isDefault: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingAddress ? "Modifier" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <h1 className="text-3xl font-bold mb-8">Mes adresses</h1>

        {addresses.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">
                Aucune adresse enregistrée
              </p>
              <p className="text-sm text-muted-foreground">
                Ajoutez une adresse pour faciliter vos commandes
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((userAddress) => (
              <Card
                key={userAddress.id}
                className={
                  userAddress.isDefault ? "border-primary border-2" : ""
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {userAddress.label || "Adresse"}
                        {userAddress.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            <Check className="w-3 h-3" />
                            Par défaut
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(userAddress)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(userAddress.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{userAddress.address.street}</p>
                    <p>
                      {userAddress.address.zipCode} {userAddress.address.city}
                    </p>
                    <p>{userAddress.address.country}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
