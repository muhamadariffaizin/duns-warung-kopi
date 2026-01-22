export const config = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Duns Warung Kopi',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6287881753955',
  qrisImage: process.env.NEXT_PUBLIC_QRIS_IMAGE || '/qris.png',
  ewalletInfo: process.env.NEXT_PUBLIC_EWALLET_INFO || 'DANA: 0812-xxxx-xxxx | OVO: 0812-xxxx-xxxx | GoPay: 0812-xxxx-xxxx',
  ppobAdminFeePct: Number(process.env.NEXT_PUBLIC_PPOB_ADMIN_FEE_PCT || '0.05')
};
