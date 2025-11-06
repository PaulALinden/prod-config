// backend/src/models/Product.js
export class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.description = data.description;
        this.price = data.price;
        this.image = data.image;
        this.categories = data.categories;
    }

    static fromWooCommerce(wcProduct) {
        return new Product({
            id: wcProduct.id,
            name: wcProduct.name,
            slug: wcProduct.slug,
            description: wcProduct.description || wcProduct.short_description || '',
            price: parseFloat(wcProduct.price),
            image: wcProduct.images?.[0]?.src || null,
            categories: wcProduct.categories.map(cat => cat.slug)
        });
    }
}