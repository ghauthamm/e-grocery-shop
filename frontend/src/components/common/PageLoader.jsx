/**
 * PAGE LOADER COMPONENT
 * Displays loading animation while app initializes
 */

import React from 'react';
import { FaShoppingBasket } from 'react-icons/fa';

const PageLoader = ({ loading }) => {
    return (
        <div className={`page-loader ${!loading ? 'hidden' : ''}`}>
            <div className="loader-content">
                <div className="loader-logo">
                    <FaShoppingBasket />
                </div>
                <div className="loader-spinner"></div>
                <p className="loader-text">
                    Loading SRI RANGA SUPER MARKET
                    <span className="loader-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </p>
            </div>
        </div>
    );
};

export default PageLoader;
