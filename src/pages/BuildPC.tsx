
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Plus, ChevronRight, Package, PcCase, Cpu, Smartphone, Monitor, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// PC parts data
const partCategories = [
  {
    id: "cpu",
    name: "CPU",
    icon: <Cpu className="w-5 h-5" />,
    options: [
      { id: 1, name: "AMD Ryzen 9 7950X", price: 599.99, description: "16 cores, 32 threads, up to 5.7GHz" },
      { id: 2, name: "Intel Core i9-13900K", price: 589.99, description: "24 cores, 32 threads, up to 5.8GHz" },
      { id: 3, name: "AMD Ryzen 7 7800X3D", price: 449.99, description: "8 cores, 16 threads, up to 5.0GHz" },
      { id: 4, name: "Intel Core i7-14700K", price: 419.99, description: "20 cores, 28 threads, up to 5.6GHz" }
    ]
  },
  {
    id: "motherboard",
    name: "Motherboard",
    icon: <PcCase className="w-5 h-5" />,
    options: [
      { id: 5, name: "ASUS ROG Strix X670E-E", price: 499.99, description: "AMD X670E, DDR5, PCIe 5.0, WiFi 6E" },
      { id: 6, name: "MSI MPG Z790 Carbon WiFi", price: 399.99, description: "Intel Z790, DDR5, PCIe 5.0, WiFi 6E" },
      { id: 7, name: "Gigabyte B650 AORUS Elite", price: 269.99, description: "AMD B650, DDR5, PCIe 4.0, WiFi 6" },
      { id: 8, name: "ASUS Prime Z790-A", price: 329.99, description: "Intel Z790, DDR5, PCIe 5.0" }
    ]
  },
  {
    id: "gpu",
    name: "Graphics Card",
    icon: <Smartphone className="w-5 h-5" />,
    options: [
      { id: 9, name: "NVIDIA RTX 4080 Super", price: 999.99, description: "16GB GDDR6X, DLSS 3, Ray Tracing" },
      { id: 10, name: "AMD Radeon RX 7900 XTX", price: 949.99, description: "24GB GDDR6, FSR 3, Ray Tracing" },
      { id: 11, name: "NVIDIA RTX 4070 Ti", price: 799.99, description: "12GB GDDR6X, DLSS 3, Ray Tracing" },
      { id: 12, name: "AMD Radeon RX 6950 XT", price: 699.99, description: "16GB GDDR6, FSR 2, Ray Tracing" }
    ]
  },
  {
    id: "ram",
    name: "Memory (RAM)",
    icon: <HardDrive className="w-5 h-5" />,
    options: [
      { id: 13, name: "G.SKILL Trident Z5 RGB 32GB", price: 189.99, description: "DDR5-6000, CL30, 2x16GB" },
      { id: 14, name: "Corsair Vengeance RGB 32GB", price: 159.99, description: "DDR5-5600, CL36, 2x16GB" },
      { id: 15, name: "Kingston FURY Beast RGB 32GB", price: 149.99, description: "DDR5-5200, CL40, 2x16GB" },
      { id: 16, name: "Crucial Pro 32GB", price: 129.99, description: "DDR5-4800, CL40, 2x16GB" }
    ]
  },
  {
    id: "storage",
    name: "Storage",
    icon: <HardDrive className="w-5 h-5" />,
    options: [
      { id: 17, name: "Samsung 990 PRO 2TB", price: 189.99, description: "PCIe 4.0 NVMe, 7,450MB/s read" },
      { id: 18, name: "WD Black SN850X 2TB", price: 179.99, description: "PCIe 4.0 NVMe, 7,300MB/s read" },
      { id: 19, name: "Crucial T700 2TB", price: 229.99, description: "PCIe 5.0 NVMe, 12,400MB/s read" },
      { id: 20, name: "Seagate FireCuda 530 2TB", price: 169.99, description: "PCIe 4.0 NVMe, 7,300MB/s read" }
    ]
  },
  {
    id: "case",
    name: "PC Case",
    icon: <Package className="w-5 h-5" />,
    options: [
      { id: 21, name: "Lian Li O11 Dynamic EVO", price: 169.99, description: "Mid Tower, ATX, Tempered Glass" },
      { id: 22, name: "Corsair 5000D Airflow", price: 174.99, description: "Mid Tower, ATX, Mesh front panel" },
      { id: 23, name: "Fractal Design Meshify 2", price: 149.99, description: "Mid Tower, ATX, High airflow design" },
      { id: 24, name: "NZXT H7 Flow", price: 129.99, description: "Mid Tower, ATX, Minimalist design" }
    ]
  },
  {
    id: "cooling",
    name: "CPU Cooling",
    icon: <Monitor className="w-5 h-5" />,
    options: [
      { id: 25, name: "NZXT Kraken X73 RGB", price: 199.99, description: "360mm AIO Liquid Cooler, RGB" },
      { id: 26, name: "Corsair iCUE H150i ELITE", price: 219.99, description: "360mm AIO Liquid Cooler, LCD Display" },
      { id: 27, name: "Noctua NH-D15", price: 99.99, description: "Air Cooler, Dual Tower Design" },
      { id: 28, name: "be quiet! Dark Rock Pro 4", price: 89.99, description: "Air Cooler, Silent Operation" }
    ]
  },
  {
    id: "psu",
    name: "Power Supply",
    icon: <HardDrive className="w-5 h-5" />,
    options: [
      { id: 29, name: "Corsair RM850x", price: 149.99, description: "850W, Fully Modular, 80+ Gold" },
      { id: 30, name: "EVGA SuperNOVA 850 G6", price: 139.99, description: "850W, Fully Modular, 80+ Gold" },
      { id: 31, name: "be quiet! Straight Power 11 850W", price: 159.99, description: "850W, Fully Modular, 80+ Platinum" },
      { id: 32, name: "Seasonic FOCUS GX-850", price: 129.99, description: "850W, Fully Modular, 80+ Gold" }
    ]
  }
];

type PartType = {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId?: string;
  categoryName?: string;
};

type SelectedPartsType = Record<string, PartType | null>;

const BuildPC = () => {
  const { toast } = useToast();
  const [selectedParts, setSelectedParts] = useState<SelectedPartsType>({
    cpu: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    case: null,
    cooling: null,
    psu: null,
  });
  
  const handlePartSelect = (categoryId: string, part: PartType) => {
    setSelectedParts((prev) => ({
      ...prev,
      [categoryId]: { ...part, categoryId, categoryName: partCategories.find(cat => cat.id === categoryId)?.name },
    }));
    
    toast({
      title: "Part selected",
      description: `${part.name} added to your build`,
    });
  };
  
  const totalPrice = Object.values(selectedParts)
    .filter((part): part is PartType => part !== null)
    .reduce((sum, part) => sum + part.price, 0);
  
  const selectedPartsCount = Object.values(selectedParts).filter(Boolean).length;
  
  const addAllToCart = () => {
    toast({
      title: "Added to cart",
      description: "All selected components have been added to your cart",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Component selection */}
          <div className="w-full md:w-2/3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Build Your Custom PC</h1>
              <p className="text-muted-foreground">
                Select components for your custom build and see real-time compatibility and performance insights.
              </p>
            </div>
            
            <Tabs defaultValue={partCategories[0].id} className="w-full">
              <TabsList className="w-full flex overflow-x-auto bg-forest-800 border border-forest-700 rounded-lg p-1 mb-8 justify-start">
                {partCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="flex-shrink-0 data-[state=active]:bg-forest-700 data-[state=active]:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.name}</span>
                      {selectedParts[category.id] && <Check size={14} className="text-emerald-400" />}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {partCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.options.map((part) => (
                      <Card key={part.id} className={`bg-forest-800 border ${
                        selectedParts[category.id]?.id === part.id 
                          ? 'border-emerald-500' 
                          : 'border-forest-700'
                      } hover:border-emerald-500/70 transition-colors cursor-pointer`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{part.name}</CardTitle>
                          <CardDescription>{part.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xl font-bold text-emerald-400">${part.price.toFixed(2)}</p>
                        </CardContent>
                        <CardFooter className="pt-2">
                          <Button 
                            onClick={() => handlePartSelect(category.id, part)}
                            variant={selectedParts[category.id]?.id === part.id ? "default" : "outline"}
                            className={selectedParts[category.id]?.id === part.id 
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white w-full" 
                              : "border-forest-700 w-full"}
                          >
                            {selectedParts[category.id]?.id === part.id 
                              ? <Check size={16} className="mr-2" /> 
                              : <Plus size={16} className="mr-2" />}
                            {selectedParts[category.id]?.id === part.id ? "Selected" : "Select"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          {/* Build summary */}
          <div className="w-full md:w-1/3 sticky top-24">
            <Card className="bg-forest-800 border-forest-700">
              <CardHeader>
                <CardTitle>Your Build Summary</CardTitle>
                <CardDescription>
                  {selectedPartsCount} of 8 components selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedParts).map(([categoryId, part]) => (
                  <div 
                    key={categoryId}
                    className="flex justify-between items-center py-2 border-b border-forest-700 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {partCategories.find(cat => cat.id === categoryId)?.name}
                      </p>
                      {part ? (
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-emerald-400">${part.price.toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="text-sm italic text-muted-foreground">Not selected</p>
                      )}
                    </div>
                    {part && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => {
                          setSelectedParts(prev => ({...prev, [categoryId]: null}));
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-forest-700">
                  <div className="flex justify-between font-bold">
                    <span>Total Price:</span>
                    <span className="text-xl text-emerald-400">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={selectedPartsCount === 0}
                  onClick={addAllToCart}
                >
                  Add All to Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-forest-700 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedParts({
                      cpu: null,
                      motherboard: null,
                      gpu: null,
                      ram: null,
                      storage: null,
                      case: null,
                      cooling: null,
                      psu: null,
                    });
                    toast({
                      title: "Build cleared",
                      description: "Your PC build has been reset",
                    });
                  }}
                >
                  Clear Build
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuildPC;
