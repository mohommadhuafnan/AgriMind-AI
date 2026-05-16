export interface SriLankaLocation {
  id: string
  name: string
  latitude: number
  longitude: number
}

export const SRI_LANKA_LOCATIONS: SriLankaLocation[] = [
  { id: "colombo", name: "Colombo", latitude: 6.9271, longitude: 79.8612 },
  { id: "kandy", name: "Kandy", latitude: 7.2906, longitude: 80.6337 },
  { id: "galle", name: "Galle", latitude: 6.0535, longitude: 80.221 },
  { id: "jaffna", name: "Jaffna", latitude: 9.6615, longitude: 80.0255 },
  { id: "anuradhapura", name: "Anuradhapura", latitude: 8.3114, longitude: 80.4037 },
  { id: "kurunegala", name: "Kurunegala", latitude: 7.4818, longitude: 80.365 },
  { id: "badulla", name: "Badulla", latitude: 6.9934, longitude: 81.055 },
  { id: "ratnapura", name: "Ratnapura", latitude: 6.6828, longitude: 80.4036 },
]

export function getLocationById(id: string): SriLankaLocation {
  return (
    SRI_LANKA_LOCATIONS.find((l) => l.id === id) ?? SRI_LANKA_LOCATIONS[0]
  )
}
