import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Tag, Input, Modal, Form, InputNumber,
    Popconfirm, message, Tooltip, Select, Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Search, Pencil, Trash2, PackageOpen, RefreshCw } from 'lucide-react';
import { productApi, type Product, type ProductPayload } from './api/product.api';
import { categoryApi, type Category } from '../../shared/api/category.api';

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [form] = Form.useForm();

    const fetchProducts = useCallback(async (search?: string) => {
        setLoading(true);
        try {
            const res = await productApi.getAll(search || undefined);
            setProducts(res.data.data);
        } catch {
            message.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data.data);
        } catch {
            message.error('Failed to load categories');
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);


    useEffect(() => {
        const t = setTimeout(() => fetchProducts(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery, fetchProducts]);


    const openAdd = () => {
        setEditingProduct(null);
        setPreviewUrls([]);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setPreviewUrls(product.images ?? []);
        form.setFieldsValue({
            name: product.name,
            description: product.description,
            originalPrice: product.originalPrice,
            discount: product.discount,
            category: product.category?._id, // Set the category ID as the value
            images: (product.images ?? []).join('\n'),
            stock: product.stock,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await productApi.delete(id);
            message.success('Product deleted successfully');
            fetchProducts(searchQuery);
        } catch {
            message.error('Failed to delete product');
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Parse newline-separated image URLs → array
            const images: string[] = (values.images as string)
                .split('\n')
                .map((s: string) => s.trim())
                .filter(Boolean);

            if (images.length === 0) {
                message.error('Please provide at least one image URL');
                return;
            }

            const payload: ProductPayload = {
                name: values.name,
                description: values.description,
                originalPrice: values.originalPrice,
                discount: values.discount ?? 0,
                category: values.category,
                images,
                stock: values.stock,
            };

            setSaving(true);
            if (editingProduct) {
                await productApi.update(editingProduct._id, payload);
                message.success('Product updated successfully');
            } else {
                await productApi.create(payload);
                message.success('Product created successfully');
            }
            setModalOpen(false);
            fetchProducts(searchQuery);
        } catch (err: any) {
            let msg = err?.response?.data?.message ?? err?.message ?? 'Something went wrong';

            // Handle validation errors from backend
            if (err?.response?.data?.errors?.length > 0) {
                const firstError = err.response.data.errors[0];
                msg = `${firstError.field}: ${firstError.message}`;
            }

            message.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const urls = e.target.value
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        setPreviewUrls(urls);
    };


    const columns: ColumnsType<Product> = [
        {
            title: '#',
            width: 48,
            render: (_v, _r, idx) => (
                <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
            ),
        },
        {
            title: 'Product',
            key: 'product',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <img
                        src={record.images?.[0] ?? 'https://placehold.co/48x48?text=No+Img'}
                        alt={record.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=No+Img';
                        }}
                    />
                    <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[180px]">{record.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{record.description}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            filters: categories.map((c) => ({ text: c.name, value: c._id })),
            onFilter: (value, record) => record.category?._id === value,
            render: (cat: any) => {
                const name = typeof cat === 'string' ? cat : cat?.name;
                return (
                    <Tag className="rounded-full border-none px-3 font-medium" color="orange">
                        {name || 'No Category'}
                    </Tag>
                );
            },
        },
        {
            title: 'Price',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price, record) => (
                <div>
                    <span className="font-bold text-gray-800">${price?.toFixed(2)}</span>
                    {record.originalPrice > price && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                            ${record.originalPrice?.toFixed(2)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            sorter: (a, b) => (a.discount ?? 0) - (b.discount ?? 0),
            render: (disc) =>
                disc > 0 ? (
                    <Tag color="red" className="rounded-full border-none font-semibold">-{disc}%</Tag>
                ) : (
                    <span className="text-gray-400">—</span>
                ),
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            sorter: (a, b) => a.stock - b.stock,
            render: (stock) => (
                <span className={`font-semibold ${stock <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                    {stock}
                    {stock <= 10 && <span className="ml-1 text-xs text-red-400">(low)</span>}
                </span>
            ),
        },
        {
            title: 'Sold',
            dataIndex: 'totalSold',
            sorter: (a, b) => a.totalSold - b.totalSold,
            render: (v) => <span className="text-gray-600">{(v ?? 0).toLocaleString()}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tooltip title="Edit">
                        <button
                            id={`edit-product-${record._id}`}
                            onClick={() => openEdit(record)}
                            className="p-1.5 rounded-lg text-gray-500 cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Delete product"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        placement="topRight"
                    >
                        <Tooltip title="Delete">
                            <button
                                id={`delete-product-${record._id}`}
                                className="p-1.5 rounded-lg text-gray-500 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[600px]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                        <p className="text-sm text-gray-400 mt-0.5">{products.length} products total</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip title="Refresh">
                            <button
                                onClick={() => fetchProducts(searchQuery)}
                                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </Tooltip>
                        <button
                            id="add-product-btn"
                            onClick={openAdd}
                            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium cursor-pointer hover:bg-orange-700 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-5">
                    <Input
                        id="product-search"
                        allowClear
                        placeholder="Search by name or description…"
                        prefix={<Search size={16} className="text-gray-400 mr-1" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm rounded-xl"
                    />
                </div>

                {/* Table */}
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={products}
                        rowKey="_id"
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                        locale={{
                            emptyText: (
                                <div className="py-16 flex flex-col items-center text-gray-400">
                                    <PackageOpen size={40} className="mb-3 opacity-40" />
                                    <p>No products found</p>
                                </div>
                            ),
                        }}
                        className="custom-table"
                    />
                </Spin>
            </div>

            {/* Add / Edit Modal */}
            <Modal
                title={
                    <span className="text-lg font-bold text-gray-800">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </span>
                }
                open={modalOpen}
                onOk={handleSave}
                onCancel={() => setModalOpen(false)}
                okText={editingProduct ? 'Save Changes' : 'Add Product'}
                cancelText="Cancel"
                confirmLoading={saving}
                okButtonProps={{ className: '!bg-orange-600 hover:!bg-orange-700 !border-orange-600 text-white' }}
                width={600}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        label="Product Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Please enter product name' },
                            { min: 3, message: 'Min 3 characters' }
                        ]}
                    >
                        <Input placeholder="e.g. UltraBoost Speed Runner" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            { required: true, message: 'Please enter description' },
                            { min: 10, message: 'Min 10 characters' }
                        ]}
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Short product description…"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Images (one URL per line)"
                        name="images"
                        rules={[{ required: true, message: 'Please provide at least one image URL' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                            className="rounded-lg font-mono text-xs"
                            onChange={handleImagesChange}
                        />
                    </Form.Item>

                    {/* Image previews */}
                    {previewUrls.length > 0 && (
                        <div className="flex gap-2 mb-4 -mt-2 flex-wrap">
                            {previewUrls.map((url, i) => (
                                <img
                                    key={i}
                                    src={url}
                                    alt={`preview-${i}`}
                                    className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                    crossOrigin="anonymous"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Original Price ($)"
                            name="originalPrice"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <InputNumber min={0} step={0.01} prefix="$" className="w-full rounded-lg" />
                        </Form.Item>

                        <Form.Item label="Discount (%)" name="discount" initialValue={0}>
                            <InputNumber min={0} max={100} suffix="%" className="w-full rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            label="Category"
                            name="category"
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select
                                placeholder="Select category"
                                className="w-full"
                                options={categories.map((c) => ({ label: c.name, value: c._id }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Stock"
                            name="stock"
                            rules={[{ required: true, message: 'Required' }]}
                            initialValue={0}
                        >
                            <InputNumber min={0} className="w-full rounded-lg" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default AdminProductsPage;
