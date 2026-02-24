import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Save,
  Bell,
  Shield,
  // Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  // Upload,
  User,
  ArrowLeft,
  CalendarIcon,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader /*CardTitle*/,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLogto } from "@logto/react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
// import "./settings.css"

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, /*fetchUserInfo,*/ getIdTokenClaims } = useLogto();
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    // push: false,
    // sms: false,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const claims = await getIdTokenClaims();
        if (claims?.sub) {
          const res = await fetch(
            `${BACKEND_URL}/auth/me?logto_id=${claims.sub}`,
          );
          if (res.ok) {
            const user_me = await res.json();
            setNickname(user_me.nickname || "");
            setGender(user_me.gender || "male");
            setEmail(user_me.email || "");
            setPhone(user_me.phone_no || "");
            if (user_me.birthday) setBirthday(new Date(user_me.birthday));
          }
        }
      } catch (err) {
        console.error("Failed to load user data", err);
        toast({
          title: "Failed to load user data",
        });
      }
    };

    if (isAuthenticated) initData();
  }, [isAuthenticated, getIdTokenClaims, BACKEND_URL]);

  const updateUser = async () => {
    if (isAuthenticated) {
      try {
        const claims = await getIdTokenClaims();
        console.log("Logto claims:", claims);

        if (claims) {
          const response = await fetch(`${BACKEND_URL}/auth/updateUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              logto_id: claims.sub,
              nickname: nickname,
              gender: gender,
              birthday: birthday ? format(birthday, "yyyy-MM-dd") : null,
              phone_no: phone,
            }),
          });

          if (response.ok) {
            const responseUserJsonFromBackend = await response.json();
            console.log(responseUserJsonFromBackend);

            navigate("/settings");
            toast({
            title: "User data updated successfully",
          });
          }
        }
      } catch (error) {
        console.log("Password update failed", error);
        toast({
          title: "Failed to update user data",
        });
      }
    }
  };

  const updatePassword = async () => {
    if (isAuthenticated) {
      if (newPassword == confirmPassword) {
        if (newPassword == currentPassword)
          alert("New password cannot be the same as current password!");
        else {
          try {
            const claims = await getIdTokenClaims();
            // console.log("Logto claims:", claims);
            if (claims) {
              const updatePasswordResponse = await fetch(
                `${BACKEND_URL}/auth/updatePassword`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    logto_id: claims.sub,
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                  }),
                },
              );

              const updatePasswordResult = await updatePasswordResponse.json();
              if (updatePasswordResponse.ok) {
                alert("Password updated successfully!");
                // Clear password fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                navigate("/settings");
                toast({
                  title: "Password updated successfully",
                });
              } else {
                console.log(
                  `Password update failed: ${updatePasswordResult.message}`,
                );
                toast({
                  title: "Failed to update password",
                  description: `Failed to update password: ${updatePasswordResult.message}`,
                });
              }
            }
          } catch (error) {
            console.log("User update failed", error);
          }
        }
      } else {
        alert("New passwords do not match!");
      }
    }
  };

  const backToHome = () => navigate("/");

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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Account Management</p>
          </div>
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="space-y-8">
          {/* ===== Profile Section ===== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Profile Information
              </h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>Personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="text-lg">AE</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Birthday</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-transparent",
                            !birthday && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthday
                            ? format(birthday, "yyyy-MM-dd")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={birthday}
                          onSelect={setBirthday}
                          captionLayout="dropdown"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          defaultMonth={birthday ?? new Date(2000, 0)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    defaultValue="Product manager passionate about automation and workflow optimization."
                    rows={3}
                  />
                </div> */}

                <div className="flex justify-start">
                  <Button className="gap-2" onClick={updateUser}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ===== Notifications Section ===== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Notification Preferences
              </h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>Choose how to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">
                    Notification Channels
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Email Notifications</div>
                          <div className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </div>
                        </div>
                      </div>
                      <Switch
                        className="data-[state=checked]:bg-green-500"
                        checked={notifications.email}
                        onCheckedChange={(value) =>
                          handleNotificationChange("email", value)
                        }
                      />
                    </div>
                    {/* 
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Push Notifications</div>
                          <div className="text-sm text-muted-foreground">
                            Receive browser push notifications
                          </div>
                        </div>
                      </div>
                      <Switch
                        className="data-[state=checked]:bg-[#10b981] data-[state=unchecked]:bg-gray-200"
                        checked={notifications.push}
                        onCheckedChange={(value) =>
                          handleNotificationChange("push", value)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">SMS Notifications</div>
                          <div className="text-sm text-muted-foreground">
                            Receive text message alerts
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(value) =>
                          handleNotificationChange("sms", value)
                        }
                      />
                    </div> */}
                  </div>
                </div>

                {/* <div className="flex justify-start">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* ===== Security Section ===== */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">
                Security Settings
              </h2>
            </div>
            <Card>
              <CardHeader>
                <CardDescription>
                  Account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-foreground">Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>

                    <Button className="gap-2" onClick={updatePassword}>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
