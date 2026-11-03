import { useEffect } from 'react';
import { SITE_URL, DEFAULT_IMAGE } from '../config/site';

const upsertMeta = (key, content, attribute = 'name') => {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const upsertJsonLd = (id, data) => {
  document.getElementById(id)?.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

const Seo = ({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index, follow',
  jsonLd = null,
}) => {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;

    document.title = title;
    upsertMeta('description', description);
    upsertMeta('robots', robots);
    upsertLink('canonical', canonicalUrl);

    upsertMeta('og:type', type, 'property');
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:url', canonicalUrl, 'property');
    upsertMeta('og:image', image, 'property');

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', image);

    upsertJsonLd('page-jsonld', jsonLdString ? JSON.parse(jsonLdString) : null);
  }, [title, description, path, image, type, robots, jsonLdString]);

  return null;
};

export default Seo;
