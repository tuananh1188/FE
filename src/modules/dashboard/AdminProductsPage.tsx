import React from 'react';

const AdminProductsPage: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition">
                    + Add Product
                </button>
            </div>
            
            <div className="text-gray-500 text-center mt-20">
                <p>This is the placeholder for the product management table.</p>
                <p className="mt-2 text-sm">You can build out your product list and logic here.</p>
            </div>
        </div>
    );
};

export default AdminProductsPage;
