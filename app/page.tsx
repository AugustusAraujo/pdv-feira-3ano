/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
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
      name: "Combo Tropeiro",
      price: 12,
      count: 0,
    },
    {
      id: 2,
      name: "Combo Pastel",
      price: 10,
      count: 0,
    },
    {
      id: 3,
      name: "Refri",
      price: 2,
      count: 0,
    },
    {
      id: 4,
      name: "C/ Cana",
      price: 4,
      count: 0,
    },
    {
      id: 5,
      name: "Suco",
      price: 4,
      count: 0,
    },
    {
      id: 6,
      name: "Pastel",
      price: 8,
      count: 0,
    },
    {
      id: 7,
      name: "Tropeiro",
      price: 10,
      count: 0,
    },
  ]);

  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [troco, setTroco] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  function reset() {
    setCartItems([]);
    setTotal(0);
    setTroco(0);
  }

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
      recalculateTotal();
    } else {
      const r = products.filter((e) => e.id === id);
      if (r.length === 1) {
        r[0].count = 1;
        setCartItems((prevItems) => [...prevItems, r[0]]);
        toast.success("Produto adicionado");
      }
      recalculateTotal();
    }

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

  // useEffect para chamar o recálculo a cada 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      recalculateTotal();
    }, 500); // Chama a função a cada 500ms

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, [cartItems, recalculateTotal]);

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
      const response = await fetch("/api/order", {
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

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="w-[100%] flex flex-col">
      {/* STOCK */}
      <div className="border-solid border-gray-200 w-full flex gap-1 mt-10 flex-wrap box-border p-1">
        {products.map((i, index) => (
          <div
            key={index}
            className="w-[48%] bg-blue-400 h-[80px] flex justify-center items-center flex-col"
            onClick={() => addToCart(i.id)}
          >
            <span>{i.name}</span> <br></br>
            <span>R$ {i.price}</span>
          </div>
        ))}
      </div>
      {/* CART */}
      <div className="bg-gray-100 h-[400px] w-full mt-5">
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

      <footer className="w-full bg-white text-black text-4xl flex justify-between box-border h-20 items-center rounded-md m-auto p-3 mt-3">
        <span>Total: </span>
        <span>R$ {total.toFixed(2)}</span>
      </footer>
      <div>
        {/* Input para inserir o valor pago */}
        <div className="flex flex-col mt-5">
          <h4 className="text-2xl">Troco</h4>
          <input
            type="number"
            placeholder="Valor pago"
            className=" border-gray-400 p-2 text-black h-[70px] text-2xl"
            onChange={(e) => {
              calcularTroco(Number(e.target.value));
            }}
          />
          {troco != null ? (
            <span className="text-green-500 mt-3">
              Troco: R$ {troco.toFixed(2)}
            </span>
          ) : (
            <span className="text-green-500 mt-3">Troco: R$ 0.00</span>
          )}
        </div>
        {/* Botão para finalizar pedido */}
        <button
          onClick={reset}
          className="bg-green-400 w-full h-10 m-auto mt-3 mb-3 cursor-pointerq"
        >
          Finalizar Pedido
        </button>
      </div>
    </div>
  );
}
