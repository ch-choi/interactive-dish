export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    collection: string;
    collectionId: string; // New field for linking to collection context
    dimensions: string;
    material: string;
    relatedIds: number[]; // New field for the "Collection Strip"
}

export const PRODUCTS: Record<string, Product> = {
    '/palmer_dinnerware/Antigo_20Creme_20Plate_2028-p-500.webp': {
        id: 1,
        name: 'Antigo Creme Plate 28cm',
        description: 'Robust and earthy stoneware with a creamy finish. Perfect for everyday use with a touch of elegance.',
        price: '$42.00',
        collection: 'Antigo',
        collectionId: 'antigo',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: [2]
    },
    '/palmer_dinnerware/Antigo_20blue_20Plate_2028-p-500.webp': {
        id: 2,
        name: 'Antigo Blue Plate 28cm',
        description: 'Deep blue hues on robust stoneware. The Antigo collection brings a raw, authentic touch to the table.',
        price: '$42.00',
        collection: 'Antigo',
        collectionId: 'antigo',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: [1]
    },
    '/palmer_dinnerware/Barolo_20Plate_2028-p-500.webp': {
        id: 3,
        name: 'Barolo Plate 28cm',
        description: 'Soft rustic shapes in a gentle, refreshing blue. Hints of warm beige inspire cosy dining moments.',
        price: '$45.00',
        collection: 'Barolo',
        collectionId: 'barolo',
        dimensions: 'Ø 28 cm',
        material: 'Earthenware',
        relatedIds: []
    },
    '/palmer_dinnerware/Bowl_2012-p-500.webp': {
        id: 4,
        name: 'Classic Bowl 12cm',
        description: 'A versatile bowl for everyday needs. Simple, elegant, and durable.',
        price: '$18.00',
        collection: 'Essentials',
        collectionId: 'essentials',
        dimensions: 'Ø 12 cm',
        material: 'Porcelain',
        relatedIds: [16]
    },
    '/palmer_dinnerware/Cecil_20Plate_2027-p-500.webp': {
        id: 5,
        name: 'Cecil Plate 27cm',
        description: 'Understated elegance with a modern edge. The Cecil plate helps your culinary creations stand out.',
        price: '$38.00',
        collection: 'Cecil',
        collectionId: 'cecil',
        dimensions: 'Ø 27 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Coco_20green_20plate_2026-p-500.webp': {
        id: 6,
        name: 'Coco Green Plate 26cm',
        description: 'Vibrant green tones inspired by nature. Adds a fresh pop of color to any table setting.',
        price: '$34.00',
        collection: 'Coco',
        collectionId: 'coco',
        dimensions: 'Ø 26 cm',
        material: 'Stoneware',
        relatedIds: [7]
    },
    '/palmer_dinnerware/Coco_20pink_20plate_2026-p-500.webp': {
        id: 7,
        name: 'Coco Pink Plate 26cm',
        description: 'Soft pink hues that bring warmth and playfulness. A delightful canvas for your desserts or mains.',
        price: '$34.00',
        collection: 'Coco',
        collectionId: 'coco',
        dimensions: 'Ø 26 cm',
        material: 'Stoneware',
        relatedIds: [6]
    },
    '/palmer_dinnerware/Eccentric_20plate_2028-p-500.webp': {
        id: 8,
        name: 'Eccentric Plate 28cm',
        description: 'Unique texturing and an artistic form make this plate truly eccentric. For valid artistic expression.',
        price: '$48.00',
        collection: 'Eccentric',
        collectionId: 'eccentric',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Houston_20plate_2028cm-p-500.webp': {
        id: 9,
        name: 'Houston Plate 28cm',
        description: 'Darkly sophisticated blue interaction. No two plates in this unique collection are exactly the same.',
        price: '$42.00',
        collection: 'Houston',
        collectionId: 'houston',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Jory_20Plate_2028-p-500.webp': {
        id: 10,
        name: 'Jory Plate 28cm',
        description: 'Classic design reimagined. The Jory plate offers a timeless look with modern durability.',
        price: '$36.00',
        collection: 'Jory',
        collectionId: 'jory',
        dimensions: 'Ø 28 cm',
        material: 'Porcelain',
        relatedIds: []
    },
    '/palmer_dinnerware/Kiryu_20Plate_2027_2C5-p-500.webp': {
        id: 11,
        name: 'Kiryu Plate 27.5cm',
        description: 'Deep blue glaze with soft forms. Perfectly finished porcelain, the product of centuries of Japanese craftsmanship.',
        price: '$34.00',
        collection: 'Kiryu',
        collectionId: 'kiryu',
        dimensions: 'Ø 27.5 cm',
        material: 'Porcelain',
        relatedIds: []
    },
    '/palmer_dinnerware/Light_20Blue_20Sea_20Plate_2028-p-500.webp': {
        id: 12,
        name: 'Light Blue Sea Plate 28cm',
        description: 'Reminiscent of calm coastal waters. This plate brings a serene vibe to your dining experience.',
        price: '$40.00',
        collection: 'Sea',
        collectionId: 'sea',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Lotus_20Plate_2027_2C5-p-500.webp': {
        id: 13,
        name: 'Lotus Plate 27.5cm',
        description: 'Inspired by the purity of the lotus flower. Elegant, simple, and timeless.',
        price: '$28.00',
        collection: 'Lotus',
        collectionId: 'lotus',
        dimensions: 'Ø 27.5 cm',
        material: 'Porcelain',
        relatedIds: []
    },
    '/palmer_dinnerware/Miami_20Plate_2028-p-500.webp': {
        id: 14,
        name: 'Miami Plate 28cm',
        description: 'Refreshing aquatic colouring. As inviting as the ocean on a summer day.',
        price: '$30.00',
        collection: 'Miami',
        collectionId: 'miami',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Midori_20Plate_2025_2C5-p-500.webp': {
        id: 15,
        name: 'Midori Plate 25.5cm',
        description: 'Earthy greens and natural textures. The Midori plate connects your meal to nature.',
        price: '$32.00',
        collection: 'Midori',
        collectionId: 'midori',
        dimensions: 'Ø 25.5 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Oval_20Plate_2020_2C5-p-500.webp': {
        id: 16,
        name: 'Oval Plate 20.5cm',
        description: 'A distinct oval shape perfect for serving side dishes or unique presentations.',
        price: '$26.00',
        collection: 'Essentials',
        collectionId: 'essentials',
        dimensions: '20.5 cm',
        material: 'Porcelain',
        relatedIds: [4]
    },
    '/palmer_dinnerware/Plate_2027_2C5-1-p-500.webp': {
        id: 17,
        name: 'Chef Plate 27.5cm',
        description: 'Professional grade porcelain designed for the most demanding culinary environments.',
        price: '$22.00',
        collection: 'Chef',
        collectionId: 'chef',
        dimensions: 'Ø 27.5 cm',
        material: 'Porcelain',
        relatedIds: []
    },
    '/palmer_dinnerware/Ruston_20Plate_2027-p-500.webp': {
        id: 18,
        name: 'Ruston Plate 27cm',
        description: 'Metallic, oxidized notes create a bold, industrial yet warm aesthetic.',
        price: '$46.00',
        collection: 'Ruston',
        collectionId: 'ruston',
        dimensions: 'Ø 27 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Sandy_20Loam_20Blue_20Plate_2028-p-500.webp': {
        id: 19,
        name: 'Sandy Loam Blue Plate 28cm',
        description: 'A harmonious blend of sandy textures and cool blue tones. Rustic charm meets modern design.',
        price: '$44.00',
        collection: 'Loam',
        collectionId: 'loam',
        dimensions: 'Ø 28 cm',
        material: 'Stoneware',
        relatedIds: []
    },
    '/palmer_dinnerware/Wisteria_20Plate_2028_2C5-p-500.webp': {
        id: 20,
        name: 'Wisteria Plate 28.5cm',
        description: 'Delicate floral undertones in a durable form. Adds a touch of romance to the table.',
        price: '$38.00',
        collection: 'Wisteria',
        collectionId: 'wisteria',
        dimensions: 'Ø 28.5 cm',
        material: 'Stoneware',
        relatedIds: []
    }
};

export const getProductBySrc = (src: string): Product | undefined => {
    return PRODUCTS[src];
};

export interface Collection {
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    heroImage: string;
    specs: {
        products: number;
        material: string;
        color: string;
    };
    moodImages: string[];
}

export const COLLECTIONS: Record<string, Collection> = {
    'barolo': {
        slug: 'barolo',
        title: 'Barolo',
        subtitle: 'Soft rustic shapes in a gentle, refreshing blue with tantalising hints of warm beige inspire cosy times.',
        description: 'The subtle curves and soft tones create a calming atmosphere, perfect for intimate meals or relaxed gatherings. Each piece in the Barolo collection is crafted to bring a sense of serenity to your table.',
        heroImage: '/products/generated_plate_1.png',
        specs: {
            products: 7,
            material: 'Stoneware',
            color: 'Blue'
        },
        moodImages: [
            '/products/plate5.png',
            '/products/generated_plate_6.png'
        ]
    },
    'kiryu': {
        slug: 'kiryu',
        title: 'Kiryu',
        subtitle: 'The product of centuries of Japanese craftsmanship. As delicate as it is strong.',
        description: 'Deep blue glaze with soft forms. Perfectly finished porcelain from the heart of Japan.',
        heroImage: '/products/plate1.png',
        specs: {
            products: 5,
            material: 'Porcelain',
            color: 'Deep Blue'
        },
        moodImages: [
            '/products/plate2.png',
            '/products/kiryu-bowl-15.webp'
        ]
    },
    'houston': {
        slug: 'houston',
        title: 'Houston',
        subtitle: 'Darkly sophisticated blue interaction. No two items are exactly the same.',
        description: 'A robust stoneware collection with a handcrafted, personal feel. Versatile yet distinct.',
        heroImage: '/products/plate3.png',
        specs: {
            products: 4,
            material: 'Stoneware',
            color: 'Blue / Black'
        },
        moodImages: [
            '/products/plate4.png',
            '/products/houston-saucer-155.webp'
        ]
    },
    'lotus': {
        slug: 'lotus',
        title: 'Lotus',
        subtitle: 'Inspired by the purity of the lotus flower. Elegant, simple, and timeless.',
        description: 'Clean lines and pure white porcelain make the Lotus collection a classic choice for any table.',
        heroImage: '/products/plate7.png',
        specs: {
            products: 3,
            material: 'Porcelain',
            color: 'White'
        },
        moodImages: [
            '/products/plate7.png'
        ]
    }
};

export const getAllCollections = () => Object.values(COLLECTIONS);
