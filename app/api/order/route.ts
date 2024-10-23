import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { cartItems } = await req.json();

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json({ message: "Carrinho vazio" }, { status: 400 });
  }

  try {
    // Calcular o total
    const total = cartItems.reduce(
      (acc: number, item: any) => acc + item.price * item.count,
      0
    );

    // Criar o pedido no banco de dados
    const order = await prisma.order.create({
      data: {
        total,
        OrderItems: {
          create: cartItems.map((item: any) => ({
            productId: item.id,
            quantity: item.count,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pedido finalizado com sucesso",
      order,
    });
  } catch (error) {
    console.error("Erro ao finalizar o pedido:", error);
    return NextResponse.json(
      { success: true, message: "Erro ao finalizar o pedido" },
      { status: 500 }
    );
  }
}
