import { Environment } from "@/modules/environment/components/environment";

export default function IndexPage() {
  return (
    <main className="mx-auto grid max-w-6xl items-start gap-6 px-4 py-6 md:grid-cols-2 lg:gap-12">
      <Environment />
    </main>
  );
}
