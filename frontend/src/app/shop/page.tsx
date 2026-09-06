import { redirect } from "next/navigation";

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || 'http://localhost:3003';

export default function ShopRedirect() {
  redirect(SHOP_URL);
}
