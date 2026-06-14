import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"

framer.showUI({
  position: "top right",
  width: 400,
  height: 500,
})

function useSelection() {
  const [selection, setSelection] = useState<CanvasNode[]>([])

  useEffect(() => {
    return framer.subscribeToSelection(setSelection)
  }, [])

  return selection
}

export function App() {
  const selection = useSelection()
  const [nodeInfo, setNodeInfo] = useState("")

  const inspectSelection = () => {
    if (selection.length === 0) {
      setNodeInfo("Nothing selected")
      return
    }

    const node = selection[0]

    console.log(node)

    setNodeInfo(JSON.stringify(node, null, 2))
  }

  return (
    <main style={{ padding: 12 }}>
      <button
        className="framer-button-primary"
        onClick={inspectSelection}
      >
        Inspect Selection
      </button>

      <pre
        style={{
          marginTop: 12,
          fontSize: 10,
          overflow: "auto",
          maxHeight: 400,
          whiteSpace: "pre-wrap",
        }}
      >
        {nodeInfo}
      </pre>
    </main>
  )
}