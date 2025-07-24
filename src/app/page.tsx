"use client";
import React, { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  const [showSarah, setShowSarah] = useState(false)
  const [showDaniel, setShowDaniel] = useState(false)
  const [showEmily, setShowEmily] = useState(false)
  return (
    <main className="min-h-screen bg-blue-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-500 dark:text-white">Blue Phoenix Taekwondo Assistant</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your AI assistant for Blue Phoenix Taekwondo student management. I can help with student profiles, progress tracking, belt advancements, and program information.
          </p>
        </div>
      </div>
        {/* Persona Display Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Current Student Personas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Sarah Kim - Dropdown with slide animation */}
            <div className="bg-yellow-50 dark:bg-green-900/20 border border-yellow-200 dark:border-green-800 rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowSarah(v => !v)}>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Sarah Kim</h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">Age 7</span>
                <span className="ml-2 text-green-700 dark:text-green-300">{showSarah ? '▲' : '▼'}</span>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${showSarah ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                style={{}}
              >
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Status:</span> Enrolled Student</p>
                  <p><span className="font-medium">Belt:</span> Yellow Stripe</p>
                  <p><span className="font-medium">Parent:</span> Janice Kim (Active)</p>
                  <p><span className="font-medium">Classes:</span> 8 attended</p>
                  <p><span className="font-medium">Achievement:</span> Most Improved Student</p>
                </div>
              </div>
            </div>
            {/* Daniel Lee - Dropdown with slide animation */}
            <div className="bg-orange-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowDaniel(v => !v)}>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Daniel Lee</h3>
                <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Age 9</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">{showDaniel ? '▲' : '▼'}</span>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${showDaniel ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                style={{}}
              >
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Status:</span> Enrolled Student</p>
                  <p><span className="font-medium">Belt:</span> Orange Belt</p>
                  <p><span className="font-medium">Parent:</span> James Lee (Supportive)</p>
                  <p><span className="font-medium">Classes:</span> 15 attended</p>
                  <p><span className="font-medium">Achievement:</span> Leadership Star</p>
                </div>
              </div>
            </div>
            {/* Emily Zhang - dropdown with slide animation */}
            <div className="bg-gray-50 dark:bg-grey-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setShowEmily(v => !v)}>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Emily Zhang</h3>
                <span className="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">Age 6</span>
                <span className="ml-2 text-yellow-700 dark:text-yellow-300">{showEmily ? '▲' : '▼'}</span>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${showEmily ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  style={{}}
              >
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Status:</span> Enrolled Student</p>
                  <p><span className="font-medium">Belt:</span> White Belt</p>
                  <p><span className="font-medium">Parent:</span> Lillian Zhang (Engaged)</p>
                  <p><span className="font-medium">Classes:</span> 5 attended</p>
                  <p><span className="font-medium">Progress:</span> Steady improvement</p>
                </div>
              </div>
            </div>
          </div>

        {/* Chat Interface - Centered */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <ChatInterface />
          </div>
        </div>
      </div>
    </main>
  )
}