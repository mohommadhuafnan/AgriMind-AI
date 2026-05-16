"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CropForm } from "@/components/dashboard/crop-form"
import { useCrops } from "@/hooks/use-crops"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"

export default function NewCropPage() {
  const router = useRouter()
  const { createCrop } = useCrops()
  const { t } = useLanguage()

  return (
    <div className="max-w-2xl space-y-6" data-no-translate>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/crops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("crops.addTitle")}</h1>
          <p className="text-muted-foreground">{t("crops.addSubtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("crops.detailsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CropForm
            submitLabelKey="crops.createCrop"
            onSubmit={async (data) => {
              try {
                const crop = await createCrop(data)
                toast.success("Crop created")
                router.push(`/dashboard/crops/${String(crop._id)}`)
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create crop")
                throw e
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
