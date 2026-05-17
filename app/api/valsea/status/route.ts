import { NextResponse } from "next/server"
import { getValseaApiKey, getValseaBaseUrl } from "@/lib/valsea/config"

/** Check whether Valsea is configured (does not expose the API key). */
export async function GET() {
  const key = getValseaApiKey()
  return NextResponse.json({
    success: true,
    data: {
      configured: Boolean(key),
      baseUrl: getValseaBaseUrl(),
    },
  })
}
