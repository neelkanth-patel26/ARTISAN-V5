"use client";

import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const images = [
  { url: "https://images.unsplash.com/photo-1579783483458-83d02161294e?w=600&h=800&fit=crop&q=90", category: "abstract" },
  { url: "https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=600&h=800&fit=crop&q=90", category: "landscape" },
  { url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=800&fit=crop&q=90", category: "portrait" },
  { url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=800&fit=crop&q=90", category: "sculpture" },
  { url: "https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=600&h=800&fit=crop&q=90", category: "digital" },
  { url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=800&fit=crop&q=90", category: "photography" },
  { url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop&q=90", category: "abstract" },
  { url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop&q=90", category: "landscape" },
  { url: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=600&h=800&fit=crop&q=90", category: "portrait" },
  { url: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&h=800&fit=crop&q=90", category: "sculpture" },
  { url: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=800&fit=crop&q=90", category: "digital" },
  { url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&h=800&fit=crop&q=90", category: "photography" },
  { url: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=800&fit=crop&q=90", category: "abstract" },
  { url: "https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=600&h=800&fit=crop&q=90", category: "landscape" },
  { url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=800&fit=crop&q=90", category: "portrait" },
  { url: "https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=600&h=800&fit=crop&q=90", category: "sculpture" },
  { url: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600&h=800&fit=crop&q=90", category: "digital" },
  { url: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&h=800&fit=crop&q=90", category: "photography" },
  { url: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=800&fit=crop&q=90", category: "abstract" },
  { url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop&q=90", category: "landscape" },
  { url: "https://images.unsplash.com/photo-1577720643272-265f28a6e0c6?w=600&h=800&fit=crop&q=90", category: "portrait" },
  { url: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=600&h=800&fit=crop&q=90", category: "sculpture" },
  { url: "https://images.unsplash.com/photo-1578926078-d4f5f8f3c5c5?w=600&h=800&fit=crop&q=90", category: "digital" },
  { url: "https://images.unsplash.com/photo-1579783483458-83d02161294e?w=600&h=800&fit=crop&q=90", category: "photography" },
  { url: "https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=600&h=800&fit=crop&q=90", category: "abstract" },
  { url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=800&fit=crop&q=90", category: "landscape" },
  { url: "https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=600&h=800&fit=crop&q=90", category: "portrait" },
  { url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=800&fit=crop&q=90", category: "sculpture" },
  { url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop&q=90", category: "digital" },
  { url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop&q=90", category: "photography" },
  { url: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=600&h=800&fit=crop&q=90", category: "abstract" },
  { url: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&h=800&fit=crop&q=90", category: "landscape" },
  { url: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=800&fit=crop&q=90", category: "portrait" },
  { url: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&h=800&fit=crop&q=90", category: "sculpture" },
  { url: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=600&h=800&fit=crop&q=90", category: "digital" },
  { url: "https://images.unsplash.com/photo-1561214078-f3247647fc5e?w=600&h=800&fit=crop&q=90", category: "photography" },
];

const Skiper30 = () => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ["start end", "end start"],
  });

  const { height } = dimension;
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", resize);
    requestAnimationFrame(raf);
    resize();

    return () => {
      lenis.destroy();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="w-full bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <div className="font-geist flex h-screen items-center justify-center gap-2">
        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-neutral-900 after:to-neutral-950 after:content-['']">
            scroll down to see
          </span>
        </div>
      </div>

      <div
        ref={gallery}
        className="relative box-border flex h-[175vh] gap-[2vw] overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-[2vw]"
      >
        <Column images={images.slice(0, 9)} y={y} />
        <Column images={images.slice(9, 18)} y={y2} className="hidden md:flex" />
        <Column images={images.slice(18, 27)} y={y3} />
        <Column images={images.slice(27, 36)} y={y4} className="hidden md:flex" />
      </div>
      <div className="font-geist relative flex h-screen items-center justify-center gap-2">
        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-neutral-900 after:to-neutral-950 after:content-['']">
            scroll Up to see
          </span>
        </div>
      </div>
    </main>
  );
};

type ColumnProps = {
  images: { url: string; category: string }[];
  y: MotionValue<number>;
  className?: string;
};

const Column = ({ images, y, className = '' }: ColumnProps) => {
  return (
    <motion.div
      className={`relative -top-[45%] flex h-full w-1/4 min-w-[250px] flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%] ${className}`}
      style={{ y }}
    >
      {images.map((img, i) => (
        <Link key={i} href={`/gallery?category=${img.category}`} className="relative h-full w-full overflow-hidden bg-neutral-200 group cursor-pointer">
          <img
            src={img.url}
            alt=""
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const parent = img.parentElement;
              if (parent) {
                parent.style.display = 'none';
              }
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm uppercase tracking-wider">{img.category}</span>
          </div>
        </Link>
      ))}
    </motion.div>
  );
};

export { Skiper30 };
