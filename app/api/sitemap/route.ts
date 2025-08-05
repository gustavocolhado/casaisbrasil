import { NextResponse } from 'next/server'
import { siteConfig } from '@/lib/seo'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const baseUrl = siteConfig.url
    const currentDate = new Date().toISOString()

    // Buscar usuários aprovados (limitando para não sobrecarregar)
    const users = await prisma.user.findMany({
      where: {
        // Apenas usuários com username válido
        username: {
          not: ''
        },
        // Excluir usuários deletados ou inativos
        email: {
          not: ''
        }
      },
      select: {
        username: true,
        lastSeen: true
      },
      take: 1000, // Limitar a 1000 usuários para não sobrecarregar o sitemap
      orderBy: {
        lastSeen: 'desc'
      }
    })

    // Buscar posts aprovados
    const posts = await prisma.post.findMany({
      where: {
        approved: true,
        // Excluir posts com falha
        failed: {
          not: true
        }
      },
      select: {
        id: true,
        url: true,
        updated_at: true
      },
      take: 1000, // Limitar a 1000 posts
      orderBy: {
        updated_at: 'desc'
      }
    })

    // Gerar URLs para páginas estáticas
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/home', priority: '0.9', changefreq: 'daily' },
      { url: '/search', priority: '0.8', changefreq: 'daily' },
      { url: '/premium', priority: '0.7', changefreq: 'weekly' },
      { url: '/recommendations', priority: '0.7', changefreq: 'daily' },
      { url: '/online', priority: '0.6', changefreq: 'hourly' },
      { url: '/notifications', priority: '0.6', changefreq: 'hourly' },
      { url: '/chat', priority: '0.6', changefreq: 'daily' },
      { url: '/friends', priority: '0.6', changefreq: 'daily' },
      { url: '/visits', priority: '0.5', changefreq: 'daily' },
      { url: '/my-photos', priority: '0.5', changefreq: 'weekly' },
      { url: '/publish', priority: '0.7', changefreq: 'daily' },
      { url: '/settings', priority: '0.4', changefreq: 'weekly' },
      { url: '/login', priority: '0.3', changefreq: 'monthly' },
      { url: '/register', priority: '0.3', changefreq: 'monthly' }
    ]

    // Construir o sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Adicionar páginas estáticas
    for (const page of staticPages) {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    }

    // Adicionar usuários
    for (const user of users) {
      const lastmod = user.lastSeen ? user.lastSeen.toISOString() : currentDate
      sitemap += `
  <url>
    <loc>${baseUrl}/${user.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    }

    // Adicionar posts
    for (const post of posts) {
      const lastmod = post.updated_at ? post.updated_at.toISOString() : currentDate
      sitemap += `
  <url>
    <loc>${baseUrl}/post/${post.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    }

    sitemap += `
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error)
    
    // Fallback: sitemap básico em caso de erro
    const baseUrl = siteConfig.url
    const currentDate = new Date().toISOString()
    
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/home</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/premium</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }
} 