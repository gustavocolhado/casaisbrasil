export const siteConfig = {
  name: 'Confissões de Corno',
  description: 'Confissões de Corno - A maior comunidade de confissões de corno do Brasil. Compartilhe suas histórias anônimas, conheça outras pessoas e encontre apoio na rede social de confissões mais popular do país. Histórias reais de corno, relatos de traição e desabafos anônimos.',
  url: process.env.HOST_URL || 'https://confissoesdecorno.com',
  ogImage: '/imgs/logo.png',
  links: {
    twitter: 'https://x.com/cornos_br',
    instagram: 'https://www.instagram.com/cornosdobrasil.com.br',
    telegram: 'https://t.me/SuporteAssinante',
  },
  keywords: [
    // Palavras-chave principais - PRIORIDADE MÁXIMA
    'confissões de corno',
    'confissão de corno',
    'confissões corno',
    'corno confessa',
    'sou corno',
    'histórias de corno',
    'relatos de corno',
    'desabafo de corno',
    'corno anônimo',
    'confissões anônimas de corno',
    
    // Variações da palavra-chave principal
    'confissões de corno online',
    'confissões de corno Brasil',
    'confissões de corno 2024',
    'confissões de corno grátis',
    'confissões de corno anônimo',
    'confissões de corno real',
    'confissões de corno verdadeiro',
    'confissões de corno hoje',
    'confissões de corno agora',
    'confissões de corno site',
    'confissões de corno app',
    'confissões de corno plataforma',
    'confissões de corno comunidade',
    'confissões de corno rede social',
    
    // Palavras-chave secundárias relacionadas
    'rede social de sexo',
    'rede social swing',
    'comunidade de confissões',
    'relatos de traição',
    'histórias reais de corno',
    'desabafo de corno',
    'cornos do Brasil',
    'vídeos de corno',
    'comunidade corno',
    'fórum corno',
    'chat corno',
    'encontros corno',
    'casais corno',
    'relacionamentos',
    'adulto conteúdo',
    'rede social adulto',
    'confissões anônimas',
    'desabafos de relacionamento',
    'histórias de traição',
    'comunidade swing',
    'encontros casais',
    'rede social relacionamentos',
    'confissões sexuais',
    'histórias reais',
    'comunidade adulto',
    'fórum de confissões',
    'chat de confissões',
    'rede social confissões',
    'plataforma de confissões',
    'site de confissões',
    'app de confissões',
    'confissões online',
    'desabafos online',
    'comunidade online',
    'rede social brasileira',
    'confissões Brasil',
    'histórias Brasil',
    'relatos Brasil',
    'comunidade Brasil',
    'rede social corno',
    'plataforma corno',
    'site corno',
    'app corno',
    'confissões corno online',
    'desabafos corno online',
    'comunidade corno online',
    'rede social corno Brasil',
    'plataforma corno Brasil',
    'site corno Brasil',
    'app corno Brasil',
    
    // Long-tail keywords
    'onde compartilhar confissões de corno',
    'como confessar ser corno',
    'comunidade para cornos',
    'rede social para cornos',
    'plataforma para confissões de corno',
    'site para confissões de corno',
    'app para confissões de corno',
    'confissões de corno anônimas online',
    'desabafos de corno anônimos',
    'histórias reais de cornos',
    'relatos verdadeiros de corno',
    'comunidade de cornos do Brasil',
    'rede social de cornos brasileira',
    'plataforma de confissões para cornos',
    'site de confissões para cornos',
    'app de confissões para cornos',
  ],
};

export function generateMetaTags({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  const fullTitle = title.includes('Confissões de Corno') ? title : `${title} | Confissões de Corno`;
  const fullImage = image ? `${siteConfig.url}${image}` : `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title: fullTitle,
    description,
    keywords: siteConfig.keywords.join(', '),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type,
      locale: 'pt_BR',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      site: '@cornosconfissao',
      creator: '@cornosconfissao',
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateStructuredData({
  type,
  title,
  description,
  url,
  image,
  author,
  publishedTime,
  modifiedTime,
  username,
  userImage,
  userBio,
}: {
  type: 'website' | 'article' | 'profile' | 'organization';
  title: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  username?: string;
  userImage?: string;
  userBio?: string;
}) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : type === 'profile' ? 'Person' : 'Organization',
    'name': title,
    'description': description,
    'url': url,
    'image': image || `${siteConfig.url}${siteConfig.ogImage}`,
    'publisher': {
      '@type': 'Organization',
      'name': siteConfig.name,
      'url': siteConfig.url,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteConfig.url}${siteConfig.ogImage}`,
      },
    },
  };

  if (type === 'website') {
    return {
      ...baseData,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${siteConfig.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };
  }

  if (type === 'article') {
    return {
      ...baseData,
      'author': {
        '@type': 'Person',
        'name': author || siteConfig.name,
      },
      'datePublished': publishedTime,
      'dateModified': modifiedTime || publishedTime,
      'headline': title,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': url,
      },
    };
  }

  if (type === 'profile' && username) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': username,
      'description': userBio || `Perfil de ${username} no ${siteConfig.name}`,
      'url': url,
      'image': userImage || `${siteConfig.url}/imgs/user.jpg`,
      'sameAs': [url],
    };
  }

  return baseData;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
} 