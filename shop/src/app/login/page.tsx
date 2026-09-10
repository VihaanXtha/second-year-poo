import ComingSoon from "@/components/ComingSoon";

const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || "http://localhost:3000";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <ComingSoon
      title="Sign In"
      kicker="Storefront auth"
      note="Storefront sign-in is rolling out with the shop. Until then, use the main Circuit Bazaar site — same account, same backend."
      secondaryHref={`${HOME_URL}/login`}
      secondaryLabel="Sign in on the main site →"
    />
  );
}
