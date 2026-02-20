import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/constants/routes";

export default function ChangePasswordPage() {
  redirect(AUTH_ROUTES.LOGIN_V2);
}
