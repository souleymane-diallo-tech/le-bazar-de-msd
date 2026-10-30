export const demoProducts = [
  {
    key: "distributeur",
    name: "Distributeur de savon",
    category: "Salle de bain",
    categorySlug: "salle-de-bain",
    image: "/images/distributeur.jpg",
    description:
      "Un distributeur au design épuré pour accompagner vos gestes du quotidien. Visuel fourni comme référence ; dimensions, capacité et accessoires à confirmer avant commercialisation.",
    variants: [{ key: "blanc", label: "Blanc", price: 12500, stock: 8 }],
  },
  {
    key: "rangements",
    name: "Rangements muraux",
    category: "Salle de bain",
    categorySlug: "salle-de-bain",
    image: "/images/maison.jpg",
    description:
      "Une place pour chaque essentiel dans la salle de bain. Visuel fourni comme référence ; composition du lot, dimensions et mode de fixation à confirmer.",
    variants: [{ key: "noir", label: "Noir", price: 15000, stock: 5 }],
  },
  {
    key: "ventilateur",
    name: "Ventilateur portable",
    category: "Gadgets du quotidien",
    categorySlug: "gadgets",
    image: "/images/ventilateur.jpg",
    description:
      "Un format portable à emporter dans vos déplacements. Visuel fourni comme référence ; autonomie, modes et caractéristiques techniques à confirmer.",
    variants: [
      { key: "argent", label: "Argent", price: 9500, stock: 12 },
      {
        key: "argent-reserve",
        label: "Argent · lot épuisé (test)",
        price: 9500,
        stock: 0,
      },
    ],
  },
  {
    key: "horloge",
    name: "Horloge numérique",
    category: "Maison & décoration",
    categorySlug: "maison",
    image: "/images/horloge.jpg",
    description:
      "Une présence lumineuse dans votre intérieur. Visuel fourni comme référence ; dimensions, alimentation et fonctions à confirmer avant commercialisation.",
    variants: [{ key: "noir", label: "Noir", price: 18000, stock: 4 }],
  },
] as const;
