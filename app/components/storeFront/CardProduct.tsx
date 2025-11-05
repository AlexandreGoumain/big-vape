"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import WishlistButton from "@/app/components/product/WishlistButton";

interface CardProductProps {
  id: number;
  title: string;
  category: string;
  price: number;
  image: string;
}

export default function CardProduct({
  id,
  title,
  category,
  price,
  image,
}: CardProductProps) {
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addItem({
      productId: id,
      title,
      price,
      image,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="flex justify-center">
      <Card className="max-w-80">
        <CardHeader>
          <div className="relative">
            <Image src={image} alt={title} width={200} height={200} />
            <div className="absolute top-2 right-2">
              <WishlistButton productId={id} />
            </div>
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <Badge>{category}</Badge>
          </CardDescription>
          <br />
          <CardDescription>{(price / 100).toFixed(2)} €</CardDescription>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/products/${id}`}>Aperçu</Link>
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className="flex-1"
          >
            {addedToCart ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Ajouté
              </>
            ) : (
              <>
                <ShoppingCart className="mr-1 h-4 w-4" />
                Panier
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
