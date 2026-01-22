/**
 * SignatureCapture Component
 * Allows users to draw or type their signature
 * Based on the legacy sign.html implementation
 */
import { useRef, useState, useEffect, useCallback } from 'react'

interface SignatureCaptureProps {
    onSignatureChange: (hasSignature: boolean, signatureData: string | null) => void
    signerName?: string
}

type SignatureMode = 'draw' | 'type'
type FontOption = 'Dancing Script' | 'Great Vibes' | 'Alex Brush'

export function SignatureCapture({ onSignatureChange, signerName = '' }: SignatureCaptureProps) {
    const [mode, setMode] = useState<SignatureMode>('draw')
    const [typedName, setTypedName] = useState(signerName)
    const [selectedFont, setSelectedFont] = useState<FontOption>('Great Vibes')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const typedCanvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const lastPosRef = useRef({ x: 0, y: 0 })
    const hasDrawnRef = useRef(false)

    // Initialize draw canvas
    useEffect(() => {
        if (mode === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current
            const container = canvas.parentElement
            if (container) {
                canvas.width = container.offsetWidth
                canvas.height = container.offsetHeight
            }
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.lineJoin = 'round'
                ctx.lineCap = 'round'
                ctx.lineWidth = 3
                ctx.strokeStyle = '#000000'
            }
        }
    }, [mode])

    // Initialize typed canvas and render typed signature
    useEffect(() => {
        if (mode === 'type' && typedCanvasRef.current) {
            const canvas = typedCanvasRef.current
            const container = canvas.parentElement
            if (container) {
                canvas.width = container.offsetWidth
                canvas.height = 128
            }
            renderTypedSignature()
        }
    }, [mode, typedName, selectedFont])

    // Update parent when signature changes
    useEffect(() => {
        if (mode === 'draw') {
            onSignatureChange(hasDrawnRef.current, hasDrawnRef.current ? getDrawnSignatureData() : null)
        } else {
            const hasTyped = typedName.trim().length >= 2
            onSignatureChange(hasTyped, hasTyped ? getTypedSignatureData() : null)
        }
    }, [mode, typedName])

    const renderTypedSignature = () => {
        const canvas = typedCanvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const text = typedName.trim()
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        if (text) {
            let fontSize = 60
            ctx.font = `${fontSize}px "${selectedFont}", cursive`
            let textWidth = ctx.measureText(text).width

            while (textWidth > canvas.width - 40 && fontSize > 20) {
                fontSize -= 2
                ctx.font = `${fontSize}px "${selectedFont}", cursive`
                textWidth = ctx.measureText(text).width
            }

            ctx.fillStyle = '#000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(text, canvas.width / 2, canvas.height / 2)
        }
    }

    const getDrawnSignatureData = (): string | null => {
        if (!canvasRef.current) return null
        return canvasRef.current.toDataURL('image/png')
    }

    const getTypedSignatureData = (): string | null => {
        if (!typedCanvasRef.current) return null
        return typedCanvasRef.current.toDataURL('image/png')
    }

    const getXY = (e: MouseEvent | TouchEvent): [number, number] => {
        const canvas = canvasRef.current
        if (!canvas) return [0, 0]

        const rect = canvas.getBoundingClientRect()
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        return [clientX - rect.left, clientY - rect.top]
    }

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault()
        setIsDrawing(true)
        const canvas = canvasRef.current
        if (!canvas) return

        const [x, y] = getXY(e.nativeEvent as MouseEvent | TouchEvent)
        lastPosRef.current = { x, y }
    }, [])

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        e.preventDefault()

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const [x, y] = getXY(e.nativeEvent as MouseEvent | TouchEvent)

        ctx.beginPath()
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
        ctx.lineTo(x, y)
        ctx.stroke()

        lastPosRef.current = { x, y }
        hasDrawnRef.current = true
        onSignatureChange(true, getDrawnSignatureData())
    }, [isDrawing, onSignatureChange])

    const stopDrawing = useCallback(() => {
        setIsDrawing(false)
    }, [])

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            hasDrawnRef.current = false
            onSignatureChange(false, null)
        }
    }

    const fontOptions: { name: FontOption; label: string }[] = [
        { name: 'Dancing Script', label: 'Script' },
        { name: 'Great Vibes', label: 'Elegant' },
        { name: 'Alex Brush', label: 'Classic' }
    ]

    return (
        <div className="signature-capture">
            {/* Mode Tabs */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <button
                    type="button"
                    onClick={() => setMode('draw')}
                    style={{
                        flex: 1,
                        height: '56px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        border: '2px solid',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        ...(mode === 'draw' ? {
                            background: 'linear-gradient(135deg, #C8A951, #D4AF37)',
                            color: '#0f172a',
                            borderColor: '#C8A951',
                            boxShadow: '0 0 20px rgba(200, 169, 81, 0.4)',
                            transform: 'translateY(-2px)'
                        } : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#e2e8f0',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        })
                    }}
                >
                    <span>✍️</span> Draw
                </button>
                <button
                    type="button"
                    onClick={() => setMode('type')}
                    style={{
                        flex: 1,
                        height: '56px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        border: '2px solid',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        ...(mode === 'type' ? {
                            background: 'linear-gradient(135deg, #C8A951, #D4AF37)',
                            color: '#0f172a',
                            borderColor: '#C8A951',
                            boxShadow: '0 0 20px rgba(200, 169, 81, 0.4)',
                            transform: 'translateY(-2px)'
                        } : {
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#e2e8f0',
                            borderColor: 'rgba(255, 255, 255, 0.1)'
                        })
                    }}
                >
                    <span>⌨️</span> Type
                </button>
            </div>

            {/* Draw Panel */}
            {mode === 'draw' && (
                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'relative',
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: '200px',
                        border: '2px solid rgba(200, 169, 81, 0.5)',
                        transition: 'border-color 0.3s ease'
                    }}>
                        <canvas
                            ref={canvasRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                cursor: 'crosshair',
                                touchAction: 'none'
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        {/* Clear Button */}
                        <button
                            type="button"
                            onClick={clearCanvas}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '8px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Clear
                        </button>
                        {/* Helper Text */}
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}>
                            <span style={{
                                fontSize: '10px',
                                color: '#9ca3af',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>Sign within the box</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Type Panel */}
            {mode === 'type' && (
                <div>
                    <input
                        type="text"
                        value={typedName}
                        onChange={(e) => {
                            setTypedName(e.target.value)
                            const hasTyped = e.target.value.trim().length >= 2
                            onSignatureChange(hasTyped, hasTyped ? getTypedSignatureData() : null)
                        }}
                        placeholder="Type your full legal name"
                        maxLength={50}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '24px',
                            fontFamily: "'Cinzel', serif",
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'border-color 0.3s ease'
                        }}
                    />

                    {/* Signature Preview */}
                    <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid rgba(200, 169, 81, 0.3)'
                    }}>
                        <p style={{
                            fontSize: '10px',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            textAlign: 'center',
                            marginBottom: '12px'
                        }}>Preview</p>
                        <div style={{ position: 'relative' }}>
                            <canvas
                                ref={typedCanvasRef}
                                style={{
                                    width: '100%',
                                    height: '128px',
                                    background: 'white',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Font Options */}
                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        {fontOptions.map((font) => (
                            <button
                                key={font.name}
                                type="button"
                                onClick={() => setSelectedFont(font.name)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    fontSize: '16px',
                                    fontFamily: `"${font.name}", cursive`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    ...(selectedFont === font.name ? {
                                        background: 'rgba(200, 169, 81, 0.2)',
                                        borderColor: '#C8A951',
                                        color: '#C8A951'
                                    } : {
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        color: '#9ca3af'
                                    })
                                }}
                            >
                                {font.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
