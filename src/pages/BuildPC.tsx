
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

// Simplified implementation for now
const BuildPC = () => {
  const { addToCart } = useCart();
  const [selectedComponents, setSelectedComponents] = useState<Record<string, Product | null>>({
    cpu: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null,
    monitor: null
  });
  
  // Sample products
  const sampleProducts: Record<string, Product[]> = {
    cpu: [
      {
        id: "cpu1",
        name: "AMD Ryzen 7 5800X",
        price: 349.99,
        image: "/placeholder.svg",
        category: "cpu"
      },
      {
        id: "cpu2",
        name: "Intel Core i7-11700K",
        price: 379.99,
        image: "/placeholder.svg",
        category: "cpu"
      }
    ],
    gpu: [
      {
        id: "gpu1",
        name: "NVIDIA RTX 3070",
        price: 599.99,
        image: "/placeholder.svg",
        category: "gpu"
      },
      {
        id: "gpu2",
        name: "AMD Radeon RX 6800 XT",
        price: 649.99,
        image: "/placeholder.svg",
        category: "gpu"
      }
    ]
  };
  
  const handleSelectComponent = (category: string, product: Product) => {
    setSelectedComponents({
      ...selectedComponents,
      [category]: product
    });
  };
  
  const handleAddAllToCart = () => {
    Object.values(selectedComponents).forEach(component => {
      if (component) {
        addToCart(component.id);
      }
    });
  };
  
  return (
    <Layout>
      <div className="container py-16 mt-16">
        <h1 className="text-2xl font-bold mb-4">Build Your PC</h1>
        <p>PC Builder coming soon</p>
      </div>
    </Layout>
  );
};

export default BuildPC;
