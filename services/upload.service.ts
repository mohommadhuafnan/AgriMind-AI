import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/client"

export async function uploadCropImage(
  imageBase64: string,
  folder = "agrimind/crops"
): Promise<string | null> {
  if (!isCloudinaryConfigured()) return null

  const dataUri = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`

  const cloudinary = getCloudinary()
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  })

  return result.secure_url
}
