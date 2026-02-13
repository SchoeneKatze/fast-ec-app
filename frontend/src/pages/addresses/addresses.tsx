import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Plus,
    Trash2,
    Edit3,
    Check,
} from "lucide-react";
import { useLogto } from '@logto/react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { COUNTRY_LIST } from '@/lib/countries';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface AddressItem {
    id: number;
    tag: string;
    recipient_name: string;
    phone: string;
    country_code: string;
    zip_code: string;
    address_line: string;
    is_default: boolean;
    isEditing?: boolean;
}

export default function AddressManagement() {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const { isAuthenticated, getIdTokenClaims } = useLogto();
    const [loading, setLoading] = useState(true);
    const [tag, setTag] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('China');
    const [zipcode, setZipcode] = useState('');
    const [addressLine, setAddressLine] = useState('');

    useEffect(() => {
        const fetchAddresses = async () => {
            if (isAuthenticated) {
                const claims = await getIdTokenClaims();
                if (claims) {
                    try {
                        const response = await fetch(`${BACKEND_URL}/api/getAddresses?logto_id=${claims.sub}`);
                        const data = await response.json();
                        setAddresses(data.map((addr: AddressItem) => ({ ...addr, isEditing: false })));
                    } catch (error) {
                        console.error("Error fetching addresses:", error);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        }; fetchAddresses();
    }, [isAuthenticated, getIdTokenClaims]);



    // 处理输入变化
    const handleChange = (id, field, value) => {
        setAddresses(addresses.map(addr =>
            addr.id === id ? { ...addr, [field]: value } : addr
        ));
    };

    // 切换编辑/保存状态
    const toggleEdit = (id) => {
        setAddresses(addresses.map(addr =>
            addr.id === id ? { ...addr, isEditing: !addr.isEditing } : addr
        ));
    };

    const handleSave = async (addr: AddressItem) => {
        const claims = await getIdTokenClaims();
        const isNew = typeof addr.id === 'number' && addr.id > 1000000000000; // 粗略判断是否是 Date.now() 生成的临时ID

        const url = isNew ? `${BACKEND_URL}/api/createAddress` : `${BACKEND_URL}/api/updateAddress`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...addr, logto_id: claims?.sub }),
        });

        if (response.ok) {
            alert("Saved!");
            navigate("/addresses"); // 重新拉取后端数据，获取正式的数据库 ID
        }
    };

    // 删除逻辑
    const deleteAddress = (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            setAddresses(addresses.filter(addr => addr.id !== id));
        }
    };

    // 添加新地址（上限 5 条）
    const addAddress = () => {
        if (addresses.length < 5) {
            const newAddress = {
                id: Date.now(),
                tag: "",
                name: "",
                phone: "",
                country: "China",
                zip: "",
                detail: "",
                isEditing: true
            };
            setAddresses([...addresses, newAddress]);
        }
    };

    const backToHome = () => navigate("/");

    return (
        <div className="flex flex-col h-screen bg-muted">
            {/* Fixed Header with Logo */}
            <div className="flex items-center border-b bg-background">
                <div className="flex items-center gap-2 px-4 py-3 border-r w-fit shrink-0" onClick={backToHome} style={{ cursor: 'pointer' }}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">MyShop</span>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-10">
                {/* Header */}
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Address Management</h1>
                        <p className="text-muted-foreground mt-1">Account Management / Personal information</p>
                    </div>
                    <div className="text-muted-foreground font-mono">{addresses.length} / 5</div>
                </div>

                {/* Address Cards */}
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 标签 */}
                                <div className="flex flex-col">
                                    <Label>Tag</Label>
                                    <Input
                                        value={addr.tag}
                                        readOnly={!addr.isEditing}
                                        onChange={(e) => handleChange(addr.id, 'tag', e.target.value)}
                                        placeholder="e.g. Home"
                                        className={addr.isEditing ? "" : "bg-gray-100"}
                                    />
                                </div>
                                {/* 姓名 */}
                                <div className="flex flex-col">
                                    <Label>Name</Label>
                                    <Input
                                        value={addr.name}
                                        readOnly={!addr.isEditing}
                                        onChange={(e) => handleChange(addr.id, 'name', e.target.value)}
                                        className={addr.isEditing ? "" : "bg-gray-100"}
                                    />
                                </div>
                                {/* 电话 */}
                                <div className="flex flex-col">
                                    <Label>Phone</Label>
                                    <Input
                                        value={addr.phone}
                                        readOnly={!addr.isEditing}
                                        onChange={(e) => handleChange(addr.id, 'phone', e.target.value)}
                                        className={addr.isEditing ? "" : "bg-gray-100"}
                                    />
                                </div>

                                {/* 国家选择 */}
                                <div className="flex flex-col">
                                    <Label>Country</Label>
                                    <Select
                                        disabled={!addr.isEditing}
                                        value={addr.country}
                                        onValueChange={(v) => handleChange(addr.id, 'country', v)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="China">China</SelectItem>
                                            <SelectItem value="USA">USA</SelectItem>
                                            <SelectItem value="UK">UK</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* 邮编 */}
                                <div className="flex flex-col">
                                    <Label>ZIP Code</Label>
                                    <Input
                                        value={addr.zip}
                                        readOnly={!addr.isEditing}
                                        onChange={(e) => handleChange(addr.id, 'zip', e.target.value)}
                                        className={addr.isEditing ? "" : "bg-gray-100"}
                                    />
                                </div>
                            </div>

                            {/* 详细地址 */}
                            <div className="mt-4">
                                <Label>Detailed Address</Label>
                                <Input
                                    as="textarea"
                                    value={addr.detail}
                                    readOnly={!addr.isEditing}
                                    onChange={(e) => handleChange(addr.id, 'detail', e.target.value)}
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>

                            {/* 操作按钮 */}
                            <div className="mt-4 flex justify-end gap-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteAddress(addr.id)}
                                    className="flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> Delete
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => toggleEdit(addr.id)}
                                    className="flex items-center gap-1"
                                >
                                    {addr.isEditing ? <><Check size={16} /> Save</> : <><Edit3 size={16} /> Edit</>}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Button */}
                {addresses.length < 5 && (
                    <Button
                        variant="outline"
                        className="mt-6 w-full py-3 flex items-center justify-center gap-2"
                        onClick={addAddress}
                    >
                        <Plus size={20} /> Add New Address
                    </Button>
                )}
            </div>
        </div>
    );
};