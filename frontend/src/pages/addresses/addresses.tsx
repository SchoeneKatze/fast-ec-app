import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useLogto } from "@logto/react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { COUNTRY_LIST } from "@/lib/countries";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface AddressItem {
  id: number;
  tag: string;
  recipient_name: string;
  phone: string;
  country_code: string;
  zip_code: string;
  state?: string;
  city?: string;
  address_line: string;
  is_default: boolean;
  isEditing?: boolean;
}

export default function AddressManagement() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const { isAuthenticated, getIdTokenClaims } = useLogto();
  const [loading, setLoading] = useState(true);

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    const claims = await getIdTokenClaims();
    if (claims) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/addresses/getAddresses?logto_id=${claims.sub}`,
        );
        const data = await response.json();
        const addressArray = Array.isArray(data) ? data : data.addresses || [];
        console.log("Backend response data:", data);
        setAddresses(
          addressArray.map((addr: AddressItem) => ({
            ...addr,
            isEditing: false,
          })),
        );
      } catch (error) {
        console.error("Fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [isAuthenticated, getIdTokenClaims]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // 处理输入变化
  const handleChange = (
    id: number,
    field: keyof AddressItem,
    value: string,
  ) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr)),
    );
  };

  // 切换编辑/保存状态
  const toggleEdit = (id: number) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === id ? { ...addr, isEditing: !addr.isEditing } : addr,
      ),
    );
  };

  // 5. 前端内存新增 (先不发后端，让用户填完点 Save 再发)
  const addAddress = () => {
    if (addresses.length >= 5) return;

    const newTempAddress: AddressItem = {
      id: Date.now(), // 临时 ID
      tag: "Home",
      recipient_name: "",
      phone: "",
      country_code: "JP",
      zip_code: "",
      state: "",
      city: "",
      address_line: "",
      is_default: addresses.length === 0, // 第一条自动设为默认
      isEditing: true,
    };
    setAddresses([...addresses, newTempAddress]);
  };

  const handleSave = async (addr: AddressItem) => {
    const claims = await getIdTokenClaims();
    const isNew = typeof addr.id === "number" && addr.id > 1000000000000; // 粗略判断是否是 Date.now() 生成的临时ID

    const url = isNew
      ? `${BACKEND_URL}/addresses/addAddress`
      : `${BACKEND_URL}/addresses/updateAddress`;

    const payload = {
      ...addr,
      logto_id: claims?.sub,
      // 如果是新建，不发送临时 id 给后端
      id: isNew ? undefined : addr.id,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchAddresses(); // 刷新获取真实的数据库 ID
        toast({
          title: `Address ${isNew ? "created" : "updated"} successfully.`,
        });
      }
    } catch (error) {
      console.log("Address save failed:", error);
      toast({
        title: "Failed to save address",
      });
    }
  };

  // 删除逻辑
  const deleteAddress = async (id: number) => {
    if (id > 1000000000000) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      return;
    }

    if (window.confirm("Delete this address?")) {
      const claims = await getIdTokenClaims();
      await fetch(`${BACKEND_URL}/addresses/deleteAddress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, logto_id: claims?.sub }),
      });
      fetchAddresses();
      toast({
        title: "Address Deleted",
      });
    }
  };

  const backToHome = () => navigate("/");

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading addresses...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-muted">
      {/* Fixed Header with Logo */}
      <div className="flex items-center border-b bg-background">
        <div
          className="flex items-center gap-2 px-4 py-3 border-r w-fit shrink-0"
          onClick={backToHome}
          style={{ cursor: "pointer" }}
        >
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
            <h1 className="text-2xl font-semibold text-foreground">
              Address Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Addresses Saved: {addresses.length} / Max: 5
            </p>
          </div>
          <div className="text-muted-foreground font-mono"></div>

          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Address Cards */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 标签 */}
                <div className="flex flex-col">
                  <Label>Tag</Label>
                  <Input
                    value={addr.tag}
                    readOnly={!addr.isEditing}
                    onChange={(e) =>
                      handleChange(addr.id, "tag", e.target.value)
                    }
                    placeholder="e.g. Home"
                    className={addr.isEditing ? "" : "bg-gray-100"}
                  />
                </div>
                {/* 姓名 */}
                <div className="flex flex-col">
                  <Label>Name</Label>
                  <Input
                    value={addr.recipient_name}
                    readOnly={!addr.isEditing}
                    onChange={(e) =>
                      handleChange(addr.id, "recipient_name", e.target.value)
                    }
                    className={addr.isEditing ? "" : "bg-gray-100"}
                  />
                </div>
                {/* 电话 */}
                <div className="flex flex-col">
                  <Label>Phone</Label>
                  <Input
                    value={addr.phone}
                    readOnly={!addr.isEditing}
                    onChange={(e) =>
                      handleChange(addr.id, "phone", e.target.value)
                    }
                    className={addr.isEditing ? "" : "bg-gray-100"}
                  />
                </div>

                {/* 国家选择 */}
                <div className="flex flex-col">
                  <Label>Country</Label>
                  <Select
                    disabled={!addr.isEditing}
                    value={addr.country_code}
                    onValueChange={(v) =>
                      handleChange(addr.id, "country_code", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_LIST.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* 邮编 */}
                <div className="flex flex-col">
                  <Label>ZIP Code</Label>
                  <Input
                    value={addr.zip_code}
                    readOnly={!addr.isEditing}
                    onChange={(e) =>
                      handleChange(addr.id, "zip_code", e.target.value)
                    }
                    className={addr.isEditing ? "" : "bg-gray-100"}
                  />
                </div>

                <div className="flex flex-col">
                  <Label>City</Label>
                  <Input
                    value={addr.city || ""}
                    readOnly={!addr.isEditing}
                    onChange={(e) =>
                      handleChange(addr.id, "city", e.target.value)
                    }
                    className={addr.isEditing ? "" : "bg-gray-100"}
                  />
                </div>
              </div>

              {/* 详细地址 */}
              <div className="mt-4">
                <Label>Detailed Address</Label>
                <Textarea
                  value={addr.address_line}
                  readOnly={!addr.isEditing}
                  onChange={(e) =>
                    handleChange(addr.id, "address_line", e.target.value)
                  }
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
                  onClick={() => {
                    if (addr.isEditing) {
                      handleSave(addr);
                    } else {
                      toggleEdit(addr.id);
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  {addr.isEditing ? (
                    <>
                      <Check size={16} /> Save
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} /> Edit
                    </>
                  )}
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
}
