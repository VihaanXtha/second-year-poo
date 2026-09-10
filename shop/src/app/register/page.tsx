import ComingSoon from "@/components/ComingSoon";

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

export const metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <ComingSoon
      title="Create Account"
      kicker="Storefront auth"
      note="Storefront registration is rolling out with the shop. Until then, use the main Circuit Bazaar site — same account, same backend."
      secondaryHref={`${HOME_URL}/register`}
      secondaryLabel="Register on the main site →"
    />
  );
}
