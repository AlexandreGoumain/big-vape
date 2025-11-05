# 🔧 Guide d'intégration du VariantManager dans l'admin

## Pour intégrer le gestionnaire de variantes dans les formulaires admin

### 1. Dans la page de création de produit

**Fichier** : `app/(dashboard)/dashboard/products/create/page.tsx`

```tsx
import VariantManager, { Variant } from "@/app/components/admin/VariantManager";

export default function CreateProductPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [basePrice, setBasePrice] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Créer d'abord le produit
    const productResponse = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        price: basePrice,
        // ... autres champs
      })
    });

    const product = await productResponse.json();

    // 2. Créer les variantes si présentes
    if (variants.length > 0) {
      await fetch(`/api/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variants)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs classiques du produit */}
      <Input
        label="Prix de base (en centimes)"
        value={basePrice}
        onChange={(e) => setBasePrice(parseInt(e.target.value))}
      />

      {/* Gestionnaire de variantes */}
      <VariantManager
        basePrice={basePrice}
        onVariantsChange={setVariants}
      />

      <Button type="submit">Créer le produit</Button>
    </form>
  );
}
```

### 2. Dans la page d'édition de produit

**Fichier** : `app/(dashboard)/dashboard/products/[id]/edit/page.tsx`

```tsx
import VariantManager, { Variant } from "@/app/components/admin/VariantManager";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState<Variant[]>([]);

  useEffect(() => {
    // Charger le produit et ses variantes
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setVariants(data.variants || []);
      });
  }, [params.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Mettre à jour le produit
    await fetch(`/api/products/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        // ... champs du produit
      })
    });

    // 2. Supprimer les anciennes variantes
    await fetch(`/api/products/${params.id}/variants`, {
      method: "DELETE"
    });

    // 3. Créer les nouvelles variantes
    if (variants.length > 0) {
      await fetch(`/api/products/${params.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variants)
      });
    }
  };

  if (!product) return <div>Chargement...</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs classiques du produit */}

      {/* Gestionnaire de variantes */}
      <VariantManager
        productId={product.id}
        basePrice={product.price}
        initialVariants={variants}
        onVariantsChange={setVariants}
      />

      <Button type="submit">Mettre à jour</Button>
    </form>
  );
}
```

## Alternative : Endpoint DELETE pour supprimer toutes les variantes

Si vous préférez, créez un endpoint pour supprimer toutes les variantes d'un produit :

**Fichier** : `app/api/products/[id]/variants/route.ts`

```tsx
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    await deleteVariantsByProductId(productId);
    return NextResponse.json({ message: "Variantes supprimées" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
```

## Simplification avec un seul endpoint

Vous pouvez aussi créer un endpoint qui gère la création/mise à jour complète :

```tsx
// PUT /api/products/:id/variants
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id);
  const variants = await request.json();

  // 1. Supprimer les anciennes variantes
  await deleteVariantsByProductId(productId);

  // 2. Créer les nouvelles
  if (variants.length > 0) {
    await createVariants(productId, variants);
  }

  return NextResponse.json({ message: "Variantes mises à jour" });
}
```

Puis dans votre formulaire :

```tsx
await fetch(`/api/products/${productId}/variants`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(variants)
});
```

---

**Note** : Le VariantManager est un composant client (`"use client"`) qui peut être utilisé dans des Server Components sans problème.
