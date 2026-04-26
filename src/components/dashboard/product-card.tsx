"use client";

import { Product } from "@/types/product";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const handleAddToCart = () => {
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group overflow-hidden border-zinc-800 bg-zinc-900/40 transition-all hover:bg-zinc-900/60 hover:ring-1 hover:ring-zinc-700">
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        <Image
          src={product.image || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.category && (
          <Badge className="absolute left-2 top-2 border-white/20 bg-black/50 text-[10px] font-medium text-white backdrop-blur-md">
            {product.category.name.toUpperCase()}
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pt-4">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1 text-base group-hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between border-t border-zinc-800/50 p-4 pt-4">
        <span className="text-xl font-bold tracking-tight text-white">${product.price}</span>
        <Button 
          size="sm" 
          className="h-9 gap-2 bg-white text-zinc-900 transition-all hover:bg-zinc-200"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
