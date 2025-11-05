import { getProductById } from "@/app/services/productService";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const productId = parseInt(params.id);

  if (isNaN(productId)) {
    return {
      title: "Produit non trouvé",
    };
  }

  const product = await getProductById(productId);

  if (!product) {
    return {
      title: "Produit non trouvé",
    };
  }

  const price = (product.price / 100).toFixed(2);
  const title = `${product.title} - ${price} € | Big Vape`;
  const description =
    product.description?.substring(0, 160) ||
    `Découvrez ${product.title} dans notre catégorie ${product.category.name}. Prix: ${price} €`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.image ? [product.image] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = parseInt(params.id);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
