export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
};

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "como-funciona-um-pedido",
    title: "Como funciona um pedido",
    summary: "Do carrinho até a entrega na sua porta.",
    body: [
      "Escolha um restaurante, monte seu pedido e finalize o pagamento por Pix ou cartão.",
      "O restaurante confirma o pedido e começa o preparo. Você acompanha cada etapa em tempo real na página do pedido, em Minha conta > Pedidos.",
      "Quando o pedido fica pronto, um entregador é acionado para buscar e levar até você.",
      "Depois da entrega, avalie o restaurante e o entregador — isso ajuda outros clientes a escolher melhor.",
    ],
  },
  {
    slug: "pagamentos",
    title: "Formas de pagamento",
    summary: "Pix e cartão, processados com segurança pelo Mercado Pago ou Stripe.",
    body: [
      "O Box2eat não guarda os dados do seu cartão. Cada pagamento acontece direto na página segura do Mercado Pago ou do Stripe.",
      "Se o pagamento falhar, você pode tentar novamente pela própria página do pedido, sem precisar refazer o carrinho.",
    ],
  },
  {
    slug: "cancelamentos-e-reembolsos",
    title: "Cancelamentos e reembolsos",
    summary: "Quando dá para cancelar e como pedir reembolso.",
    body: [
      "Um pedido pode ser cancelado enquanto ainda não foi aceito pelo restaurante, direto na página do pedido.",
      "Depois de aceito, o cancelamento depende do restaurante — fale com ele pela página do pedido.",
      "Se algo deu errado com um pedido já entregue (item errado, item faltando, qualidade), você pode reclamar e pedir reembolso pela página do pedido, em Minha conta > Pedidos.",
    ],
  },
  {
    slug: "taxas-de-entrega",
    title: "Taxas de entrega",
    summary: "Como a taxa de entrega é calculada.",
    body: [
      "Cada restaurante define sua própria taxa de entrega e o pedido mínimo, com base na distância até você.",
      "A taxa aparece no carrinho antes de você finalizar o pedido, sem surpresas no checkout.",
    ],
  },
  {
    slug: "sou-um-restaurante",
    title: "Quero vender no Box2eat",
    summary: "Como cadastrar seu restaurante na plataforma.",
    body: [
      "Crie uma conta restaurante em Menu > Criar uma conta Restaurante e cadastre seu cardápio.",
      "Assim que seu restaurante for criado, ele já fica visível para os clientes — sem espera de aprovação.",
      "Conecte o Mercado Pago ou o Stripe para começar a receber pelos pedidos.",
    ],
  },
  {
    slug: "sou-entregador",
    title: "Quero fazer entregas",
    summary: "Como se cadastrar como entregador.",
    body: [
      "Cadastre-se em Menu > Registrar-se para fazer entregas, enviando seus documentos.",
      "Depois da aprovação, você já pode ficar online e aceitar entregas disponíveis perto de você.",
    ],
  },
];

export function getHelpArticle(slug: string) {
  return HELP_ARTICLES.find((article) => article.slug === slug) ?? null;
}
