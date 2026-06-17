import { framer, CanvasNode, useIsAllowedTo } from "framer-plugin"
import type { ImageAsset } from "framer-plugin"
import { useState, useEffect } from "react"

framer.showUI({
    position: "top right",
    width: 380,
    height: 300,
})

function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

type ImageAssetWithClone = ImageAsset & {
    cloneWithAttributes: (args: {
        altText?: string
        resolution?: string
    }) => ImageAsset
}

function getImageAsset(node: CanvasNode): ImageAssetWithClone | null {
    const maybeNode = node as {
        backgroundImage?: ImageAssetWithClone
    }

    return maybeNode.backgroundImage || null
}

export function App() {
    const selection = useSelection()
    const canSetAttributes = useIsAllowedTo("setAttributes")

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState("")

    const generateAltText = async () => {
        const node = selection[0]

        if (!node) {
            setResult("❌ No layer selected")
            return
        }

        const image = getImageAsset(node)
        const imageUrl = image?.url

        if (!image || !imageUrl) {
            setResult("❌ Select a frame with an image")
            return
        }

        if (!canSetAttributes) {
            setResult("❌ Missing permission: setAttributes")
            return
        }

        setLoading(true)

        try {
            // 1. Call backend
            const response = await fetch(
                "http://localhost:3000/generate-alt-text",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageUrl }),
                }
            )

            const data = await response.json()
            const altText = data.altText?.trim()

            if (!altText) {
                setResult("❌ No alt text generated")
                return
            }

            // 2. update UI FIRST (important for responsiveness)
            setResult(altText)

            // 3. clone image asset
            const newImageAsset = image.cloneWithAttributes({
                altText,
            })

            // 4. write back to framer
            await framer.setAttributes(node.id, {
                backgroundImage: newImageAsset,
            })

        } catch (error) {
            console.error(error)
            setResult("❌ Failed to generate alt text")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main
            style={{
                padding: 16,
                fontFamily: "Inter, sans-serif",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>
                    ✨ Alt Text with AI
                </h3>

                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
                    {selection.length} layer selected
                </p>
            </div>

            <button
                className="framer-button-primary"
                onClick={generateAltText}
                disabled={loading}
            >
                {loading ? "Generating..." : "Generate & Save Alt Text"}
            </button>

            <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Result
                </div>

                <div
                    style={{
                        background: "#f5f5f5",
                        color: "#000",
                        border: "1px solid #e5e5e5",
                        borderRadius: 8,
                        padding: 10,
                        minHeight: 70,
                        fontSize: 12,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {loading
                        ? "🧠 Generating and saving alt text..."
                        : result || "Select an image and generate alt text."
                    }
                </div>
            </div>

            {result && !result.startsWith("❌") && (
                <button
                    onClick={() =>
                        navigator.clipboard.writeText(result)
                    }
                >
                    Copy Alt Text
                </button>
            )}
        </main>
    )
}