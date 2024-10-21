import mdx from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "mdx"],
  // experimental: {
  //   mdxRs: true,
  // },
};

const withMDX = mdx();
export default withMDX(nextConfig);