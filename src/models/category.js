// backend/src/models/category.js
export class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slug = data.slug;
        this.count = data.count;
    }

    static fromWooCommerce(wcCategory) {
        return new Category({
            id: wcCategory.id,
            name: wcCategory.name,
            slug: wcCategory.slug,
            count: wcCategory.count
        });
    }
}