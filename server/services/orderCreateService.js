import getRawBody from 'raw-body';
import getMetafield from '../helpers/get-metafield.js';
import getProductTags from '../helpers/get-product-tags.js';

const orderCreateService = async (req, res, ACTIVE_SHOPIFY_SHOPS, Shopify) => {
    const ACCESS_TOKEN = ACTIVE_SHOPIFY_SHOPS[process.env.SHOP]?.accessToken;
    if (!ACCESS_TOKEN) {
        res.status(404).send('Access Token not found');
        return;
    }

    const client = new Shopify.Clients.Graphql(process.env.SHOP, ACCESS_TOKEN);

    // convert request body to json
    const buffer = await getRawBody(req);
    const body = JSON.parse(buffer.toString());

    if (body) {
        const orderDetails = {
            id: body.id,
            tags: []
        };

        if (body.tags) {
            const tags = body.tags;

            if (typeof tags === 'string') {
                orderDetails.tags = [...tags.split(',')];
            } else if (Array.isArray(tags)) {
                orderDetails.tags = [...tags];
            }
        }

        for (let item of body.line_items) {
            const isTagFound = false;

            const product_tags = await getProductTags(item, client);

            for (let product_tag of product_tags) {
                const metafield_tag = await getMetafield(client, 'order_tag', product_tag);

                if (metafield_tag) {
                    orderDetails.tags = [...orderDetails.tags, metafield_tag];
                    break;
                }
            }

            if (isTagFound) {
                break;
            }
        }

        const order_id = body.admin_graphql_api_id;

        await client.query({
            data: {
                query: `
                    mutation($order_id: ID!, $tags: [String!]) {
                        orderUpdate(input: {
                            id: $order_id
                            tags: $tags
                        }) {
                            order {
                                id
                                tags
                            }
                        }
                    }
                `,
                variables: {
                    order_id,
                    tags: [...new Set(orderDetails.tags)]
                },
            },
        });
    }

    // response to webhook with success (200 status code)
    await Shopify.Webhooks.Registry.process(req, res);
};

export default orderCreateService;
