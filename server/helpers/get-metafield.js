const getMetafield = async (client, namespace, key) => {
    const shop = await client.query({
        data: `{
                shop {
                    metafield(namespace:"${namespace}", key:"${key}") {
                        value
                    }
                }
            }`,
    });

    if (shop.body.data && shop.body.data.shop.metafield) {
        return shop.body.data.shop.metafield.value;
    }

    return '';
};

export default getMetafield;
