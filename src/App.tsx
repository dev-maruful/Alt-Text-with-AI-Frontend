import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"

framer.showUI({
    position: "top right",
    width: 420,
    height: 320,
})

function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

function getImageUrl(node: CanvasNode): string | null {
    // check if property exists at runtime
    const maybeNode = node as unknown as {
        backgroundImage?: { url?: string }
    }

    const url = maybeNode.backgroundImage?.url

    if (typeof url === "string") {
        return url
    }

    return null
}

export function App() {
    const selection = useSelection()

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState("")

    const generateAltText = async () => {
        const node = selection[0]

        const imageUrl = getImageUrl(node)

        if (!imageUrl) {
            setResult("❌ Select an image frame with a background image")
            return
        }

        setLoading(true)
        setResult("")

        try {
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

            setResult(data.altText?.trim() || "No alt text returned")
        } catch (error) {
            console.error(error)
            setResult("❌ Failed to generate alt text")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main style={{ padding: 12, fontFamily: "sans-serif" }}>
            <button
                className="framer-button-primary"
                onClick={generateAltText}
                disabled={loading}
            >
                {loading ? "Generating..." : "Generate Alt Text"}
            </button>

            <div style={{ marginTop: 12, fontSize: 12 }}>
                Selected layers: {selection.length}
            </div>

            <div
                style={{
                    marginTop: 12,
                    fontSize: 12,
                    whiteSpace: "pre-wrap",
                    background: "#f5f5f5",
                    color: "#000000",
                    padding: 8,
                    borderRadius: 6,
                    minHeight: 60,
                }}
            >
                {result}
            </div>
        </main>
    )
}