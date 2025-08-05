'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Users, MessageCircle, Clock, ArrowRight, Shield, Eye, Star, X, Menu } from 'lucide-react'
import Head from 'next/head'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Verificar se já estamos na página home para evitar redirecionamento desnecessário
      if (window.location.pathname !== '/home') {
        router.push('/home')
      }
    }
  }, [session, status, router])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <div className="text-white text-lg">Carregando...</div>
        </div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

  return (
    <>
      <Head>
        <title>Confissões de Corno - A Maior Comunidade de Confissões do Brasil | Histórias Reais e Anônimas</title>
        <meta name="description" content="Confissões de Corno - A maior comunidade de confissões de corno do Brasil. Compartilhe suas histórias anônimas, conheça outras pessoas e encontre apoio na rede social de confissões mais popular do país. Histórias reais de corno, relatos de traição e desabafos anônimos." />
        <meta name="keywords" content="confissões de corno, confissão de corno, confissões corno, corno confessa, sou corno, histórias de corno, relatos de corno, desabafo de corno, corno anônimo, confissões anônimas de corno, confissões de corno online, confissões de corno Brasil, confissões de corno 2024, confissões de corno grátis, confissões de corno anônimo, confissões de corno real, confissões de corno verdadeiro, confissões de corno hoje, confissões de corno agora, confissões de corno site, confissões de corno app, confissões de corno plataforma, confissões de corno comunidade, confissões de corno rede social, rede social de sexo, rede social swing, comunidade de confissões, relatos de traição, histórias reais de corno, cornos do Brasil, vídeos de corno, comunidade corno, fórum corno, chat corno, encontros corno, casais corno, relacionamentos, adulto conteúdo, rede social adulto, confissões anônimas, desabafos de relacionamento, histórias de traição, comunidade swing, encontros casais, rede social relacionamentos, confissões sexuais, histórias reais, comunidade adulto, fórum de confissões, chat de confissões, rede social confissões, plataforma de confissões, site de confissões, app de confissões, confissões online, desabafos online, comunidade online, rede social brasileira, confissões Brasil, histórias Brasil, relatos Brasil, comunidade Brasil, rede social corno, plataforma corno, site corno, app corno, confissões corno online, desabafos corno online, comunidade corno online, rede social corno Brasil, plataforma corno Brasil, site corno Brasil, app corno Brasil, onde compartilhar confissões de corno, como confessar ser corno, comunidade para cornos, rede social para cornos, plataforma para confissões de corno, site para confissões de corno, app para confissões de corno, confissões de corno anônimas online, desabafos de corno anônimos, histórias reais de cornos, relatos verdadeiros de corno, comunidade de cornos do Brasil, rede social de cornos brasileira, plataforma de confissões para cornos, site de confissões para cornos, app de confissões para cornos" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Confissões de Corno - A Maior Comunidade de Confissões do Brasil | Histórias Reais e Anônimas" />
        <meta property="og:description" content="Confissões de Corno - A maior comunidade de confissões de corno do Brasil. Compartilhe suas histórias anônimas, conheça outras pessoas e encontre apoio na rede social de confissões mais popular do país. Histórias reais de corno, relatos de traição e desabafos anônimos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://confissoesdecorno.com" />
        <meta property="og:image" content="https://confissoesdecorno.com/imgs/logo.png" />
        <meta property="og:site_name" content="Confissões de Corno" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Confissões de Corno - A Maior Comunidade de Confissões do Brasil | Histórias Reais e Anônimas" />
        <meta name="twitter:description" content="Confissões de Corno - A maior comunidade de confissões de corno do Brasil. Compartilhe suas histórias anônimas, conheça outras pessoas e encontre apoio na rede social de confissões mais popular do país. Histórias reais de corno, relatos de traição e desabafos anônimos." />
        <meta name="twitter:image" content="https://confissoesdecorno.com/imgs/logo.png" />
        <meta name="twitter:site" content="@cornosconfissao" />
        <meta name="twitter:creator" content="@cornosconfissao" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://confissoesdecorno.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Confissões de Corno',
              description: 'Confissões de Corno - A maior comunidade de confissões de corno do Brasil. Compartilhe suas histórias anônimas, conheça outras pessoas e encontre apoio na rede social de confissões mais popular do país. Histórias reais de corno, relatos de traição e desabafos anônimos.',
              url: 'https://confissoesdecorno.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://confissoesdecorno.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Confissões de Corno',
                url: 'https://confissoesdecorno.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://confissoesdecorno.com/imgs/logo.png',
                },
              },
              sameAs: [
                'https://x.com/cornos_br',
                'https://www.instagram.com/cornosdobrasil.com.br',
                'https://t.me/SuporteAssinante'
              ],
            }),
          }}
        />
      </Head>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url(/bg.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-20 flex justify-between items-center p-4 md:p-6 lg:p-8 animate-fade-in">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-500 fill-current" />
              <span className="text-white font-bold text-lg md:text-xl">Confissões</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-white hover:text-pink-400 transition-colors duration-200 font-medium">
                Início
              </Link>
              <Link href="/contact" className="text-white hover:text-pink-400 transition-colors duration-200 font-medium">
                Contato
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link 
              href="/register" 
              className="hidden md:block text-white hover:text-pink-400 transition-colors duration-200 font-medium"
            >
              Criar perfil
            </Link>
            <Link 
              href="/login"
              className="bg-white text-black px-4 py-2 md:px-6 md:py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-semibold text-sm md:text-base hover-lift"
            >
              ENTRAR
            </Link>
            {/* Mobile Menu Button - Moved inside nav */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden glass p-2 rounded-lg hover-lift transition-colors ml-2"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <button
                onClick={toggleMobileMenu}
                className="absolute top-4 right-4 text-white hover:text-pink-400 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <Link 
                href="/" 
                onClick={toggleMobileMenu}
                className="text-white text-2xl font-semibold hover:text-pink-400 transition-colors"
              >
                Início
              </Link>
              <Link 
                href="/contact" 
                onClick={toggleMobileMenu}
                className="text-white text-2xl font-semibold hover:text-pink-400 transition-colors"
              >
                Contato
              </Link>
              <Link 
                href="/register" 
                onClick={toggleMobileMenu}
                className="text-white text-2xl font-semibold hover:text-pink-400 transition-colors"
              >
                Criar perfil
              </Link>
              <Link 
                href="/login"
                onClick={toggleMobileMenu}
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-200 transition-colors"
              >
                ENTRAR
              </Link>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-6 lg:px-8 text-center">
          {/* Hero Section */}
          <div className="max-w-6xl mx-auto">
            {/* Logo */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight animate-fade-in-up">
              <span className="bg-gradient-text">
                Confissões
              </span>
              <span className="text-white"> de Corno</span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              A maior comunidade de{' '}
              <span className="text-pink-400 font-semibold">confissões de corno</span> 
              {' '}do Brasil. Compartilhe suas histórias e conheça outras pessoas que passam pela mesma situação.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex flex-col items-center space-y-3 p-4 glass rounded-lg hover-lift">
                <Shield className="w-8 h-8 text-pink-400" />
                <h3 className="text-white font-semibold">100% Anônimo</h3>
                <p className="text-gray-400 text-sm text-center">Suas confissões são totalmente seguras e anônimas</p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-4 glass rounded-lg hover-lift">
                <Users className="w-8 h-8 text-pink-400" />
                <h3 className="text-white font-semibold">Comunidade Ativa</h3>
                <p className="text-gray-400 text-sm text-center">Milhares de usuários compartilhando experiências</p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-4 glass rounded-lg hover-lift">
                <Eye className="w-8 h-8 text-pink-400" />
                <h3 className="text-white font-semibold">Histórias Reais</h3>
                <p className="text-gray-400 text-sm text-center">Confissões autênticas de pessoas reais</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 md:mb-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <Link
                href="/register"
                className="group bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 w-full sm:w-auto justify-center hover-lift"
              >
                <span>CRIAR PERFIL GRÁTIS</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-white hover:text-black transition-all duration-200 w-full sm:w-auto text-center hover-lift"
              >
                ENTRAR
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="relative z-10 absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full px-4 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center max-w-4xl mx-auto">
            <div className="glass rounded-lg p-3 md:p-4 hover-lift">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">+50 mil</div>
              <div className="text-xs md:text-sm text-gray-300">usuários ativos</div>
            </div>
            <div className="glass rounded-lg p-3 md:p-4 hover-lift">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">+10 mil</div>
              <div className="text-xs md:text-sm text-gray-300">confissões publicadas</div>
            </div>
            <div className="glass rounded-lg p-3 md:p-4 hover-lift">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">+100 mil</div>
              <div className="text-xs md:text-sm text-gray-300">mensagens trocadas</div>
            </div>
            <div className="glass rounded-lg p-3 md:p-4 hover-lift">
              <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-xs md:text-sm text-gray-300">suporte online</div>
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="relative z-10 py-16 px-4 md:px-6 lg:px-8 animate-fade-in-up" style={{animationDelay: '1.0s'}}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column */}
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Confissões de Corno - Rede Social de Confissões
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Nossa <strong>rede social de confissões</strong> é a plataforma mais popular do Brasil para compartilhar <strong>confissões de corno</strong> anônimas. 
                  Aqui você encontra uma <strong>comunidade de confissões</strong> ativa e acolhedora, onde milhares de pessoas compartilham 
                  suas <strong>histórias de corno</strong> de forma segura e anônima.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Como <strong>rede social de sexo</strong> e <strong>rede social swing</strong>, oferecemos um espaço único para 
                  casais e indivíduos que buscam compartilhar suas <strong>confissões anônimas</strong> e conhecer pessoas com interesses similares.
                  Nossa <strong>plataforma de confissões</strong> é líder no Brasil para <strong>relatos de traição</strong> e <strong>desabafos de corno</strong>.
                </p>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                  Comunidade de Confissões de Corno
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Nossa <strong>comunidade de confissões</strong> é composta por pessoas reais que compartilham 
                  <strong>histórias reais de corno</strong> e <strong>relatos de traição</strong> de forma anônima. 
                  Aqui você encontra apoio e compreensão de quem já passou por situações similares.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Como <strong>plataforma de confissões</strong> líder no Brasil, garantimos total privacidade 
                  e segurança para que você possa compartilhar suas <strong>confissões anônimas de corno</strong> sem medo.
                  Nossa <strong>rede social para cornos</strong> é o lugar ideal para <strong>desabafos de corno</strong>.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-lg p-6 hover-lift">
                <h4 className="text-lg font-semibold text-white mb-3">Confissões Anônimas de Corno</h4>
                <p className="text-gray-400 text-sm">
                  Compartilhe suas <strong>confissões de corno</strong> de forma totalmente anônima e segura.
                  Nossa <strong>plataforma para confissões de corno</strong> garante sua privacidade.
                </p>
              </div>
              <div className="glass rounded-lg p-6 hover-lift">
                <h4 className="text-lg font-semibold text-white mb-3">Rede Social Adulto</h4>
                <p className="text-gray-400 text-sm">
                  Nossa <strong>rede social adulto</strong> oferece um espaço maduro para discussões e encontros.
                  <strong>Site para confissões de corno</strong> mais popular do Brasil.
                </p>
              </div>
              <div className="glass rounded-lg p-6 hover-lift">
                <h4 className="text-lg font-semibold text-white mb-3">Comunidade Swing</h4>
                <p className="text-gray-400 text-sm">
                  Conecte-se com a <strong>comunidade swing</strong> e encontre casais com interesses similares.
                  <strong>App para confissões de corno</strong> com recursos avançados.
                </p>
              </div>
            </div>

            {/* Additional SEO Content */}
            <div className="mt-12 space-y-6">
              <h3 className="text-2xl font-bold text-white text-center mb-8">
                Por que escolher Confissões de Corno?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Histórias Reais de Corno</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Nossa <strong>comunidade de cornos do Brasil</strong> compartilha <strong>histórias reais de corno</strong> 
                    e <strong>relatos verdadeiros de corno</strong>. Aqui você encontra <strong>confissões de corno real</strong> 
                    de pessoas que passaram por situações similares às suas.
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Como <strong>rede social de cornos brasileira</strong>, oferecemos um espaço seguro para 
                    <strong>desabafos de corno anônimos</strong> e <strong>confissões de corno anônimas online</strong>.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Plataforma Completa</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Nossa <strong>plataforma de confissões para cornos</strong> oferece recursos completos: 
                    chat, fotos, vídeos e muito mais. <strong>Onde compartilhar confissões de corno</strong> 
                    de forma segura e anônima.
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    <strong>Como confessar ser corno</strong> de forma anônima? Aqui você aprende e encontra 
                    apoio na <strong>comunidade para cornos</strong> mais ativa do Brasil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 