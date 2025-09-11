'use client'

import React, { useState } from 'react'
import { X, Save } from 'lucide-react'
import { CornerDotType, CornerSquareType, DotType, GradientType } from 'qr-code-styling'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface QRCodeData {
  id: string
  shortId: string
  title: string
  type: string
  content: string
  targetUrl?: string
  isActive: boolean
  size: number
  dotsStyle: DotType
  dotColor: string,
  dotColorType: 'single' | 'gradient',
  dotGradientType: GradientType,
  dotGradientRotation: number,
  dotGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },

  backgroundColor: string,
  backgroundType: 'single' | 'gradient',
  backgroundGradientType: GradientType,
  backgroundGradientRotation: number,
  backgroundGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },

  cornersSquareStyle: CornerSquareType,
  cornerSquareColorType: 'single' | 'gradient',
  cornerSquareGradientType: GradientType,
  cornerSquareGradientRotation: number,
  cornerSquareColor: string,
  cornerSquareGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },

  cornerDotStyle: CornerDotType,
  cornerDotColorType: 'single' | 'gradient',
  cornerDotColor: string,
  cornerDotGradientType: GradientType,
  cornerDotGradientRotation: number,
  cornerDotGradient: {
    type: GradientType,
    rotation: number,
    colorStops: { offset: number, color: string }[]
  },
  imageSize: number,
  errorCorrection: string
}
const DOT_TYPES: DotType[] = [
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded"
];
const CORNER_SQUARE_TYPES: CornerSquareType[] = [
  "square",
  "extra-rounded",
]

const CORNER_DOT_TYPES: CornerDotType[] = [
  "square",
  "dot",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
]
interface QREditModalProps {
  qr: QRCodeData
  onClose: () => void
  onSave: () => void
}

export function QREditModal({ qr, onClose, onSave }: QREditModalProps) {
  const [formData, setFormData] = useState({
    ...qr
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/qr/${qr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        alert('Failed to update QR code')
      }
    } catch (error) {
      console.error('Error updating QR code:', error)
      alert('Failed to update QR code')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {qr.targetUrl !== null && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <input
                type="url"
                value={formData.targetUrl}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, targetUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (QR code is scannable)
            </label>
          </div>

          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foreground Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.foregroundColor}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, foregroundColor: e.target.value }))}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.foregroundColor}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, foregroundColor: e.target.value }))}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div> */}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >

            <AccordionItem value="item-1">
              <AccordionTrigger>Dots Customization</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dot Type</label>
                    <Select value={formData.dotsStyle} onValueChange={(value) => {  setFormData(prev => ({ ...prev, dotsStyle: value as DotType })) }}>
                      <SelectTrigger className="w-full border border-gray-300">
                        <SelectValue placeholder="Select a dot type" />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-300'>
                        <SelectGroup>
                          {DOT_TYPES.map((dType, index) => {
                            return <SelectItem key={index} value={dType}>{dType}</SelectItem>
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                    <RadioGroup defaultValue="single" value={formData.dotColorType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, dotColorType: value as 'single' | 'gradient' }))}>
                      <div className="flex items-center h-full gap-3">
                        <RadioGroupItem value="single" id="r1" />
                        <Label htmlFor="r1">Single</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="gradient" id="r2" />
                        <Label htmlFor="r2">Gradient</Label>
                      </div>

                    </RadioGroup>
                  </div>
                </div>
                {formData.dotColorType == 'gradient' &&
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                      <RadioGroup defaultValue="linear" value={formData.dotGradientType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, dotGradientType: value as GradientType, dotGradient: { ...prev.dotGradient, type: value as GradientType } }))}>
                        <div className="flex items-center h-full gap-3">
                          <RadioGroupItem value="linear" id="r1" />
                          <Label htmlFor="r1">Linear</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="radial" id="r2" />
                          <Label htmlFor="r2">Radial</Label>
                        </div>

                      </RadioGroup>
                    </div>
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                      <input
                        type="number"
                        value={formData.dotGradientRotation}
                        onChange={(e) => {
                          const rotation = parseInt(e.target.value) || 0
                          setFormData(prev => ({ ...prev, dotGradientRotation: rotation, dotGradient: { ...prev.dotGradient, rotation } }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.dotColorType == 'single' && <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color  </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.dotColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, dotColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.dotColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, dotColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                  {formData.dotColorType == 'gradient' && <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color Start</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.dotGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.dotGradientType as GradientType, rotation: formData.dotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.dotGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, dotGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.dotGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.dotGradientType as GradientType, rotation: formData.dotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.dotGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, dotGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dot Color End</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.dotGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.dotGradientType as GradientType, rotation: formData.dotGradientRotation, colorStops: [{ offset: 0, color: formData.dotGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, dotGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.dotGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.dotGradientType as GradientType, rotation: formData.dotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.dotGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, dotGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div></div></>}

                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Corner Square Customization</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Type</label>
                    <Select value={formData.cornersSquareStyle} onValueChange={(value) => {  setFormData(prev => ({ ...prev, cornersSquareStyle: value as CornerSquareType })) }}>
                      <SelectTrigger className="w-full border border-gray-300">
                        <SelectValue placeholder="Select a corner type" />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-300'>
                        <SelectGroup>
                          {CORNER_SQUARE_TYPES.map((cornerType, index) => {
                            return <SelectItem key={index} value={cornerType}>{cornerType}</SelectItem>
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                    <RadioGroup defaultValue="single" value={formData.cornerSquareColorType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, cornerSquareColorType: value as 'single' | 'gradient' }))}>
                      <div className="flex items-center h-full gap-3">
                        <RadioGroupItem value="single" id="r1" />
                        <Label htmlFor="r1">Single</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="gradient" id="r2" />
                        <Label htmlFor="r2">Gradient</Label>
                      </div>

                    </RadioGroup>
                  </div>
                </div>
                {formData.cornerSquareColorType == 'gradient' &&
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                      <RadioGroup defaultValue="linear" value={formData.cornerSquareGradientType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, cornerSquareGradientType: value as GradientType, cornerSquareGradient: { ...prev.cornerSquareGradient, type: value as GradientType } }))}>
                        <div className="flex items-center h-full gap-3">
                          <RadioGroupItem value="linear" id="r1" />
                          <Label htmlFor="r1">Linear</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="radial" id="r2" />
                          <Label htmlFor="r2">Radial</Label>
                        </div>

                      </RadioGroup>
                    </div>
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                      <input
                        type="number"
                        value={formData.cornerSquareGradientRotation}
                        onChange={(e) => {
                          const rotation = parseInt(e.target.value) || 0
                          setFormData(prev => ({ ...prev, cornerSquareGradientRotation: rotation, cornerSquareGradient: { ...prev.cornerSquareGradient, rotation } }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.cornerSquareColorType == 'single' && <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color  </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.cornerSquareColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, cornerSquareColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.cornerSquareColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, cornerSquareColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                  {formData.cornerSquareColorType == 'gradient' && <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color Start</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.cornerSquareGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerSquareGradientType as GradientType, rotation: formData.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.cornerSquareGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.cornerSquareGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerSquareGradientType as GradientType, rotation: formData.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.cornerSquareGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Corner Square Color End</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.cornerSquareGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerSquareGradientType as GradientType, rotation: formData.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: formData.cornerSquareGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.cornerSquareGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerSquareGradientType as GradientType, rotation: formData.cornerSquareGradientRotation, colorStops: [{ offset: 0, color: formData.cornerSquareGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, cornerSquareGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div></div></>}

                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Corner Dot Customization</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Type</label>
                    <Select value={formData.cornerDotStyle} onValueChange={(value) => { setFormData(prev => ({ ...prev, cornerDotStyle: value as CornerDotType })) }}>
                      <SelectTrigger className="w-full border border-gray-300">
                        <SelectValue placeholder="Select a corner type" />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-300'>
                        <SelectGroup>
                          {CORNER_DOT_TYPES.map((cornerType, index) => {
                            return <SelectItem key={index} value={cornerType}>{cornerType}</SelectItem>
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                    <RadioGroup defaultValue="single" value={formData.cornerDotColorType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, cornerDotColorType: value as 'single' | 'gradient' }))}>
                      <div className="flex items-center h-full gap-3">
                        <RadioGroupItem value="single" id="r1" />
                        <Label htmlFor="r1">Single</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="gradient" id="r2" />
                        <Label htmlFor="r2">Gradient</Label>
                      </div>

                    </RadioGroup>
                  </div>
                </div>
                {formData.cornerDotColorType == 'gradient' &&
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                      <RadioGroup defaultValue="linear" value={formData.cornerDotGradientType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, cornerDotGradientType: value as GradientType, cornerDotGradient: { ...prev.cornerDotGradient, type: value as GradientType } }))}>
                        <div className="flex items-center h-full gap-3">
                          <RadioGroupItem value="linear" id="r1" />
                          <Label htmlFor="r1">Linear</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="radial" id="r2" />
                          <Label htmlFor="r2">Radial</Label>
                        </div>

                      </RadioGroup>
                    </div>
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                      <input
                        type="number"
                        value={formData.cornerDotGradientRotation}
                        onChange={(e) => {
                          const rotation = parseInt(e.target.value) || 0
                          setFormData(prev => ({ ...prev, cornerDotGradientRotation: rotation, cornerDotGradient: { ...prev.cornerDotGradient, rotation } }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.cornerDotColorType == 'single' && <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color  </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.cornerDotColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, cornerDotColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.cornerDotColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, cornerDotColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                  {formData.cornerDotColorType == 'gradient' && <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color Start</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.cornerDotGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerDotGradientType as GradientType, rotation: formData.cornerDotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.cornerDotGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, cornerDotGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.cornerDotGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerDotGradientType as GradientType, rotation: formData.cornerDotGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.cornerDotGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, cornerDotGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color End</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.cornerDotGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerDotGradientType as GradientType, rotation: formData.cornerDotGradientRotation, colorStops: [{ offset: 0, color: formData.cornerDotGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, cornerDotGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.cornerDotGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerDotGradientType as GradientType, rotation: formData.cornerDotGradientRotation, colorStops: [{ offset: 0, color: formData.cornerDotGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, cornerDotGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div></div></>}

                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Background Customization</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
                    <RadioGroup defaultValue="single" value={formData.backgroundType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, backgroundType: value as 'single' | 'gradient' }))}>
                      <div className="flex items-center h-full gap-3">
                        <RadioGroupItem value="single" id="r1" />
                        <Label htmlFor="r1">Single</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="gradient" id="r2" />
                        <Label htmlFor="r2">Gradient</Label>
                      </div>

                    </RadioGroup>
                  </div>
                </div>
                {formData.backgroundType == 'gradient' &&
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Gradient Type</label>
                      <RadioGroup defaultValue="linear" value={formData.backgroundGradientType} className='flex h-[50%]' onValueChange={(value) => setFormData(prev => ({ ...prev, backgroundGradientType: value as GradientType, backgroundGradient: { ...prev.backgroundGradient, type: value as GradientType } }))}>
                        <div className="flex items-center h-full gap-3">
                          <RadioGroupItem value="linear" id="r1" />
                          <Label htmlFor="r1">Linear</Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="radial" id="r2" />
                          <Label htmlFor="r2">Radial</Label>
                        </div>

                      </RadioGroup>
                    </div>
                    <div >
                      <label className="block text-sm font-medium text-gray-700 mb-2 ">Rotation</label>
                      <input
                        type="number"
                        value={formData.backgroundGradientRotation}
                        onChange={(e) => {
                          const rotation = parseInt(e.target.value) || 0
                          setFormData(prev => ({ ...prev, backgroundGradientRotation: rotation, backgroundGradient: { ...prev.backgroundGradient, rotation } }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.backgroundType == 'single' && <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color  </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                      />
                    </div>
                  </div>}
                  {formData.backgroundType == 'gradient' && <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Color Start</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.backgroundGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.backgroundGradientType as GradientType, rotation: formData.backgroundGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.backgroundGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, backgroundGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.backgroundGradient.colorStops[0].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.backgroundGradientType as GradientType, rotation: formData.backgroundGradientRotation, colorStops: [{ offset: 0, color: e.target.value }, { offset: 1, color: formData.backgroundGradient.colorStops[1].color }] }
                            setFormData(prev => ({ ...prev, backgroundGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Corner Dot Color End</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.backgroundGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerDotGradientType as GradientType, rotation: formData.backgroundGradientRotation, colorStops: [{ offset: 0, color: formData.backgroundGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, backgroundGradient: newGrad }))
                          }}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.cornerSquareGradient.colorStops[1].color}
                          onChange={(e) => {
                            const newGrad = { type: formData.cornerDotGradientType as GradientType, rotation: formData.backgroundGradientRotation, colorStops: [{ offset: 0, color: formData.backgroundGradient.colorStops[0].color }, { offset: 1, color: e.target.value }] }
                            setFormData(prev => ({ ...prev, backgroundGradient: newGrad }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
                        />
                      </div></div></>}

                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Error Correction</label>
            <select
              value={formData.errorCorrection}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, errorCorrection: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}