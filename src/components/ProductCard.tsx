
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/types";

interface ProductProps {
  product: Product;
}

const ProductCard = ({ product }: ProductProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };
  
  const getCategoryUrl = (category: string | undefined) => {
    if (!category) return 'components';
    
    if (category.includes('-')) return category.toLowerCase();
    
    return category.toLowerCase().replace(/\s+/g, '-');
  };
  
  return (
    <Card className="bg-forest-800 border-forest-700 overflow-hidden hover:border-emerald-600/50 transition-colors group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-emerald-400">${product.price.toFixed(2)}</span>
          <div className="flex items-center">
            <Star size={14} className="fill-yellow-500 text-yellow-500" />
            <span className="text-sm ml-1">{product.rating || 0}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Link to={`/category/${getCategoryUrl(product.category)}?product=${product.id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-forest-700 text-muted-foreground hover:text-foreground"
          >
            Details
          </Button>
        </Link>
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={14} className="mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
