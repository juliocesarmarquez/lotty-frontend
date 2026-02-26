import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#FFD700',
        'cream': '#FFF8E7',
        'card-white': '#FFFFFF',
        'gray-light': '#F0F0F0',
        'border-black': '#000000',
        'text-main': '#1A1A1A',
      },
      fontFamily: {
        display: ['var(--font-chakra-petch)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
export default config
