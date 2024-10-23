/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  id: number;
  name: string;
  price: number;
  count: number;
}

export default function Home() {
  const [total, setTotal] = useState(0);
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Arroz",
      price: 1,
      count: 0,
    },
    {
      id: 2,
      name: "Feijão",
      price: 1,
      count: 0,
    },
  ]);

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [troco, setTroco] = useState<number | null>(null);

  function addToCart(id: number) {
    const q = cartItems.filter((e) => e.id === id);

    if (q.length === 1) {
      const updatedCartItems = cartItems.map((e) => {
        if (e.id === id) {
          e.count += 1;
          toast.success("Quantidade alterada para " + e.count);
        }
        return e;
      });
      setCartItems(updatedCartItems);
    } else {
      const r = products.filter((e) => e.id === id);
      if (r.length === 1) {
        r[0].count = 1;
        setCartItems((prevItems) => [...prevItems, r[0]]);
        toast.success("Produto adicionado");
      }
    }

    recalculateTotal();
    calcularTroco(total);
  }

  function decreaseFromCart(id: number) {
    const updatedCartItems = cartItems
      .map((e) => {
        if (e.id === id && e.count > 0) {
          e.count -= 1;
          toast.info("Quantidade alterada para " + e.count);
        }
        return e;
      })
      .filter((e) => e.count > 0);

    setCartItems(updatedCartItems);
    recalculateTotal();
    calcularTroco(total);
  }

  // Remove item from cart completely
  function removeFromCart(id: number) {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
    recalculateTotal();
    toast.error("Produto removido do carrinho");
    calcularTroco(total);
  }

  function recalculateTotal() {
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );
    setTotal(total);
  }

  // Função para calcular o troco
  function calcularTroco(valorPago: number) {
    if (valorPago < total) {
      toast.error("Valor insuficiente.");
      setTroco(null);
    } else {
      const trocoCalculado = valorPago - total;
      setTroco(trocoCalculado);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function finalizarPedido() {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/finalizar-pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Erro ao finalizar o pedido.");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-[100%] flex">
      <div className="w-1/2">
        {/* STOCK */}
        <div className="border-solid border-gray-200 w-[100%] flex gap-2 ml-10 mr-10 mt-10">
          {products.map((i, index) => (
            <div
              key={index}
              className="w-1/6 bg-blue-400 h-8 flex justify-center items-center ital"
              onClick={() => addToCart(i.id)}
            >
              {i.name} - R$ {i.price}
            </div>
          ))}
        </div>
        {/* CART */}
        <div className="bg-gray-100 h-[500px] w-2/3 mt-5 ml-10">
          {cartItems.map((i, index) => (
            <div
              key={index}
              className="text-black flex justify-between pr-5 pl-5 h-10 items-center"
            >
              <span>{i.name}</span> - <span>R$ {i.price.toFixed(2)}</span> -{" "}
              <span>QTD: {i.count}</span> -{" "}
              <span>R$ {(i.price * i.count).toFixed(2)}</span>
              <button
                className="text-red-500"
                onClick={() => decreaseFromCart(i.id)}
              >
                (-)
              </button>
            </div>
          ))}
        </div>

        {/* Toast Notifications */}
        <ToastContainer />
        {/* Footer */}
      </div>
      <div className="w-1/2">
        {/* Input para inserir o valor pago */}
        <div className="flex flex-col w-1/3 ml-10 mt-5">
          <input
            type="number"
            placeholder="Valor pago"
            className="border border-gray-400 p-2"
            onChange={(e) => calcularTroco(Number(e.target.value))}
          />
          {troco !== null && (
            <span className="text-green-500 mt-3">
              Troco: R$ {troco.toFixed(2)}
            </span>
          )}
        </div>
        <div>
          {" "}
          {/* Botão para finalizar pedido */}
          <button
            onClick={finalizarPedido}
            disabled={isSubmitting}
            className="btn-finalizar"
          >
            {isSubmitting ? "Finalizando..." : "Finalizar Pedido"}
          </button>
        </div>
      </div>
      <footer className="w-1/2 bg-white text-black text-5xl flex justify-between box-border h-20 items-center rounded-md m-auto absolute bottom-5 right-10 pl-10 pr-10">
        <span>Total: </span>
        <span>R$ {total.toFixed(2)}</span>
      </footer>
    </div>
  );
}
