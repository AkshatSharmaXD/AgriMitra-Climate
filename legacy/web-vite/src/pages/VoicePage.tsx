
import { useState } from "react"
import { Button } from "@/components/ui/button"

import { ArrowLeft, Mic, MicOff } from "lucide-react"
import { Link } from "react-router-dom"

export default function VoicePage() {
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: 'Namaste! I am your Agri Assistant. Ask me anything about your crops.' }
    ])

    const startListening = () => {
        setIsListening(true)
        // Simulation of voice input
        setTimeout(() => {
            setIsListening(false)
            addMessage('user', 'What is the price of Cotton today?')
            setTimeout(() => {
                addMessage('bot', 'The average price of Cotton in your region is ₹5,800 per quintal.')
            }, 1000)
        }, 3000)
    }

    const addMessage = (role: 'user' | 'bot', text: string) => {
        setMessages(prev => [...prev, { role, text }])
    }

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Link to="/">
                    <Button variant="ghost" size="icon" className="hover:bg-green-100">
                        <ArrowLeft className="w-5 h-5 text-green-700" />
                    </Button>
                </Link>
                <h1 className="text-xl font-bold text-green-800">Voice Assistant</h1>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-20">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-green-100 rounded-bl-none shadow-sm'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isListening && (
                    <div className="flex justify-center">
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm animate-pulse">
                            Listening...
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-green-50 to-transparent">
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className={`w-16 h-16 rounded-full shadow-xl transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        onClick={startListening}
                    >
                        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </Button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-4">
                    Tap to speak • English & Gujarati supported
                </p>
            </div>
        </div>
    )
}
