
import React from "react";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  rating: number;
  category: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { name, image, price, rating, category } = product;

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    });
  };

  return (
    <div className="group relative bg-forest-800 rounded-xl overflow-hidden hover-scale transition-all duration-300 shadow-md hover:shadow-emerald-900/20">
      {/* Category Badge */}
      <Badge className="absolute top-3 left-3 z-10 bg-emerald-600/90 hover:bg-emerald-600 text-white">
        {category}
      </Badge>
      
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-forest-900/50">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      
      {/* Product Details */}
      <div className="p-5">
        <h3 className="font-medium text-lg mb-2 line-clamp-1">{name}</h3>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center text-amber-400 mr-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(rating) ? "currentColor" : "none"}
                className={i < Math.floor(rating) ? "text-amber-400" : "text-gray-500"}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{rating}</span>
        </div>
        
        {/* Price and Button */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <ShoppingCart size={16} className="mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Quick View Overlay - visible on hover */}
      <div className="absolute inset-0 bg-forest-900/70 opacity-0 flex items-center justify-center transition-opacity group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
        <Button
          variant="outline"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          Quick View
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
