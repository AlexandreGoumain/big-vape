import CardCategory from "@/app/components/storeFront/CardCategory";
import {
  getCategories,
  getCategoryNameByProductCategoryId,
} from "@/app/services/categoryService"; // Import the function

// MAPPING SUR TOUS LES PRODUITS
const categoryClient = async () => {
  const categories = await getCategories();

  // Fetch category names for each product
  const productsWithCategoryNames = await Promise.all(
    categories.map(async (category) => {
      const categoryName = await getCategoryNameByProductCategoryId(
        category.id
      );
      return { ...category, categoryName };
    })
  );

  return (
    <>
      {productsWithCategoryNames.map((category) => (
        <CardCategory id={category.id} key={category.id} name={category.name} />
      ))}
    </>
  );
};

export default categoryClient;
