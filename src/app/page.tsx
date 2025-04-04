import Link from "next/link";
import Hero from '@/components/home/Hero';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import LatestReleases from '@/components/home/LatestReleases';
import SupabaseTest from '@/components/test/SupabaseTest';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <SupabaseTest />
        <FeaturedArtists />
        <LatestReleases />
      </div>
    </main>
  );
}
