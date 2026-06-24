import crypto from "crypto";

import { db } from ".";
import { categoryTable, productTable, productVariantTable } from "./schema";

// Mapeamento produto → variante → [URL da imagem]
// Usamos fotos do Unsplash por ID fixo para garantir que os links permaneçam válidos.
const productImages = {
  "Notebook Gamer Pro": {
    Preto: [
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
    ],
    Cinza: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    ],
  },
  "Notebook Ultrafino": {
    Prata: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
    ],
    Preto: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    ],
  },
  'Monitor 27" Full HD': {
    Preto: [
      "https://images.unsplash.com/photo-1527443224154-c4a573d5a05c?w=600&q=80",
    ],
    Branco: [
      "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&q=80",
    ],
  },
  "Monitor Gamer 144Hz": {
    Preto: [
      "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&q=80",
    ],
  },
  "Processador Intel Core i9": {
    Padrão: [
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80",
    ],
  },
  "Placa de Vídeo RTX 4070 Ti": {
    Padrão: [
      "https://images.unsplash.com/photo-1587202372583-49330a15584d?w=600&q=80",
    ],
  },
  "Memória RAM DDR5 32GB": {
    Padrão: [
      "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&q=80",
    ],
  },
  "SSD NVMe 1TB": {
    Padrão: [
      "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600&q=80",
    ],
  },
  "Teclado Mecânico RGB": {
    Preto: [
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",
    ],
    Branco: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    ],
  },
  "Mouse Gamer Pro": {
    Preto: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80",
    ],
    Branco: [
      "https://images.unsplash.com/photo-1623949556303-b0d17d198473?w=600&q=80",
    ],
  },
  "Headset Gamer 7.1": {
    Preto: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    ],
    Vermelho: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
    ],
  },
  "Webcam Full HD 1080p": {
    Preto: [
      "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&q=80",
    ],
    Branco: [
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&q=80",
    ],
  },
  "Formatação e Reinstalação do SO": {
    Padrão: [
      "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=600&q=80",
    ],
  },
  "Manutenção Preventiva": {
    Padrão: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    ],
  },
  "Troca de Pasta Térmica": {
    Padrão: [
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80",
    ],
  },
  "Diagnóstico Técnico": {
    Padrão: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
    ],
  },
};

// Gera um slug amigável para URLs a partir de um nome (ex: "Notebook Gamer Pro" → "notebook-gamer-pro")
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

// ──────────────────────────────────────────────
// CATEGORIAS
// ──────────────────────────────────────────────
const categories = [
  {
    name: "Equipamentos",
    description: "Notebooks, monitores e computadores completos",
  },
  {
    name: "Peças",
    description: "Processadores, placas de vídeo, memórias e armazenamento",
  },
  {
    name: "Periféricos",
    description: "Teclados, mouses, headsets e webcams",
  },
  {
    name: "Serviços",
    description: "Formatação, manutenção preventiva e suporte técnico",
  },
];

// ──────────────────────────────────────────────
// PRODUTOS
// ──────────────────────────────────────────────
// Preços em centavos (ex: 499999 = R$ 4.999,99)
const products = [
  // ── Equipamentos ──────────────────────────
  {
    name: "Notebook Gamer Pro",
    description:
      "Notebook gamer de alta performance com processador Intel Core i7, placa RTX 4060, 16 GB RAM e SSD NVMe de 512 GB. Ideal para jogos e trabalhos pesados.",
    categoryName: "Equipamentos",
    variants: [
      { color: "Preto", price: 499999 },
      { color: "Cinza", price: 499999 },
    ],
  },
  {
    name: "Notebook Ultrafino",
    description:
      "Notebook ultrafino com design elegante, tela Full HD de 14 polegadas, bateria de longa duração e apenas 1,3 kg. Perfeito para produtividade em movimento.",
    categoryName: "Equipamentos",
    variants: [
      { color: "Prata", price: 349999 },
      { color: "Preto", price: 349999 },
    ],
  },
  {
    name: 'Monitor 27" Full HD',
    description:
      'Monitor de 27 polegadas Full HD (1920x1080) com painel IPS, 75 Hz, tempo de resposta de 5 ms e bordas ultrafinas. Ótima fidelidade de cores para trabalho e entretenimento.',
    categoryName: "Equipamentos",
    variants: [
      { color: "Preto", price: 129999 },
      { color: "Branco", price: 129999 },
    ],
  },
  {
    name: "Monitor Gamer 144Hz",
    description:
      "Monitor gamer de 27 polegadas com taxa de atualização de 144 Hz, painel VA 1 ms e compatibilidade com FreeSync. Elimina o tearing e proporciona fluidez máxima em jogos.",
    categoryName: "Equipamentos",
    variants: [{ color: "Preto", price: 189999 }],
  },

  // ── Peças ─────────────────────────────────
  {
    name: "Processador Intel Core i9",
    description:
      "Processador Intel Core i9-14900K de 14ª geração com 24 núcleos (8P + 16E), frequência turbo de até 6,0 GHz. O CPU mais potente para workstations e gaming extremo.",
    categoryName: "Peças",
    variants: [{ color: "Padrão", price: 249999 }],
  },
  {
    name: "Placa de Vídeo RTX 4070 Ti",
    description:
      "Placa de vídeo NVIDIA GeForce RTX 4070 Ti com 12 GB GDDR6X, suporte a Ray Tracing e DLSS 3. Render em 4K e gaming a 1440p com framerates elevados.",
    categoryName: "Peças",
    variants: [{ color: "Padrão", price: 429999 }],
  },
  {
    name: "Memória RAM DDR5 32GB",
    description:
      "Kit de memória DDR5 32 GB (2×16 GB) com velocidade de 5600 MHz e latência CL36. Compatible com plataformas Intel e AMD de última geração.",
    categoryName: "Peças",
    variants: [{ color: "Padrão", price: 79999 }],
  },
  {
    name: "SSD NVMe 1TB",
    description:
      "SSD NVMe PCIe 4.0 de 1 TB com leitura sequencial de até 7.000 MB/s. Inicialização do sistema em segundos e carregamento de jogos sem esperas.",
    categoryName: "Peças",
    variants: [{ color: "Padrão", price: 49999 }],
  },

  // ── Periféricos ───────────────────────────
  {
    name: "Teclado Mecânico RGB",
    description:
      "Teclado mecânico compacto TKL com switches Red (linear), iluminação RGB por tecla e construção em alumínio. Resposta precisa para gaming e digitação intensa.",
    categoryName: "Periféricos",
    variants: [
      { color: "Preto", price: 39999 },
      { color: "Branco", price: 39999 },
    ],
  },
  {
    name: "Mouse Gamer Pro",
    description:
      "Mouse gamer com sensor óptico de 25.600 DPI, 8 botões programáveis, iluminação RGB e design ergonômico. Controle total em qualquer superfície.",
    categoryName: "Periféricos",
    variants: [
      { color: "Preto", price: 29999 },
      { color: "Branco", price: 29999 },
    ],
  },
  {
    name: "Headset Gamer 7.1",
    description:
      "Headset gamer com áudio surround virtual 7.1, drivers de 50 mm, microfone com cancelamento de ruído e almofadas de espuma com memória. Imersão total no jogo.",
    categoryName: "Periféricos",
    variants: [
      { color: "Preto", price: 34999 },
      { color: "Vermelho", price: 34999 },
    ],
  },
  {
    name: "Webcam Full HD 1080p",
    description:
      "Webcam Full HD 1080p a 30 fps com microfone estéreo integrado, correção automática de iluminação e ângulo de visão de 90°. Ideal para reuniões e streaming.",
    categoryName: "Periféricos",
    variants: [
      { color: "Preto", price: 27999 },
      { color: "Branco", price: 27999 },
    ],
  },

  // ── Serviços ──────────────────────────────
  {
    name: "Formatação e Reinstalação do SO",
    description:
      "Formatação completa do computador com reinstalação do sistema operacional Windows ou Linux, atualização de drivers e configuração inicial. Entrega em até 24 horas.",
    categoryName: "Serviços",
    variants: [{ color: "Padrão", price: 14999 }],
  },
  {
    name: "Manutenção Preventiva",
    description:
      "Limpeza interna do hardware, verificação de temperatura, troca de pasta térmica, atualização do sistema e backup de dados. Prolonga a vida útil do equipamento.",
    categoryName: "Serviços",
    variants: [{ color: "Padrão", price: 19999 }],
  },
  {
    name: "Troca de Pasta Térmica",
    description:
      "Remoção da pasta antiga, limpeza do dissipador e aplicação de pasta térmica de alta performance. Reduz a temperatura do processador em até 15°C.",
    categoryName: "Serviços",
    variants: [{ color: "Padrão", price: 8999 }],
  },
  {
    name: "Diagnóstico Técnico",
    description:
      "Análise completa de hardware e software para identificação de falhas, travamentos, superaquecimento e outros problemas. Relatório detalhado ao final.",
    categoryName: "Serviços",
    variants: [{ color: "Padrão", price: 6999 }],
  },
];

async function main() {
  console.log("🌱 Iniciando o seeding do banco de dados...");

  try {
    // 1. Limpar dados existentes (ordem inversa para respeitar as FK)
    console.log("🧹 Limpando dados existentes...");
    await db.delete(productVariantTable);
    await db.delete(productTable);
    await db.delete(categoryTable);
    console.log("✅ Dados limpos com sucesso!");

    // 2. Inserir categorias e guardar o ID de cada uma em um Map
    const categoryMap = new Map<string, string>();

    console.log("📂 Criando categorias...");
    for (const categoryData of categories) {
      const categoryId = crypto.randomUUID();
      const categorySlug = generateSlug(categoryData.name);

      console.log(`  📁 Criando categoria: ${categoryData.name}`);

      await db.insert(categoryTable).values({
        id: categoryId,
        name: categoryData.name,
        slug: categorySlug,
      });

      categoryMap.set(categoryData.name, categoryId);
    }

    // 3. Inserir produtos e suas variantes
    for (const productData of products) {
      const productId = crypto.randomUUID();
      const productSlug = generateSlug(productData.name);
      const categoryId = categoryMap.get(productData.categoryName);

      if (!categoryId) {
        throw new Error(
          `Categoria "${productData.categoryName}" não encontrada`,
        );
      }

      console.log(`📦 Criando produto: ${productData.name}`);

      await db.insert(productTable).values({
        id: productId,
        name: productData.name,
        slug: productSlug,
        description: productData.description,
        categoryId: categoryId,
      });

      // Cada variante representa uma cor/configuração diferente do produto
      for (const variantData of productData.variants) {
        const variantId = crypto.randomUUID();
        const productKey = productData.name as keyof typeof productImages;
        const variantImages =
          productImages[productKey]?.[
            variantData.color as keyof (typeof productImages)[typeof productKey]
          ] || [];

        console.log(`  🎨 Criando variante: ${variantData.color}`);

        await db.insert(productVariantTable).values({
          id: variantId,
          name: variantData.color,
          productId: productId,
          color: variantData.color,
          imageUrl: variantImages[0] || "",
          priceInCents: variantData.price,
          slug: generateSlug(`${productData.name}-${variantData.color}`),
        });
      }
    }

    console.log("✅ Seeding concluído com sucesso!");
    console.log(
      `📊 Foram criadas ${categories.length} categorias, ${
        products.length
      } produtos com ${products.reduce(
        (acc, p) => acc + p.variants.length,
        0,
      )} variantes.`,
    );
  } catch (error) {
    console.error("❌ Erro durante o seeding:", error);
    throw error;
  }
}

main().catch(console.error);
