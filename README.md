# Bazar Do Alemão — Landing Page

Landing page estática para o [Bazar Do Alemão](https://www.instagram.com/bazar_doalemao/) (@bazar_doalemao), São Sebastião, Porto Alegre.

## Rodar localmente

```bash
cd bazar_do_alemao
python3 -m http.server 8080
```

Abra [http://localhost:8080](http://localhost:8080).

## Dados da loja

| Campo | Valor |
|-------|--------|
| Endereço | Av. Baltazar de Oliveira Garcia, 2713 — São Sebastião, Porto Alegre/RS |
| CEP | 91150-000 |
| Horários | Seg–sáb 9h–20h · Dom e feriados 9h–17h30 |
| WhatsApp | (51) 98133-5930 — [wa.me/5551981335930](https://wa.me/5551981335930) |
| Instagram | [@bazar_doalemao](https://www.instagram.com/bazar_doalemao/) |

## Encarte em PDF

- Arquivo: `assets/catalogo/encarte-semana.pdf`
- Metadados: `assets/catalogo.json` (tamanho, data, nome do download)
- Regenerar PDF padrão (substitua pelo encarte real do cliente quando tiver):

```bash
python3 scripts/generate_encarte_pdf.py
```

Para usar um PDF feito no Canva/Word, substitua `assets/catalogo/encarte-semana.pdf` e atualize `catalogo.json` (`tamanhoKb`, `atualizadoEm`).

## Depoimentos (Google)

Edite os textos em [`assets/depoimentos.json`](assets/depoimentos.json). A seção aparece em `#depoimentos` no site.

## Ofertas, WhatsApp e QR Code

- **Ofertas da semana:** edite [`assets/ofertas.json`](assets/ofertas.json) (título, imagem, texto do WhatsApp).
- **Mensagens WhatsApp:** edite os textos em [`js/main.js`](js/main.js) (`WHATSAPP_INTENTS`).
- **Link do site / Google:** edite [`assets/site-config.json`](assets/site-config.json) (`siteUrl`, `googleReviewUrl`).
- **Regenerar QR Code** após mudar a URL do site:

```bash
python3 scripts/generate_qr.py
# ou: python3 scripts/generate_qr.py https://seu-dominio.com.br
```

Arquivo gerado: `assets/images/qr-site.png` (imprimir para vitrine).

## SEO

- **Meta tags e Open Graph** em `index.html` (título, descrição, Twitter Card, geo).
- **JSON-LD** (`Store` + `LocalBusiness` + `WebSite` + `WebPage`) — URLs absolutas aplicadas via `js/main.js` quando o site roda em HTTP(S).
- **`assets/site-config.json`:** defina `canonicalUrl` com o domínio final (ex.: `https://bazardoalemao.com.br/`). Enquanto vazio, o canonical usa `/` e, no servidor local, a origem atual.
- **`robots.txt`** e **`sitemap.xml`:** ao publicar, troque `https://seudominio.com.br/` no sitemap e descomente a linha `Sitemap:` no `robots.txt`.
- Validar: [Rich Results Test](https://search.google.com/test/rich-results), [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

## Checklist antes do deploy

- [x] Galeria com 6 posts recentes em `assets/images/instagram/` (ver atualização abaixo)
- [x] Logo em `assets/images/logo.png` com fundo transparente (backup em `logo.backup.png`)
- [x] Meta description, Open Graph, Twitter Card e JSON-LD local
- [x] Atualizar `canonicalUrl` e `siteUrl` em `assets/site-config.json` e rodar `python3 scripts/generate_qr.py`
- [x] Atualizar `sitemap.xml` e `robots.txt` com o domínio publicado (`https://bazar-do-alemao.netlify.app/`)
- [ ] Colar `googleReviewUrl` com link direto de avaliação (Google Meu Negócio), se disponível — use o link “Pedir avaliações” do perfil ou `https://search.google.com/local/writereview?placeid=...`
- [ ] Validar pin no Google Maps com o endereço exato
- [ ] Atualizar contagem de seguidores no hero, se necessário

## Estrutura

```
index.html      Página principal + JSON-LD (Store / LocalBusiness)
robots.txt      Instruções para crawlers
sitemap.xml     Mapa do site (atualizar URL ao publicar)
css/styles.css  Estilos mobile-first
js/main.js      Menu, WhatsApp, status aberto/fechado
assets/images/  Fotos da loja (a adicionar)
assets/icons/   favicon.svg
```

## Atualizar fotos do Instagram

As imagens em `assets/images/instagram/` foram baixadas das publicações mais recentes de @bazar_doalemao. Para atualizar no futuro, use a API pública do Instagram (perfil público):

```bash
python3 scripts/download_instagram.py
```

Depois atualize os links `/p/SHORTCODE/` em `index.html` conforme `assets/instagram-posts.json`.

## Deploy

Envie a pasta inteira para qualquer host estático (Netlify, Vercel, GitHub Pages, servidor Apache/Nginx).
