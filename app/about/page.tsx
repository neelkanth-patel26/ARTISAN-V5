'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useRef } from 'react'
import { Heart, Target, Eye, Users } from 'lucide-react'

const LinePath = ({ className, scrollYProgress }: { className: string; scrollYProgress: any }) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.5, 0.97])

  return (
    <svg width="1278" height="2319" viewBox="0 0 1278 2319" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg" className={className}>
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="#d46d0ce0"
        strokeWidth="20"
        style={{ pathLength, strokeDashoffset: useTransform(pathLength, (value) => 1 - value) }}
      />
    </svg>
  )
}

export default function AboutPage() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref })

  return (
    <main className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-x-hidden">
      <Navigation />

      <section ref={ref} className="mx-auto flex min-h-[250vh] w-full flex-col items-center px-4 pb-20 md:pb-32">
        <div className="mt-20 md:mt-32 relative flex w-fit flex-col items-center justify-center gap-3 md:gap-5 text-center md:bg-transparent bg-black/40 md:backdrop-blur-none backdrop-blur-md md:border-0 border border-neutral-700/30 md:p-0 p-6 rounded-2xl">
          <div className="text-amber-600/60 text-[10px] md:text-xs tracking-[0.3em] font-light mb-2 md:mb-4">WHO WE ARE</div>
          <h1 className="relative z-10 text-4xl md:text-7xl lg:text-9xl font-light tracking-[-0.08em] text-white/90 drop-shadow-[0_0_30px_rgba(0,0,0,0.9)] leading-[1.2] md:leading-[1.3]" style={{ fontFamily: 'ForestSmooth, serif' }}>
            About <br /> Artisan
          </h1>
          <p className="relative z-10 max-w-2xl text-sm md:text-xl font-light text-neutral-400 drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
            Scroll down to discover our story
          </p>
          <LinePath className="absolute -left-[40%] top-0 z-0 scale-x-[-1]" scrollYProgress={scrollYProgress} />
        </div>

        <div className="w-full max-w-6xl translate-y-[8vh] md:translate-y-[15vh] text-center md:bg-transparent bg-black/20 md:backdrop-blur-none backdrop-blur-sm md:border-0 border border-neutral-700/30 md:p-0 p-6 rounded-xl">
          <p className="text-neutral-500 text-xs md:text-sm tracking-[0.2em] mb-3 md:mb-4">FOUNDED 2024</p>
          <h3 className="text-2xl md:text-5xl font-light text-white/90 mb-4 md:mb-6" style={{ fontFamily: 'serif' }}>Connecting Art & People</h3>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">A platform born from passion, dedicated to making exceptional art accessible to everyone worldwide.</p>
        </div>

        <div className="w-full max-w-6xl translate-y-[12vh] md:translate-y-[25vh] bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-6 md:p-8">
          <Heart className="text-amber-600/70 mx-auto mb-3 md:mb-4" size={28} />
          <h3 className="text-xl md:text-3xl font-light text-white/90 mb-3 md:mb-4 text-center" style={{ fontFamily: 'serif' }}>Our Story</h3>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed text-center font-light max-w-3xl mx-auto">Founded in 2024, Artisan emerged from a passion to democratize art and make exceptional artworks accessible to everyone. We believe art should transcend boundaries and connect people across cultures.</p>
        </div>

        <div className="w-full max-w-6xl translate-y-[16vh] md:translate-y-[35vh] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-6 md:p-8">
            <Target className="text-amber-600/70 mb-3 md:mb-4" size={24} />
            <h4 className="text-xl md:text-2xl font-light text-white/90 mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>Mission</h4>
            <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed">Empower artists globally with a platform to showcase their work and connect with collectors who appreciate their vision.</p>
          </div>
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-6 md:p-8">
            <Eye className="text-amber-600/70 mb-3 md:mb-4" size={24} />
            <h4 className="text-xl md:text-2xl font-light text-white/90 mb-2 md:mb-3" style={{ fontFamily: 'serif' }}>Vision</h4>
            <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed">Become the world's most trusted art marketplace, fostering creativity and cultural exchange worldwide.</p>
          </div>
        </div>

        <div className="w-full max-w-6xl translate-y-[20vh] md:translate-y-[45vh] bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-6 md:p-8">
          <Users className="text-amber-600/70 mx-auto mb-3 md:mb-4" size={28} />
          <h3 className="text-xl md:text-3xl font-light text-white/90 mb-6 md:mb-8 text-center" style={{ fontFamily: 'serif' }}>Our Values</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center bg-neutral-800/30 rounded-xl p-4 md:p-5 border border-neutral-700/30">
              <h5 className="text-amber-600/80 text-xs md:text-sm tracking-wider mb-1 md:mb-2 font-light">AUTHENTICITY</h5>
              <p className="text-neutral-400 text-[10px] md:text-xs font-light">Verified artworks</p>
            </div>
            <div className="text-center bg-neutral-800/30 rounded-xl p-4 md:p-5 border border-neutral-700/30">
              <h5 className="text-amber-600/80 text-xs md:text-sm tracking-wider mb-1 md:mb-2 font-light">CREATIVITY</h5>
              <p className="text-neutral-400 text-[10px] md:text-xs font-light">Diverse expressions</p>
            </div>
            <div className="text-center bg-neutral-800/30 rounded-xl p-4 md:p-5 border border-neutral-700/30">
              <h5 className="text-amber-600/80 text-xs md:text-sm tracking-wider mb-1 md:mb-2 font-light">COMMUNITY</h5>
              <p className="text-neutral-400 text-[10px] md:text-xs font-light">Building connections</p>
            </div>
            <div className="text-center bg-neutral-800/30 rounded-xl p-4 md:p-5 border border-neutral-700/30">
              <h5 className="text-amber-600/80 text-xs md:text-sm tracking-wider mb-1 md:mb-2 font-light">EXCELLENCE</h5>
              <p className="text-neutral-400 text-[10px] md:text-xs font-light">Quality service</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl translate-y-[24vh] md:translate-y-[55vh] grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-4 md:p-6">
            <p className="text-3xl md:text-4xl font-light text-amber-600/90 mb-1 md:mb-2" style={{ fontFamily: 'serif' }}>500+</p>
            <p className="text-neutral-400 text-[10px] md:text-xs tracking-wider font-light">ARTWORKS</p>
          </div>
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-4 md:p-6">
            <p className="text-3xl md:text-4xl font-light text-amber-600/90 mb-1 md:mb-2" style={{ fontFamily: 'serif' }}>150+</p>
            <p className="text-neutral-400 text-[10px] md:text-xs tracking-wider font-light">ARTISTS</p>
          </div>
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-4 md:p-6">
            <p className="text-3xl md:text-4xl font-light text-amber-600/90 mb-1 md:mb-2" style={{ fontFamily: 'serif' }}>50+</p>
            <p className="text-neutral-400 text-[10px] md:text-xs tracking-wider font-light">COUNTRIES</p>
          </div>
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-4 md:p-6">
            <p className="text-3xl md:text-4xl font-light text-amber-600/90 mb-1 md:mb-2" style={{ fontFamily: 'serif' }}>1000+</p>
            <p className="text-neutral-400 text-[10px] md:text-xs tracking-wider font-light">COLLECTORS</p>
          </div>
        </div>

        <div className="w-full max-w-6xl translate-y-[26vh] md:translate-y-[58vh] bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-6 md:p-8 text-center">
          <h3 className="text-xl md:text-3xl font-light text-white/90 mb-3 md:mb-4" style={{ fontFamily: 'serif' }}>Global Reach</h3>
          <p className="text-neutral-400 text-sm md:text-base font-light max-w-2xl mx-auto">Connecting artists and collectors across 50+ countries worldwide, fostering a vibrant international art community.</p>
        </div>

        <div className="w-full max-w-6xl translate-y-[30vh] md:translate-y-[75vh] grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-5 md:p-6 text-center">
            <p className="text-amber-600/80 text-sm md:text-base mb-1 md:mb-2 font-light">Secure Payments</p>
            <p className="text-neutral-400 text-xs md:text-sm font-light">Protected transactions</p>
          </div>
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-5 md:p-6 text-center">
            <p className="text-amber-600/80 text-sm md:text-base mb-1 md:mb-2 font-light">Insured Shipping</p>
            <p className="text-neutral-400 text-xs md:text-sm font-light">Worldwide delivery</p>
          </div>
          <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-5 md:p-6 text-center">
            <p className="text-amber-600/80 text-sm md:text-base mb-1 md:mb-2 font-light">14-Day Returns</p>
            <p className="text-neutral-400 text-xs md:text-sm font-light">Risk-free purchase</p>
          </div>
        </div>

        
        <div className="w-full max-w-6xl translate-y-[34vh] flex flex-col items-center gap-2 border-t border-neutral-800/50 pt-5 md:hidden">
          <p className="text-[10px] text-neutral-500 tracking-[0.2em] font-light uppercase" style={{ fontFamily: 'serif' }}>
            Made By Group 1
          </p>
          <p className="text-[10px] text-neutral-500 tracking-[0.15em] font-light uppercase text-center" style={{ fontFamily: 'serif' }}>
            © 2026 Gaming Network Studio Media Group
          </p>
        </div>


      </section>

      <Footer />
    </main>
  )
}
