import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/subscribe(.*)",
  "/privacy-policy(.*)",
  "/content-policy(.*)",
  // Adicione outras rotas públicas aqui, se houver
])

export default clerkMiddleware((auth, req) => {
  // Adicione este log para depuração
  console.log("CLERK_SECRET_KEY is set:", !!process.env.CLERK_SECRET_KEY)

  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
