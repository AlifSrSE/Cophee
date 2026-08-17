"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface CartItem extends Product {
  quantity: number;
  notes: string;
}

export default function TableOrderPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch("/api/v1/menu");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const updateItemNotes = (productId: string, itemNotes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, notes: itemNotes } : item))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.id === selectedCategory)
    : products;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName || "Guest",
          customerPhone: customerPhone || "0000000000",
          source: "DINE_IN",
          tableId: tableId || undefined,
          paymentMethod: "DIGITAL",
          notes,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            notes: item.notes,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const order = await response.json();
      window.location.href = `/order-status?orderId=${order.id}`;
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tableId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Table</h1>
          <p className="text-gray-600">Please scan a valid QR code from your table.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">☕ Cophee</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Table #{tableId}</span>
              {cartCount > 0 && (
                <span className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                  {cartCount} items
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              selectedCategory === ""
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center text-gray-400 text-2xl">
                    ☕
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                    {cartCount} items
                  </div>
                  <div className="text-lg font-semibold">Total: ${cartTotal.toFixed(2)}</div>
                </div>
                <button
                  onClick={() => document.getElementById("cart-modal")?.classList.remove("hidden")}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
                >
                  View Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div id="cart-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Order</h3>
                <button
                  onClick={() => document.getElementById("cart-modal")?.classList.add("hidden")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                        <input
                          type="text"
                          placeholder="Special instructions..."
                          value={item.notes}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                          className="mt-1 text-xs border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700 text-lg"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg mb-4">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="tel"
                      placeholder="Phone number (optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    />
                    <textarea
                      placeholder="Order notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                      rows={2}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium mt-4"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
