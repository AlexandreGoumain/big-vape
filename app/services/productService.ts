import prisma from "@/app/api/prisma/client";

export const getProducts = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
    },
  });
};

export const getProductById = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
  return product;
};

export const createProduct = async (data: {
  title: string;
  description?: string;
  price: number;
  image?: string;
  category_id: number;
  status?: string;
  stock?: number;
}) => {
  return await prisma.product.create({
    data,
  });
};

export const updateProduct = async (
  id: number,
  data: {
    title?: string;
    description?: string;
    price?: number;
    image?: string;
    category_id?: number;
    status?: string;
    stock?: number;
  }
) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteProduct = async (id: number) => {
  return await prisma.product.delete({
    where: { id },
  });
};
