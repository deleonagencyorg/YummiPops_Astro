/**
 * Barrier para centralizar todos los assets que se utilizan en la aplicación
 * Las dimensiones y estilos se definen en los componentes donde se utilizan
 */

// Base URL del bucket de S3
const S3_BASE_URL = 'https://snack.yummiespromociones.com/snacksyummies';
const S3_BASE_ASSETS_URL = 'https://snack.yummiespromociones.com/SnacksyummiesAssets';

// Interfaz básica para assets
export interface Asset {
  url: string;
  alt?: string;
}

export const generalAssets = {
  locationIcon: `${S3_BASE_URL}/iconmap.svg`,
  phoneIcon: `${S3_BASE_URL}/iconphone.svg`,
  emailIcon: `${S3_BASE_URL}/iconemail.svg`,
  timeIcon: `${S3_BASE_URL}/iconsizes.svg`,
  coronaIcon: `${S3_BASE_URL}/corona.webp`,
};

// Interfaz para enlaces de redes sociales
export interface SocialLink {
  name: string;
  url: string;
  iconUrl: string; // Asumimos que siempre habrá un iconUrl basado en el Header
  alt?: string; // Opcional, para accesibilidad
}

// Logos
export const logos = {
  principal: {
    url: `${S3_BASE_ASSETS_URL}/logo-pops2.webp`,
    alt: 'Yummi Pops Logo'
  }
};


// Enlaces de Redes Sociales
// Asegúrate de que las URLs de los iconos sean correctas y existan en tu S3_BASE_URL o donde los alojes.
export const socialMediaIconUrls = {
  facebook: `${S3_BASE_URL}/icons8-facebook.svg`,
  instagram: `${S3_BASE_URL}/icons8-instagram.svg`,
  tiktok: `${S3_BASE_URL}/icons8-tiktok.svg`,
};
  // Añade más redes si es necesario