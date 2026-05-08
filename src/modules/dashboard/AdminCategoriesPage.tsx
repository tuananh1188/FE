import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Input, Modal, Form, Upload,
    Popconfirm, message, Tooltip, Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, RcFile } from 'antd/es/upload';
import { Plus, Search, Pencil, Trash2, FolderOpen, RefreshCw, LayoutGrid, ImagePlus } from 'lucide-react';
import { categoryApi, type Category } from '../../shared/api/category.api';

const AdminCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm();

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data.data);
        } catch {
            message.error('Không thể tải danh mục');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Filter categories by search query (client-side)
    const filteredCategories = categories.filter((cat) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            cat.name.toLowerCase().includes(q) ||
            cat.slug.toLowerCase().includes(q) ||
            (cat.description ?? '').toLowerCase().includes(q)
        );
    });

    const openAdd = () => {
        setEditingCategory(null);
        setFileList([]);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        // Show existing image as a preview in the file list
        if (category.image) {
            setFileList([
                {
                    uid: '-1',
                    name: 'current-image',
                    status: 'done',
                    url: category.image,
                },
            ]);
        } else {
            setFileList([]);
        }
        form.setFieldsValue({
            name: category.name,
            description: category.description ?? '',
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await categoryApi.delete(id);
            message.success('Đã xóa danh mục thành công');
            fetchCategories();
        } catch {
            message.error('Không thể xóa danh mục');
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Get the actual File object from fileList (if a new file was selected)
            const newFile = fileList.find((f) => f.originFileObj)?.originFileObj as File | undefined;

            const payload = {
                name: values.name.trim(),
                description: values.description?.trim() || undefined,
                image: newFile,
            };

            setSaving(true);
            if (editingCategory) {
                await categoryApi.update(editingCategory._id, payload);
                message.success('Đã cập nhật danh mục thành công');
            } else {
                await categoryApi.create(payload);
                message.success('Đã tạo danh mục thành công');
            }
            setModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Đã có lỗi xảy ra';
            message.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // Prevent auto-upload; we handle it ourselves via FormData
    const beforeUpload = (file: RcFile) => {
        const isImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
        if (!isImage) {
            message.error('Chỉ cho phép định dạng JPEG, PNG, WebP và GIF!');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }
        return false; // Return false to prevent auto-upload
    };

    const columns: ColumnsType<Category> = [
        {
            title: '#',
            width: 48,
            render: (_v, _r, idx) => (
                <span className="text-gray-400 text-xs font-mono">{idx + 1}</span>
            ),
        },
        {
            title: 'Danh mục',
            key: 'category',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center bg-orange-50 overflow-hidden">
                        {record.image ? (
                            <img
                                src={record.image}
                                alt={record.name}
                                className="w-full h-full object-cover"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>';
                                }}
                            />
                        ) : (
                            <LayoutGrid size={20} className="text-orange-600" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[240px]">{record.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[240px]">/{record.slug}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (desc) => (
                <span className="text-gray-600 text-sm truncate block max-w-[300px]">
                    {desc || <span className="text-gray-300 italic">Không có mô tả</span>}
                </span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            sorter: (a, b) =>
                new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
            render: (date) => (
                <span className="text-gray-500 text-sm">
                    {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
                </span>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tooltip title="Chỉnh sửa">
                        <button
                            id={`edit-category-${record._id}`}
                            onClick={() => openEdit(record)}
                            className="p-1.5 rounded-lg text-gray-500 cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                    </Tooltip>
                    <Popconfirm
                        title="Xóa danh mục"
                        description="Hành động này sẽ xóa vĩnh viễn danh mục này. Các sản phẩm đang sử dụng danh mục này sẽ không bị ảnh hưởng."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        placement="topRight"
                    >
                        <Tooltip title="Xóa">
                            <button
                                id={`delete-category-${record._id}`}
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
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
                        <p className="text-sm text-gray-400 mt-0.5">Tổng cộng {categories.length} danh mục</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip title="Làm mới">
                            <button
                                onClick={() => fetchCategories()}
                                className="p-2.5 rounded-xl border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </Tooltip>
                        <button
                            id="add-category-btn"
                            onClick={openAdd}
                            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium cursor-pointer hover:bg-orange-700 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            Thêm danh mục
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-5">
                    <Input
                        id="category-search"
                        allowClear
                        placeholder="Tìm kiếm theo tên, slug hoặc mô tả…"
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
                        dataSource={filteredCategories}
                        rowKey="_id"
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                        locale={{
                            emptyText: (
                                <div className="py-16 flex flex-col items-center text-gray-400">
                                    <FolderOpen size={40} className="mb-3 opacity-40" />
                                    <p>Không tìm thấy danh mục nào</p>
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
                        {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                    </span>
                }
                open={modalOpen}
                onOk={handleSave}
                onCancel={() => setModalOpen(false)}
                okText={editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}
                cancelText="Hủy"
                confirmLoading={saving}
                okButtonProps={{ className: '!bg-orange-600 hover:!bg-orange-700 !border-orange-600 text-white' }}
                width={500}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        label="Tên danh mục"
                        name="name"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục' },
                            { min: 2, message: 'Tối thiểu 2 ký tự' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: Điện tử, Thời trang…" className="rounded-lg" />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Mô tả ngắn gọn về danh mục này…"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item label="Hình ảnh danh mục">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                            beforeUpload={beforeUpload}
                            maxCount={1}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                        >
                            {fileList.length < 1 && (
                                <div className="flex flex-col items-center gap-1 text-gray-400">
                                    <ImagePlus size={24} />
                                    <span className="text-xs">Tải lên</span>
                                </div>
                            )}
                        </Upload>
                        <p className="text-xs text-gray-400 mt-1">
                            Định dạng JPEG, PNG, WebP hoặc GIF. Tối đa 5MB.
                        </p>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AdminCategoriesPage;
