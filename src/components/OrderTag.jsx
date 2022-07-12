import { useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import Classes from '../assets/OrderTag.module.css';
import { CREATE_METAFIELD, GET_PRODUCTS, GET_SHOP, UPDATE_PRODUCT } from "../queries/queries";

export function OrderTag() {
    const product_limit = 10;

    const [tag, setTag] = useState('');
    const [checkedState, setCheckedState] = useState([...Array(product_limit)].map(i => ({
        isChecked: false,
        id: '',
        tags: []
    })));
    
    const { loading: get_products_loading, error: get_products_error, data: products_data } = useQuery(GET_PRODUCTS, {
        variables: {
            first: product_limit
        }
    });

    const { loading: get_shop_loading, error: get_shop_error, data: shop_data } = useQuery(GET_SHOP);

    const [updateProduct, { loading: update_product_loading, error: update_product_error }] = useMutation(UPDATE_PRODUCT);

    const [createMetafield, { loading: create_metafield_loading, error: create_metafield_error }] = useMutation(CREATE_METAFIELD);
    
    if (get_products_loading || get_shop_loading) return 'Loading...';
    if (update_product_loading || create_metafield_loading) return 'Updating...';
    if (get_products_error) return `Error! ${get_products_error.message}`;
    if (get_shop_error) return `Error! ${get_shop_error.message}`;
    if (update_product_error) return `Error! ${update_product_error.message}`;
    if (create_metafield_error) return `Error! ${create_metafield_error.message}`;

    const clearAll = () => {
        setTag('');
        setCheckedState(prev => prev.map(i => ({
            isChecked: false,
            id: '',
            tags: []
        })))
    }

    const handleSelect = (position, product_id, product_tags) => {
        setCheckedState(prev => {
            const newState = [...prev];

            newState[position].isChecked = !prev[position].isChecked;
            newState[position].id = product_id;
            newState[position].tags = product_tags;

            return newState;
        });
    }

    const handleTagChange = value => {
        setTag(value);
    }

    const handleClearTag = () => {
        const selectedProducts = checkedState.filter(state => state.isChecked);

        selectedProducts.forEach(product => {
            updateProduct({
                variables: {
                    input: {
                        id: product.id,
                        tags: ""
                    },
                },
            })
        })

        clearAll();
    }

    const handleSubmit = () => {
        const selectedProducts = checkedState.filter(state => state.isChecked);

        selectedProducts.forEach(product => {
            updateProduct({
                variables: {
                    input: {
                        id: product.id,
                        tags: tag ? [...new Set([...product.tags, tag])] : product.tags
                    },
                },
            })
        })

        createMetafield({
            variables: {
                metafields: [
                    {
                        ownerId: shop_data.shop.id,
                        key: tag,
                        value: tag,
                        namespace: 'order_tag',
                        type: 'single_line_text_field',
                    },
                ],
            },
        });

        clearAll();
    }

    const products = products_data.products.nodes;
    
    return (
        <div className={Classes.app_page}>
            <table className={Classes.products_table}>
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Product Title</th>
                        <th>Product Tags</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        products.map((product, index) => (
                            <tr key={product.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        name={product.title}
                                        id={product.id}
                                        checked={checkedState[index].isChecked}
                                        onChange={() => handleSelect(index, product.id, product.tags)}
                                    />
                                </td>

                                <td
                                    className={`${checkedState[index].isChecked && Classes.product_title_selected} ${Classes.product_title}`}
                                >
                                    {product.title}
                                </td>

                                <td>
                                    <div className={Classes.product_tags}>
                                        {
                                            product.tags.map((tag, index) => (
                                                <span key={index}>
                                                    {
                                                        index == product.tags.length - 1 ? tag : `${tag} ,`
                                                    }
                                                </span>
                                            ))
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            {/* tag input */}
            <div className={Classes.tag_wrapper}>
                <span>Enter the tag:</span>
                <input
                    type="text"
                    value={tag}
                    onChange={e => handleTagChange(e.target.value)}
                />
            </div>

            {/* buttons */}
            <div className={Classes.buttons_wrapper}>
                {/* clear button */}
                <button
                    className={Classes.clear_btn}
                    type="button"
                    onClick={handleClearTag}
                >
                    Clear tags
                </button>

                {/* submit button */}
                <button
                    className={Classes.submit_btn}
                    type="button"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}