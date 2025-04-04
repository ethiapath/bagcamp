import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          About Bagcamp
        </h1>
        
        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Our Mission</h2>
          <p className="text-lg text-gray-300 mb-6">
            Bagcamp is an online music platform and community, serving as an alternative to Bandcamp. 
            We prioritize electronic music genres and aim to be a particularly supportive and visible space 
            for trans, gender non-conforming (GNC), and LGBTQ+ artists, while welcoming all independent musicians. 
            We emphasize fair compensation for artists and direct fan support.
          </p>
          <p className="text-lg text-gray-300">
            We believe that music is a powerful medium for connection, expression, and change. 
            By creating a platform that centers marginalized voices in electronic music, 
            we aim to help reshape the industry into one that is more equitable, diverse, and vibrant.
          </p>
        </section>
        
        {/* Vision Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Our Vision</h2>
          <p className="text-lg text-gray-300 mb-6">
            To be the premier online destination for discovering, streaming, and purchasing independent electronic music, 
            fostering a vibrant and inclusive community centered around artists, especially those from marginalized gender 
            identities within the electronic music scene.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Artists</h3>
              <p className="text-gray-300">
                A platform where you have complete control over your music, fair compensation, 
                and a supportive community that celebrates your unique voice and perspective.
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Fans</h3>
              <p className="text-gray-300">
                A treasure trove of authentic electronic music, where your support goes directly to 
                artists and your exploration leads to discovering voices that might otherwise go unheard.
              </p>
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Our Values</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Artist-First Approach</h3>
              <p className="text-gray-300">
                Platform decisions prioritize the needs and well-being of the artists. We exist to serve and 
                empower creators, not to exploit them.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-gray-300">
                Revenue splits, platform policies, and discovery algorithms are clear and understandable. 
                We believe in being open and honest about how our platform operates.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Inclusivity & Safety</h3>
              <p className="text-gray-300">
                We proactively create and maintain a space free from harassment and discrimination, 
                with strong moderation policies specifically protecting trans and LGBTQ+ users.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Community Focus</h3>
              <p className="text-gray-300">
                We encourage positive interaction and direct support between fans and artists. 
                Bagcamp is not just a marketplace but a living, breathing community.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Passion for Electronic Music</h3>
              <p className="text-gray-300">
                We celebrate the diversity and creativity within electronic music genres. 
                Our platform is built by and for people who love this music and understand its cultural significance.
              </p>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-purple-400">Our Story</h2>
          <p className="text-lg text-gray-300 mb-6">
            Bagcamp was founded by DJ Bag Lady, a veteran of the electronic music scene with a vision to create 
            a more equitable platform for artists like herself and her peers who often found themselves marginalized 
            in traditional music spaces.
          </p>
          <p className="text-lg text-gray-300">
            After years of watching talented trans, GNC, and LGBTQ+ artists struggle for visibility and fair compensation, 
            she decided to build a platform that specifically addressed these issues while celebrating the rich diversity 
            of electronic music.
          </p>
        </section>
        
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="max-w-2xl mx-auto mb-6 text-lg">
            Whether you're an artist looking for a supportive platform or a fan seeking authentic electronic music, 
            Bagcamp welcomes you to our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/artist/signup" 
              className="px-6 py-3 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 transition"
            >
              Join as Artist
            </Link>
            <Link 
              href="/discover" 
              className="px-6 py-3 border border-white text-white font-semibold rounded-full hover:bg-purple-800 transition"
            >
              Discover Music
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
} 