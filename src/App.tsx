import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"

framer.showUI({
    position: "top right",
    width: 380,
    height: 280,
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
            <h3
                style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                }}
            >
                ✨ Alt Text with AI
            </h3>

            <p
                style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    color: "#666",
                }}
            >
                {selection.length} layer selected
            </p>
        </div>

        <button
            className="framer-button-primary"
            onClick={generateAltText}
            disabled={loading}
        >
            {loading ? "Generating..." : "Generate Alt Text"}
        </button>

        <div>
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 6,
                }}
            >
                Generated Alt Text
            </div>

            <div
                style={{
                    background: "#f5f5f5",
                    border: "1px solid #e5e5e5",
                    color: "black",
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 80,
                    fontSize: 12,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                }}
            >
                {loading
                ? "🧠 Analyzing image and generating alt text..."
                : result || "Select an image and generate alt text."
                }
            </div>
        </div>

        {result && !result.startsWith("❌") && (
            <button
                onClick={() => navigator.clipboard.writeText(result)}
            >
                Copy Alt Text
            </button>
        )}
    </main>
)
}