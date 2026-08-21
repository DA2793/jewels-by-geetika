import type { Metadata } from "next";
import { getProductById, products } from "@/data/products";

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProductById(params.id);
  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.name;
  const description = product.description.slice(0, 160);
  const url = `https://www.jewelsbygeetika.com/product/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} | Jewels by Geetika`,
      description,
      type: "website",
      url,
      images: [{ url: product.images[0], alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Jewels by Geetika`,
      description,
      images: [product.images[0]],
    },
  };
}

export default function ProductLayout({ params, children }: Props) {
  const product = getProductById(params.id);

  // schema.org Product structured data for rich results
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((img) => `https://www.jewelsbygeetika.com${img}`),
        brand: { "@type": "Brand", name: "Jewels by Geetika" },
        offers: {
          "@type": "Offer",
          url: `https://www.jewelsbygeetika.com/product/${product.id}`,
          priceCurrency: "INR",
          price: product.price,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "Jewels by Geetika" },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
