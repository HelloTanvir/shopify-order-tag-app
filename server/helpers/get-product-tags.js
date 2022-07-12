const getProductTags = async (item, client) => {
    const product_id = `gid://shopify/Product/${item.product_id}`;

    const product = await client.query({
        data: {
            query: `
                query GetProduct($product_id: ID!) {
                    product(id: $product_id) {
                        tags
                    }
                }
            `,
            variables: {
                product_id
            },
        },
    });

    let product_tags = product.body.data.product.tags;

    if (typeof product_tags === 'string') {
        return [...product_tags.split(',')]
    } else if (Array.isArray(product_tags)) {
        return [...product_tags];
    }

    return product_tags;
}

export default getProductTags;