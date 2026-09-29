
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Globe, Bell, Moon, LogOut } from "lucide-react"
import { Link } from "react-router-dom"

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true)
    const [darkMode, setDarkMode] = useState(false)
    const [language, setLanguage] = useState<"en" | "gu">("en")

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="hover:bg-green-100">
                            <ArrowLeft className="w-5 h-5 text-green-700" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-green-800">Settings</h1>
                </div>

                <div className="space-y-4">
                    {/* Language Settings */}
                    <Card className="border-green-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-green-600" /> Language
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="language" className="text-gray-600">App Language</Label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setLanguage(language === "en" ? "gu" : "en")}
                                    className="w-24 border-green-200 text-green-700"
                                >
                                    {language === "en" ? "English" : "ગુજરાતી"}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400">
                                Selected: {language === "en" ? "English" : "Gujarati"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card className="border-green-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <SettingsIcon className="w-4 h-4 text-green-600" /> Preferences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-gray-500" />
                                    <Label htmlFor="notifications" className="text-gray-600">Notifications</Label>
                                </div>
                                <Switch
                                    id="notifications"
                                    checked={notifications}
                                    onCheckedChange={setNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Moon className="w-4 h-4 text-gray-500" />
                                    <Label htmlFor="darkmode" className="text-gray-600">Dark Mode</Label>
                                </div>
                                <Switch
                                    id="darkmode"
                                    checked={darkMode}
                                    onCheckedChange={setDarkMode}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account */}
                    <Card className="border-red-100 shadow-sm">
                        <CardContent className="p-4">
                            <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2 justify-center">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="text-center text-xs text-gray-400 mt-8">
                        AgriMitra v1.0.0
                    </div>
                </div>
            </div>
        </div>
    )
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
