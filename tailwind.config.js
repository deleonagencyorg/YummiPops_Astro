module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  safelist: [
    'bg-primary', 'text-primary', 'border-primary',
    'bg-secondary', 'text-secondary', 'border-secondary',
    'bg-tertiary', 'text-tertiary', 'border-tertiary',
    'bg-red', 'text-red', 'border-red',
    'bg-white', 'text-white', 'border-white',
    'bg-blue', 'text-blue', 'border-blue',
    'bg-orange', 'text-orange', 'border-orange',
    'bg-yellow', 'text-yellow', 'border-yellow',
    'bg-pink', 'text-pink', 'border-pink',
    'bg-quinary', 'text-quinary', 'border-quinary',
    'bg-brown', 'text-brown', 'border-brown',
    'bg-green', 'text-green', 'border-green',
    ],
  theme: {
    extend: {
      colors: {
        primary: '#FD6600',
        secondary: '#0167F7',
        red: '#E92104',
        redButton: '#D61F2C',
        orange: '#F86509',
        orangeButton: '#EC6503',
        primaryCream: "#FAF0D5",
      },
      fontFamily: {
        sans: ['Rockeby regular', 'sans-serif'],
        title: ['Rockeby black', 'serif'],
        heading: ['Rockeby regular', 'sans-serif'],
        text: ['Rockeby regular', 'sans-serif']
      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '900px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
}