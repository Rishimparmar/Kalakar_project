import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, url, image }) => {
  const siteTitle = title || 'Kalaakar | Turning Memories Into Art';
  const siteDescription = description || 'Kalaakar specializes in customized handmade sketches, couple portraits, paper crafts, and resin ring holders.';
  const siteUrl = url || 'https://kalaakar.online';
  const siteImage = image || 'https://kalaakar.online/logo.png';

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      
      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
    </Helmet>
  );
};

export default SEO;
