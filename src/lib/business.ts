/**
 * Datos del negocio Ferretería La Ceja — únicos hardcodeados en la app.
 * Cualquier vista que necesite teléfono/dirección/horarios consume de aquí.
 */
export const BUSINESS = {
  name: "Ferretería La Ceja",
  tagline: "El Atelier Industrial",
  address: "Calle 19 # 20-30, La Ceja, Antioquia, Colombia",
  phone: "(+57) 604 123 4567",
  email: "ventas@ferreterialaceja.com",
  hours: "Lun – Vie: 7:00 AM – 6:00 PM",
  yearFounded: 2016,
} as const;
