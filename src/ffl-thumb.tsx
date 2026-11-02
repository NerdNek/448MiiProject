import { useEffect, useState } from "react"
import { renderFeatureThumb, type ThumbPart } from "./ffl/runtime"

export function FeatureThumb({ part, index }: { part: ThumbPart; index: number }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancel = false
    void renderFeatureThumb(part, index).then((next) => {
      if (!cancel) setUrl(next)
    })
    return () => {
      cancel = true
    }
  }, [part, index])
  if (!url) return <span className="thumb-pending">{index + 1}</span>
  return <img src={url} alt="" draggable={false} />
}
