"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

/**
 * Atualiza o status de 'usuário pago' para um usuário específico no Clerk.
 * Esta função deve ser chamada apenas por administradores.
 * @param userId O ID do usuário do Clerk a ser atualizado.
 * @param isPaidUser O novo status de pago (true para acesso, false para remover acesso).
 */
export async function updateUserPaidStatus(userId: string, isPaidUser: boolean) {
  try {
    // Em uma aplicação real, você adicionaria uma verificação de autenticação e função de administrador aqui.
    // Ex: const { userId: currentUserId, orgRole } = auth(); if (orgRole !== 'admin') throw new Error('Unauthorized');

    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        isPaidUser: isPaidUser,
      },
    })

    // Revalida o cache para que as alterações sejam refletidas imediatamente no frontend
    revalidatePath("/")
    return {
      success: true,
      message: `Status de pago do usuário ${userId} atualizado para ${isPaidUser ? "Pago" : "Não Pago"}.`,
    }
  } catch (error: any) {
    console.error("Erro ao atualizar status de pago do usuário:", error)
    return {
      success: false,
      message: `Falha ao atualizar status de pago: ${error.errors?.[0]?.longMessage || error.message || "Erro desconhecido"}`,
    }
  }
}
