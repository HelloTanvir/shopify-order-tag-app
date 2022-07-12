import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
    query getProducts($first: Int) {
        products(first: $first) {
            nodes {
                title
                id
                tags
            }
        }
    }
`;

export const UPDATE_PRODUCT = gql`
    mutation updateProduct($input: ProductInput!) {
        productUpdate(input: $input) {
            product {
                title
                id
                tags
            }
        }
    }
`;

export const CREATE_METAFIELD = gql`
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
            metafields {
                id
                key
                namespace
                value
            }
        }
    }
`;

export const GET_SHOP = gql`
    query shopDetails($namespace: String) {
        shop {
            id
            metafields(first: 10, namespace: $namespace) {
                nodes {
                    id
                    key
                    value
                }
            }
        }
    }
`;