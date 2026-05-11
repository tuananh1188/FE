import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Tag, Input, Modal, Form, InputNumber,
    Popconfirm, message, Tooltip, Select, Spin, Upload
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Search, Pencil, Trash2, PackageOpen, RefreshCw, UploadCloud } from 'lucide-react';
import { productApi, type Product } from './api/product.api';
import { categoryApi, type Category } from '../../shared/api/category.api';

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    const fetchProducts = useCallback(async (search?: string) => {
        setLoading(true);
        try {
            const res = await productApi.getAll(search || undefined);
            setProducts(res.data.data);
        } catch {
            message.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data.data);
        } catch {
            message.error('Không thể tải danh mục');
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
        setFileList([]);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        const images = product.images ?? [];
        setFileList(images.map((url, idx) => ({
            uid: `-${idx}`,
            name: `image-${idx}`,
            status: 'done',
            url: url,
        })));

        form.setFieldsValue({
            name: product.name,
            description: product.description,
            originalPrice: Math.round(product.originalPrice * 25400),
            discount: product.discount,
            category: product.category?._id,
            stock: product.stock,
            sizes: product.sizes || [],
            colors: product.colors || [],
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await productApi.delete(id);
            message.success('Đã xóa sản phẩm thành công');
            fetchProducts(searchQuery);
        } catch {
            message.error('Không thể xóa sản phẩm');
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            if (fileList.length === 0) {
                message.error('Vui lòng tải lên ít nhất một hình ảnh');
                return;
            }

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            // Convert VND back to USD for database consistency
            const priceInUsd = values.originalPrice / 25400;
            formData.append('originalPrice', String(priceInUsd));
            formData.append('discount', String(values.discount ?? 0));
            formData.append('category', values.category);
            formData.append('stock', String(values.stock));

            // Append sizes and colors
            if (values.sizes) {
                values.sizes.forEach((s: string) => formData.append('sizes', s));
            }
            if (values.colors) {
                values.colors.forEach((c: string) => formData.append('colors', c));
            }

            // Append images (both existing URLs and new files)
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                } else if (file.url) {
                    formData.append('images', file.url);
                }
            });

            setSaving(true);
            if (editingProduct) {
                await productApi.update(editingProduct._id, formData);
                message.success('Đã cập nhật sản phẩm thành công');
            } else {
                await productApi.create(formData);
                message.success('Đã tạo sản phẩm thành công');
            }
            setModalOpen(false);
            fetchProducts(searchQuery);
        } catch (err: any) {
            let msg = err?.response?.data?.message ?? err?.message ?? 'Đã có lỗi xảy ra';
            if (err?.response?.data?.errors?.length > 0) {
                const firstError = err.response.data.errors[0];
                msg = `${firstError.field}: ${firstError.message}`;
            }
            message.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // Remove handleImagesChange as it's no longer needed for text area


    const columns: ColumnsType<Product> = [
        {
            title: '#',
            width: 48,
            render: (_v, _r, idx) => (
                <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
            ),
        },
        {
            title: 'Sản phẩm',
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
            title: 'Danh mục',
            dataIndex: 'category',
            filters: categories.map((c) => ({ text: c.name, value: c._id })),
            onFilter: (value, record) => record.category?._id === value,
            render: (cat: any) => {
                const name = typeof cat === 'string' ? cat : cat?.name;
                return (
                    <Tag className="rounded-full border-none px-3 font-medium" color="orange">
                        {name || 'Chưa phân loại'}
                    </Tag>
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (price, record) => (
                <div>
                    <span className="font-bold text-gray-800">{(price * 25400).toLocaleString('vi-VN')}đ</span>
                    {record.originalPrice > price && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                            {(record.originalPrice * 25400).toLocaleString('vi-VN')}đ
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: 'Giảm giá',
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
            title: 'Kho',
            dataIndex: 'stock',
            sorter: (a, b) => a.stock - b.stock,
            render: (stock) => (
                <span className={`font-semibold ${stock <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                    {stock}
                    {stock <= 10 && <span className="ml-1 text-xs text-red-400">(thấp)</span>}
                </span>
            ),
        },
        {
            title: 'Đã bán',
            dataIndex: 'totalSold',
            sorter: (a, b) => a.totalSold - b.totalSold,
            render: (v) => <span className="text-gray-600">{(v ?? 0).toLocaleString()}</span>,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <button
                            id={`edit-product-${record._id}`}
                            onClick={() => openEdit(record)}
                            className="p-1.5 rounded-lg text-gray-500 cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Xóa sản phẩm"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        placement="topRight"
                    >
                        <Tooltip title="Xóa">
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
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Tổng cộng {products.length} sản phẩm</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip title="Làm mới">
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
                            Thêm sản phẩm
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-5">
                    <Input
                        id="product-search"
                        allowClear
                        placeholder="Tìm kiếm theo tên hoặc mô tả…"
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
                                    <p>Không tìm thấy sản phẩm nào</p>
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
                        {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </span>
                }
                open={modalOpen}
                onOk={handleSave}
                onCancel={() => setModalOpen(false)}
                okText={editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                cancelText="Hủy"
                confirmLoading={saving}
                okButtonProps={{ className: '!bg-orange-600 hover:!bg-orange-700 !border-orange-600 text-white' }}
                width={600}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                            { min: 3, message: 'Tối thiểu 3 ký tự' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: UltraBoost Speed Runner" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mô tả' },
                            { min: 10, message: 'Tối thiểu 10 ký tự' }
                        ]}
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Mô tả ngắn gọn về sản phẩm…"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Hình ảnh sản phẩm"
                        required
                        tooltip="Tải ảnh lên từ máy tính của bạn"
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onPreview={(file) => {
                                window.open(file.url || file.thumbUrl, '_blank');
                            }}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                            beforeUpload={() => false} // Prevent automatic upload
                            multiple
                            accept="image/*"
                            id="product-image-upload"
                        >
                            {fileList.length < 5 && (
                                <div className="flex flex-col items-center">
                                    <UploadCloud size={20} className="text-gray-400 mb-1" />
                                    <div className="text-[10px] text-gray-500">Tải lên</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Giá gốc (đ)"
                            name="originalPrice"
                            rules={[{ required: true, message: 'Bắt buộc' }]}
                        >
                            <InputNumber 
                                min={0 as number} 
                                step={1000} 
                                suffix="đ" 
                                style={{ width: '100%' }} 
                                className="rounded-lg"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={(value) => Number(value!.replace(/\./g, ''))}
                            />
                        </Form.Item>

                        <Form.Item label="Giảm giá (%)" name="discount" initialValue={0}>
                            <InputNumber min={0} max={100} suffix="%" style={{ width: '100%' }} className="rounded-lg" />
                        </Form.Item>

                        <Form.Item
                            label="Danh mục"
                            name="category"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                style={{ width: '100%' }}
                                options={categories.map((c) => ({ label: c.name, value: c._id }))}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Số lượng trong kho"
                            name="stock"
                            rules={[{ required: true, message: 'Bắt buộc' }]}
                            initialValue={0}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} className="rounded-lg" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Kích cỡ hiện có"
                            name="sizes"
                            tooltip="Chọn kích cỡ hoặc nhập mới"
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="Chọn hoặc thêm kích cỡ..."
                                className="rounded-lg"
                                options={[
                                    { value: 'S', label: 'S' },
                                    { value: 'M', label: 'M' },
                                    { value: 'L', label: 'L' },
                                    { value: 'XL', label: 'XL' },
                                    { value: 'XXL', label: 'XXL' },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Màu sắc hiện có"
                            name="colors"
                            tooltip="Chọn màu sắc hoặc nhập mới"
                        >
                            <Select
                                mode="tags"
                                style={{ width: '100%' }}
                                placeholder="Chọn hoặc thêm màu sắc..."
                                className="rounded-lg"
                                options={[
                                    { value: 'Red', label: 'Đỏ' },
                                    { value: 'Blue', label: 'Xanh dương' },
                                    { value: 'White', label: 'Trắng' },
                                    { value: 'Black', label: 'Đen' },
                                    { value: 'Green', label: 'Xanh lá' },
                                    { value: 'Yellow', label: 'Vàng' },
                                ]}
                            />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default AdminProductsPage;
