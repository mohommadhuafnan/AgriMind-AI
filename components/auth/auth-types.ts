export type AuthMode = "login" | "signup"

export const authSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 34,
}

export const authEase = [0.45, 0, 0.55, 1] as const
