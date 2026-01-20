'use client';

import Link from 'next/link';
import { useStore } from '@/hooks/use-api';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitch, FaDiscord, FaTiktok, FaSteam } from 'react-icons/fa';
import { SiX } from 'react-icons/si';

export function Footer() {
  const { data: store } = useStore();
  const currentYear = new Date().getFullYear();

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-2">{store?.title || 'Duster Theme'}</h3>
            <p className="text-sm text-muted">
              {store?.description ? stripHtml(store.description) : 'Premium gaming products and services'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:ml-auto md:text-right">
            <h3 className="text-sm font-semibold mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-sm text-muted hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link href="/cart" className="text-sm text-muted hover:text-foreground transition-colors">
                Cart
              </Link>
              {store?.menu_links?.map((menuLink, index) => (
                <a
                  key={index}
                  href={menuLink.link.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {menuLink.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        {store?.social_medias && (
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-sm font-semibold mb-4 text-center">Follow Us</h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {store.social_medias.facebook && (
                <a
                  href={store.social_medias.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.instagram && (
                <a
                  href={store.social_medias.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.twitter && (
                <a
                  href={store.social_medias.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="X"
                >
                  <SiX className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.youtube && (
                <a
                  href={store.social_medias.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.tiktok && (
                <a
                  href={store.social_medias.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.discord && (
                <a
                  href={store.social_medias.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="Discord"
                >
                  <FaDiscord className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.twitch && (
                <a
                  href={store.social_medias.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="Twitch"
                >
                  <FaTwitch className="w-5 h-5" />
                </a>
              )}
              {store.social_medias.steam && (
                <a
                  href={store.social_medias.steam}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-primary transition-colors"
                  aria-label="Steam"
                >
                  <FaSteam className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted">
          <p>&copy; {currentYear} {store?.title || 'Duster Theme'}. Powered by Tip4Serv API.</p>
        </div>
      </div>
    </footer>
  );
}
