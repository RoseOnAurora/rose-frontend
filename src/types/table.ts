import { ReactNode } from "react"

export interface Field {
  label: string
  valueRaw: string
  valueComponent?: ReactNode
  tooltip?: ReactNode
}
