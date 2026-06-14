import { framer } from "framer-plugin"
import { useState } from "react"
import "./App.css"

framer.showUI({
  position: "top right",
  width: 240,
  height: 95,
})

export function App() {
  const [result, setResult] = useState("")

  const testServer = async () => {
    try {
      const response = await fetch("http://localhost:3000")

      const text = await response.text()

      setResult(text)
    } catch (error) {
      console.error(error)
      setResult("Failed to connect")
    }
  }

  return (
    <main>
      <button
        className="framer-button-primary"
        onClick={testServer}
      >
        Test Server
      </button>

      <p>{result}</p>
    </main>
  )
}
